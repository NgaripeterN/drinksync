const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth.routes');
const drinksRoutes = require('./routes/drinks.routes');
const orderRoutes = require('./routes/orders.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('Connected to PostgreSQL database:', result.rows[0].now);
    });
});

app.get('/', (req, res) => {
    res.send('DrinkSync Backend API');
});

// Auth routes
app.use('/auth', authRoutes);
// Drinks routes
app.use('/drinks', drinksRoutes);
// Order routes
app.use('/orders', orderRoutes);
// Admin routes
app.use('/admin', adminRoutes);
// Cart routes
app.use('/cart', cartRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
