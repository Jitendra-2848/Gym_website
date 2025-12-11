const express = require('express');
const router = express.Router();
const { addMember, getAllMembers } = require('../controllers/AdminController');
const verifyAdmin = require('../middleware/verifyAdmin');
const { upload } = require('../config/cloudinary');

router.use(verifyAdmin); // Protect all routes
router.post('/add', upload.single('profile_pic'), addMember);
router.get('/all', getAllMembers);

module.exports = router;