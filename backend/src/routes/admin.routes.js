const express = require('express');
const { restockBranch, getSalesReport, addStockToHq, getDashboardData, updateDrinkPrice, updateAdminProfile, getInventoryLevels } = require('../controllers/admin.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/restock', authenticateToken, authorizeRoles('admin'), restockBranch);
router.post('/add-stock', authenticateToken, authorizeRoles('admin'), addStockToHq);
router.get('/report', authenticateToken, authorizeRoles('admin'), getSalesReport);
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), getDashboardData);
router.get('/inventory', authenticateToken, authorizeRoles('admin'), getInventoryLevels);
router.put('/drinks/:id', authenticateToken, authorizeRoles('admin'), updateDrinkPrice);
router.put('/profile/update', authenticateToken, authorizeRoles('admin'), updateAdminProfile);

module.exports = router;
