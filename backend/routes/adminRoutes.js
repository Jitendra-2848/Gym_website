const express = require('express');
const router = express.Router();
const { addMember, getAllMembers, cancelMembership,updateuser, deletemember, pricing } = require('../controllers/AdminController');
const verifyAdmin = require('../middleware/verifyAdmin');
const { upload } = require('../config/image');
router.use(verifyAdmin); // Protect all routes
router.post('/add', upload.single('profile_pic'), addMember);
router.get('/all', getAllMembers);
router.put('/cancel', cancelMembership);
router.put('/update/:id',upload.single('profile_pic'), updateuser);
router.delete('/delete/:id', deletemember);
router.get('/pricing',pricing);

module.exports = router; 