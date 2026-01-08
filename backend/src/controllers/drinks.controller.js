const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

exports.listDrinks = async (req, res) => {
    const { branchId } = req.query; // Get branchId from query parameters

    try {
        let query;
        let params = [];

        if (branchId) {
            // If branchId is provided, get drinks with inventory for that branch
            query = `
                SELECT 
                    d.id, 
                    d.name, 
                    d.price, 
                    COALESCE(i.stock, 0) AS quantity 
                FROM 
                    drinks d
                LEFT JOIN 
                    inventory i ON d.id = i.drink_id AND i.branch_id = $1
                ORDER BY 
                    d.name;
            `;
            params = [branchId];
        } else {
            // If no branchId, get a simple list of all drinks
            query = `
                SELECT id, name, price 
                FROM drinks 
                ORDER BY name;
            `;
        }

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching drinks:', error);
        res.status(500).json({ message: 'Server error fetching drinks' });
    }
};
