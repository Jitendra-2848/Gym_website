const express = require('express');
const router = express.Router();
const { addMember, getAllMembers, cancelMembership,updateuser, deletemember } = require('../controllers/AdminController');
const verifyAdmin = require('../middleware/verifyAdmin');
const { upload } = require('../config/cloudinary');

router.use(verifyAdmin); // Protect all routes
router.post('/add',verifyAdmin, upload.single('profile_pic'), addMember);
router.get('/all', getAllMembers);
router.put('/cancel', cancelMembership);
router.put('/update/:id',upload.single('profile_pic'), updateuser);
router.delete('/delete/:id', deletemember);


module.exports = router; 