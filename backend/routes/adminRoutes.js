const express = require('express');
const router = express.Router();
const { addMember, getAllMembers, cancelMembership,updateuser, deletemember } = require('../controllers/AdminController');
const verifyAdmin = require('../middleware/verifyAdmin');
const { upload } = require('../config/cloudinary');

router.use(verifyAdmin); 
router.post('/add',verifyAdmin, addMember);
router.get('/all', getAllMembers);
router.put('/cancel', cancelMembership);
router.put('/update/:id', updateuser);
router.delete('/delete/:id', deletemember);


module.exports = router; 