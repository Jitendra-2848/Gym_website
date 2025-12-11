const express = require('express');
const router = express.Router();
const { login, setFirstPassword, logout } = require('../controllers/AuthController');
const { loginLimiter } = require('../middleware/security');

router.post('/login', loginLimiter, login);
router.post('/set-password', loginLimiter, setFirstPassword);
router.post('/logout', logout);

module.exports = router;