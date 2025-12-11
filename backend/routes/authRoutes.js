const express = require('express');
const router = express.Router();
const { login, setFirstPassword, logout,check } = require('../controllers/AuthController');
const { loginLimiter } = require('../middleware/security');
const verifyToken = require('../middleware/verifyToken');

router.post('/login', login);
router.post('/set-password', loginLimiter, setFirstPassword);
router.post('/logout', logout);
router.get('/check',verifyToken,check ); 

module.exports = router;