const express = require('express');
const { createOrder, verifyPayment, getOrderHistory, retryPayment, cancelOrder } = require('../controllers/orders.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', authenticateToken, createOrder);
router.get('/history', authenticateToken, getOrderHistory);
router.post('/verify-payment', verifyPayment); // Mpesa callback route - no authentication required
router.post('/retry-payment', authenticateToken, retryPayment);
router.post('/cancel', authenticateToken, cancelOrder);

module.exports = router;