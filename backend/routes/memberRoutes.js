const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/MemberController');
const verifyToken = require('../middleware/verifyToken');
const { upload } = require('../config/image');

router.get('/profile', verifyToken, getProfile);
router.put('/update', verifyToken,upload.single('profile_pic'), updateProfile);
module.exports = router; 