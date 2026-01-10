const express = require('express');
const { register, login, updateProfile } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update', authenticateToken, updateProfile);

module.exports = router;
