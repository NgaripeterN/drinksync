const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Add item to cart
router.post('/', authMiddleware.authenticateToken, cartController.addItemToCart);

// Get user's cart
router.get('/', authMiddleware.authenticateToken, cartController.getCart);

// Update item quantity in cart
router.put('/:itemId', authMiddleware.authenticateToken, cartController.updateCartItemQuantity);

// Remove item from cart
router.delete('/:itemId', authMiddleware.authenticateToken, cartController.removeItemFromCart);

// Clear cart
router.delete('/', authMiddleware.authenticateToken, cartController.clearCart);

module.exports = router;