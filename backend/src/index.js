const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth.routes');
const drinksRoutes = require('./routes/drinks.routes');
const orderRoutes = require('./routes/orders.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const { autoCancelPendingOrders } = require('./controllers/orders.controller');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.message);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.message);
        }
        console.log('Connected to PostgreSQL database:', result.rows[0].now);
    });
});

// Start background task for auto-cancelling overdue pending orders
setInterval(() => {
    autoCancelPendingOrders();
}, 60000); // Run every minute

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
