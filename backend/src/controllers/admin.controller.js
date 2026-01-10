const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

exports.restockBranch = async (req, res) => {
    const { branch_id, drink_id, quantity } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Deduct from HQ inventory
        const hqResult = await client.query(
            'UPDATE inventory SET stock = stock - $1 WHERE branch_id = (SELECT id FROM branches WHERE name = \'Headquarters\') AND drink_id = $2 RETURNING stock',
            [quantity, drink_id]
        );

        if (hqResult.rows.length === 0 || hqResult.rows[0].stock < 0) {
            throw new Error('Insufficient stock at Headquarters for restock');
        }

        // Add to target branch inventory (UPSERT)
        await client.query(
            `INSERT INTO inventory (branch_id, drink_id, stock) VALUES ($1, $2, $3)
             ON CONFLICT (branch_id, drink_id) DO UPDATE SET stock = inventory.stock + EXCLUDED.stock`,
            [branch_id, drink_id, quantity]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: 'Branch restocked successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error restocking branch:', error.message);
        res.status(500).json({ message: error.message || 'Server error restocking branch' });
    } finally {
        client.release();
    }
};
exports.addStockToHq = async (req, res) => {
    const { drink_id, quantity } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Add to HQ inventory (UPSERT)
        await client.query(
            `INSERT INTO inventory (branch_id, drink_id, stock)
             VALUES ((SELECT id FROM branches WHERE name = 'Headquarters'), $1, $2)
             ON CONFLICT (branch_id, drink_id) DO UPDATE SET stock = inventory.stock + EXCLUDED.stock`,
            [drink_id, quantity]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: 'Stock added to Headquarters successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding stock to HQ:', error.message);
        res.status(500).json({ message: error.message || 'Server error adding stock to HQ' });
    } finally {
        client.release();
    }
};

exports.getSalesReport = async (req, res) => {
    const { branch_id } = req.query;
    try {
        let salesQuery = `
            SELECT
                d.name AS drink_name,
                SUM(oi.quantity) AS total_units_sold,
                SUM(oi.quantity * oi.price_at_order) AS total_revenue
            FROM order_items oi
            JOIN drinks d ON oi.drink_id = d.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.payment_status = 'paid'
        `;
        let totalQuery = `
            SELECT
                SUM(total_amount) AS grand_total_revenue
            FROM orders
            WHERE payment_status = 'paid'
        `;
        const values = [];

        if (branch_id && branch_id !== 'all') {
            salesQuery += ` AND o.branch_id = $1`;
            totalQuery += ` AND branch_id = $1`;
            values.push(branch_id);
        }

        salesQuery += ` GROUP BY d.name ORDER BY d.name;`;

        const salesReport = await pool.query(salesQuery, values);
        const grandTotal = await pool.query(totalQuery, values);

        res.status(200).json({
            salesPerDrink: salesReport.rows,
            grandTotalRevenue: grandTotal.rows[0].grand_total_revenue || 0,
        });
    } catch (error) {
        console.error('Error generating sales report:', error.message);
        res.status(500).json({ message: 'Server error generating sales report' });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const branchesResult = await pool.query('SELECT * FROM branches ORDER BY name');
        const drinksResult = await pool.query('SELECT id, name FROM drinks ORDER BY name');

        // For simplicity, we send all branches and let the frontend filter HQ
        const branches = branchesResult.rows;
        const drinks = drinksResult.rows;

        res.status(200).json({ branches, drinks });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error.message);
        res.status(500).json({ message: 'Server error fetching admin dashboard data' });
    }
};

exports.updateDrinkPrice = async (req, res) => {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Invalid price provided' });
    }

    try {
        const result = await pool.query(
            'UPDATE drinks SET price = $1 WHERE id = $2 RETURNING *',
            [price, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Drink not found' });
        }

        res.status(200).json({ message: 'Drink price updated successfully', drink: result.rows[0] });
    } catch (error) {
        console.error('Error updating drink price:', error.message);
        res.status(500).json({ message: 'Server error updating drink price' });
    }
};

exports.updateAdminProfile = async (req, res) => {
    const { id } = req.user; // Assuming req.user is populated by authenticateToken middleware
    const { name, email, password } = req.body;

    try {
        const fields = [];
        const values = [];
        let queryIndex = 1;

        if (name) {
            fields.push(`name = $${queryIndex++}`);
            values.push(name);
        }
        if (email) {
            fields.push(`email = $${queryIndex++}`);
            values.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push(`password = $${queryIndex++}`);
            values.push(hashedPassword);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id); // Add user id as the last value
        const updateQuery = `UPDATE users SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING id, name, email, role`;

        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        const updatedUser = result.rows[0];

        // Re-issue token with updated user info if email or name changed
        const token = jwt.sign(
            { id: updatedUser.id, role: updatedUser.role, name: updatedUser.name, email: updatedUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Admin profile updated successfully',
            user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
            token
        });
    } catch (error) {
        console.error('Error updating admin profile:', error.message);
        if (error.code === '23505') { // Unique violation on email
            return res.status(409).json({ message: 'This email is already in use by another user.' });
        }
        res.status(500).json({ message: 'Server error during admin profile update' });
    }
};

exports.getInventoryLevels = async (req, res) => {
    try {
        const query = `
            SELECT 
                b.name AS branch_name,
                d.name AS drink_name,
                i.stock
            FROM 
                inventory i
            JOIN 
                branches b ON i.branch_id = b.id
            JOIN 
                drinks d ON i.drink_id = d.id
            ORDER BY 
                CASE WHEN b.name = 'Headquarters' THEN 0 ELSE 1 END,
                b.name, d.name;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching inventory levels:', error.message);
        res.status(500).json({ message: 'Server error fetching inventory levels' });
    }
};

