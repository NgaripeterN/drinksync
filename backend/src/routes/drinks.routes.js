const express = require('express');
const { listDrinks } = require('../controllers/drinks.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/list', authenticateToken, listDrinks);

module.exports = router;
