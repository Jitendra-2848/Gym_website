const Member = require('../model/Member');
const bcrypt = require('bcrypt');
const { getEndDate, sanitize } = require('../utils/helpers');
// const addMember = async (req, res) => {
//     try {
//         const { name, mobile, email, startDate, duration, discount, totalAmount, focus_note } = req.body;
//         if (!name || !mobile || !duration || !amount_paid) {
//             return res.status(400).json({ success: false, message: 'Missing fields' });
//         }
//         const mobileStr = String(mobile).trim();
//         const existing = await Member.findOne({ mobile: mobileStr });
//         if (existing) return res.status(400).json({ success: false, message: 'Member exists' });
//         const hashedPassword = await bcrypt.hash(mobileStr, 10);
//         // const startDate = new Date();
//         const endDate = new Date(startDate);
//         endDate.setMonth(endDate.getMonth() + parseInt(duration));
//         const newMember = new Member({
//             name: sanitize(name),
//             mobile: mobileStr,
//             email: sanitize(email),
//             password: hashedPassword,
//             profile_pic: req.file ? req.file.path : '',
//             start_date: startDate,
//             end_date: endDate,
//             duration_months: parseInt(duration),
//             discount: parseFloat(discount || 0),
//             amount_paid: parseFloat(totalAmount),
//             focus_note: sanitize(focus_note),
//             createdBy: req.user.adminId || req.user.id
//         });

//         await newMember.save();
//         const formatDate = (d) => d.toLocaleDateString('en-GB').replace(/\//g, '-');

//         res.status(201).json({
//             success: true,
//             message: 'Member added',
//             data: {
//                 name: newMember.name,
//                 mobile: newMember.mobile,
//                 start_date: formatDate(startDate),
//                 end_date: formatDate(endDate),
//                 days_duration: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) // Show calculated total days
//             }
//         });

//     } catch (e) {
//         console.error("Add Member Error:", e);
//         res.status(500).json({ success: false, message: 'Server Error' });
//     }
// };
const addMember = async (req, res) => {
    try {
        const { name, mobile, email, startDate, duration, discount, totalAmount, focus_note } = req.body;
        // FIX: Changed amount_paid to totalAmount in the check
        if (!name || !mobile || !duration || !totalAmount) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }
        const mobileStr = String(mobile).trim();
        const existing = await Member.findOne({ mobile: mobileStr });
        if (existing) return res.status(400).json({ success: false, message: 'Member already exists with this mobile number' });

        const hashedPassword = await bcrypt.hash(mobileStr, 10);

        // Parse start date
        const parsedStartDate = new Date(startDate);
        const endDate = new Date(parsedStartDate);
        endDate.setMonth(endDate.getMonth() + parseInt(duration));

        const newMember = new Member({
            name: sanitize(name),
            mobile: mobileStr,
            email: sanitize(email || ''),
            password: hashedPassword,
            profile_pic: req.file ? req.file.path : '',
            start_date: parsedStartDate,
            end_date: endDate,
            duration_months: parseInt(duration),
            discount: parseFloat(discount || 0),
            amount_paid: parseFloat(totalAmount),
            focus_note: sanitize(focus_note || ''),
            createdBy: req.user.id,
        });

        await newMember.save();

        const formatDate = (d) => d.toLocaleDateString('en-GB').replace(/\//g, '-');
        res.status(201).json({
            success: true,
            message: 'Member added successfully',
            data: {
                name: newMember.name,
                mobile: newMember.mobile,
                start_date: formatDate(parsedStartDate),
                end_date: formatDate(endDate),
                duration_months: parseInt(duration)
            }
        });
    } catch (e) {
        console.log(e);
        console.error("Add Member Error:", e);
        res.status(500).json({ success: false, message: 'Server Error', error: e });
    }
};
const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find().select('-password');
        res.status(200).json({ success: true, data: members });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
const getuserprofile = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Member.findById(id);
        return res.status(200).json({ message: "success", data: data });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "failed" });
    }
}
const cancelMembership = async (req, res) => {
    try {
        const { id } = req.body
        const data = await Member.findOneAndUpdate(id, {
            iscancel:true,
        })
        return res.status(200).json({data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" });
    }
}
module.exports = { addMember, getAllMembers,cancelMembership };