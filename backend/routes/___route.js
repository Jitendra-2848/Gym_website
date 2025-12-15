const express = require('express');
const router = express.Router();
const { 
    addmember, 
    viewmember, 
    Allmember, 
    updatemember, 
    deletemember 
} = require('../controller/AdminController');
const verifyAdmin = require('../middleware/verifyAdmin');

router.use(verifyAdmin);

router.post('/member', addmember);
router.get('/member/:mobile', viewmember);
router.get('/members', Allmember);
router.put('/member/:mobile', updatemember);
router.delete('/member/:mobile', deletemember);

module.exports = router;