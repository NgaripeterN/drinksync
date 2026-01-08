const express = require('express');
const { restockBranch, getSalesReport, addStockToHq, getDashboardData } = require('../controllers/admin.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/restock', authenticateToken, authorizeRoles('admin'), restockBranch);
router.post('/add-stock', authenticateToken, authorizeRoles('admin'), addStockToHq);
router.get('/report', authenticateToken, authorizeRoles('admin'), getSalesReport);
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), getDashboardData);

module.exports = router;
