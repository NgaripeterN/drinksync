const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Helper function to get Mpesa access token
const getMpesaAccessToken = async () => {
    const consumerKey = process.env.DARAJA_CONSUMER_KEY;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    // Remove trailing slash from base URL if present
    const baseURL = process.env.DARAJA_BASE_URL.replace(/\/$/, '');

    try {
        const response = await axios.get(
            `${baseURL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Mpesa access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get Mpesa access token');
    }
};

exports.createOrder = async (req, res) => {
    let { branch_id, items, phoneNumber } = req.body;
    const user_id = req.user.id; // From authenticateToken middleware

    // Sanitize phone number: Remove +, and convert 07... to 2547...
    phoneNumber = phoneNumber.replace(/\+/g, '');
    if (phoneNumber.startsWith('0')) {
        phoneNumber = '254' + phoneNumber.slice(1);
    } else if (phoneNumber.startsWith('7') || phoneNumber.startsWith('1')) {
        phoneNumber = '254' + phoneNumber;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let totalAmount = 0;
        // Validate items and calculate total amount
        for (const item of items) {
            const drinkResult = await client.query('SELECT price FROM drinks WHERE id = $1', [item.drink_id]);
            if (drinkResult.rows.length === 0) {
                throw new Error(`Drink with ID ${item.drink_id} not found`);
            }
            const drinkPrice = parseFloat(drinkResult.rows[0].price);
            totalAmount += drinkPrice * item.quantity;
        }

        // Create the order
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, branch_id, total_amount) VALUES ($1, $2, $3) RETURNING id, total_amount',
            [user_id, branch_id, totalAmount]
        );
        const order = orderResult.rows[0];

        // Add order items and update inventory
        for (const item of items) {
            await client.query(
                'INSERT INTO order_items (order_id, drink_id, quantity, price_at_order) VALUES ($1, $2, $3, (SELECT price FROM drinks WHERE id = $2))',
                [order.id, item.drink_id, item.quantity]
            );

            // Deduct stock from branch inventory
            const updateInventoryResult = await client.query(
                'UPDATE inventory SET stock = stock - $1 WHERE branch_id = $2 AND drink_id = $3 RETURNING stock',
                [item.quantity, branch_id, item.drink_id]
            );

            if (updateInventoryResult.rows.length === 0 || updateInventoryResult.rows[0].stock < 0) {
                throw new Error(`Insufficient stock for drink ID ${item.drink_id} at branch ID ${branch_id}`);
            }
        }

        // Mpesa STK Push
        const accessToken = await getMpesaAccessToken();
        const shortCode = process.env.DARAJA_SHORTCODE;
        const passkey = process.env.DARAJA_PASSKEY;
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
        const transactionType = 'CustomerPayBillOnline';
        const amount = Math.ceil(totalAmount);
        const partyA = phoneNumber;
        const partyB = shortCode;
        const callBackURL = process.env.DARAJA_CALLBACK_URL;
        const accountReference = `DrinkSync-${branch_id}`;
        const transactionDesc = `Order ${order.id} from branch ${branch_id}`;

        const baseURL = process.env.DARAJA_BASE_URL.replace(/\/$/, '');
        const stkPushResponse = await axios.post(
            `${baseURL}/mpesa/stkpush/v1/processrequest`,
            {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: transactionType,
                Amount: amount,
                PartyA: partyA,
                PartyB: partyB,
                PhoneNumber: partyA,
                CallBackURL: callBackURL,
                AccountReference: accountReference,
                TransactionDesc: transactionDesc,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (stkPushResponse.data.ResponseCode === '0') {
            await client.query(
                'UPDATE orders SET checkout_request_id = $1 WHERE id = $2',
                [stkPushResponse.data.CheckoutRequestID, order.id]
            );
            await client.query('COMMIT');
            res.status(202).json({
                message: 'STK Push initiated successfully',
                checkoutRequestID: stkPushResponse.data.CheckoutRequestID,
                customerMessage: stkPushResponse.data.CustomerMessage,
                orderId: order.id,
            });
        } else {
            throw new Error(`STK Push failed: ${stkPushResponse.data.ResponseDescription}`);
        }

    } catch (error) {
        await client.query('ROLLBACK');
        
        // Detailed logging for Daraja API errors
        if (error.response) {
            console.error('Daraja API Error Response:', error.response.data);
            return res.status(error.response.status || 500).json({
                message: error.response.data.errorMessage || error.response.data.ResponseDescription || 'M-Pesa API error',
                details: error.response.data
            });
        }

        console.error('Error creating order or initiating STK Push:', error.message);
        res.status(500).json({ message: error.message || 'Server error creating order' });
    } finally {
        client.release();
    }
};

exports.verifyPayment = async (req, res) => {
    const { Body } = req.body; // Mpesa callback sends data in a 'Body' object
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const callbackData = Body.stkCallback;
        const checkoutRequestID = callbackData.CheckoutRequestID;
        const resultCode = callbackData.ResultCode;

        if (resultCode === 0) {
            // Payment was successful
            const mpesaReceiptCode = callbackData.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber').Value;
            const amount = callbackData.CallbackMetadata.Item.find(item => item.Name === 'Amount').Value;
            const phoneNumber = callbackData.CallbackMetadata.Item.find(item => item.Name === 'PhoneNumber').Value;

            // Update order status
            const orderUpdateResult = await client.query(
                'UPDATE orders SET payment_status = $1, mpesa_receipt_code = $2 WHERE checkout_request_id = $3 RETURNING id, user_id',
                ['paid', mpesaReceiptCode, checkoutRequestID]
            );

            if (orderUpdateResult.rows.length === 0) {
                throw new Error(`Order with CheckoutRequestID ${checkoutRequestID} not found`);
            }

            const order = orderUpdateResult.rows[0];

            // Record the payment
            await client.query(
                'INSERT INTO payments (order_id, user_id, amount, mpesa_receipt_code, phone_number) VALUES ($1, $2, $3, $4, $5)',
                [order.id, order.user_id, amount, mpesaReceiptCode, phoneNumber]
            );
            await client.query('COMMIT');
            // Respond to Mpesa to acknowledge receipt of the callback
            res.status(200).json({ "C2BPaymentConfirmationResult": "Success" });
        } else {
            // Payment failed or was cancelled
            await client.query(
                'UPDATE orders SET payment_status = $1 WHERE checkout_request_id = $2',
                ['failed', checkoutRequestID]
            );
            await client.query('COMMIT');
            res.status(200).json({ "C2BPaymentConfirmationResult": "Failed" });
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing Mpesa callback:', error);
        res.status(500).json({ "C2BPaymentConfirmationResult": "Failed", message: error.message || 'Server error processing payment callback' });
    } finally {
        client.release();
    }
};

exports.getOrderHistory = async (req, res) => {
    const user_id = req.user.id;
    const client = await pool.connect();
    try {
        const ordersResult = await client.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC',
            [user_id]
        );

        const orders = ordersResult.rows;

        for (let i = 0; i < orders.length; i++) {
            const orderItemsResult = await client.query(
                'SELECT oi.quantity, oi.price_at_order, d.name, d.image_url FROM order_items oi JOIN drinks d ON oi.drink_id = d.id WHERE oi.order_id = $1',
                [orders[i].id]
            );
            orders[i].items = orderItemsResult.rows;
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ message: 'Server error fetching order history' });
    } finally {
        client.release();
    }
};