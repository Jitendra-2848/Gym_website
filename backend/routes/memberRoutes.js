const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/MemberController');
const verifyToken = require('../middleware/verifyToken');

router.get('/profile', verifyToken, getProfile);

module.exports = router; 