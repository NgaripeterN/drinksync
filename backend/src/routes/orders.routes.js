const express = require('express');
const { createOrder, verifyPayment, getOrderHistory } = require('../controllers/orders.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', authenticateToken, createOrder);
router.get('/history', authenticateToken, getOrderHistory);
router.post('/verify-payment', verifyPayment); // Mpesa callback route - no authentication required

module.exports = router;