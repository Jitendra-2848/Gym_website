const express = require('express');
const router = express.Router();
const { login, logout,check, resetPassword } = require('../controllers/AuthController');
// const { loginLimiter } = require('../middleware/security');
const verifyToken = require('../middleware/verifyToken');
const { upload } = require('../config/cloudinary');

router.post('/login', login);
router.post('/logout', logout);
router.get('/check',verifyToken,check ); 
router.put('/set-password', verifyToken, resetPassword);
module.exports = router;