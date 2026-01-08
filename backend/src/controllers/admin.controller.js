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
        console.error('Error restocking branch:', error);
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
        console.error('Error adding stock to HQ:', error);
        res.status(500).json({ message: error.message || 'Server error adding stock to HQ' });
    } finally {
        client.release();
    }
};

exports.getSalesReport = async (req, res) => {
    try {
        const salesReport = await pool.query(`
            SELECT
                d.name AS drink_name,
                SUM(oi.quantity) AS total_units_sold,
                SUM(oi.quantity * oi.price_at_order) AS total_revenue
            FROM order_items oi
            JOIN drinks d ON oi.drink_id = d.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.payment_status = 'paid'
            GROUP BY d.name
            ORDER BY d.name;
        `);

        const grandTotal = await pool.query(`
            SELECT
                SUM(total_amount) AS grand_total_revenue
            FROM orders
            WHERE payment_status = 'paid';
        `);

        res.status(200).json({
            salesPerDrink: salesReport.rows,
            grandTotalRevenue: grandTotal.rows[0].grand_total_revenue || 0,
        });
    } catch (error) {
        console.error('Error generating sales report:', error);
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
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).json({ message: 'Server error fetching admin dashboard data' });
    }
};
