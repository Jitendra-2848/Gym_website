const Member = require('../model/Member');
const bcrypt = require('bcrypt');
const { getEndDate, sanitize } = require('../utils/helpers');

const addMember = async (req, res) => {
    try {
        const { name, mobile, email, duration, option_discount, amount_paid, focus_note } = req.body;
        if (!name || !mobile || !duration || !amount_paid) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }
        const mobileStr = String(mobile).trim();
        const existing = await Member.findOne({ mobile: mobileStr });
        if (existing) return res.status(400).json({ success: false, message: 'Member exists' });
        const hashedPassword = await bcrypt.hash(mobileStr, 10);
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + parseInt(duration));
        const newMember = new Member({
            name: sanitize(name),
            mobile: mobileStr,
            email: sanitize(email),
            password: hashedPassword,
            profile_pic: req.file ? req.file.path : '',
            start_date: startDate,
            end_date: endDate,
            duration_months: parseInt(duration),
            discount: parseFloat(option_discount || 0),
            amount_paid: parseFloat(amount_paid),
            focus_note: sanitize(focus_note),
            createdBy: req.user.adminId || req.user.id
        });

        await newMember.save();
        const formatDate = (d) => d.toLocaleDateString('en-GB').replace(/\//g, '-');

        res.status(201).json({
            success: true,
            message: 'Member added',
            data: {
                name: newMember.name,
                mobile: newMember.mobile,
                start_date: formatDate(startDate),
                end_date: formatDate(endDate),
                days_duration: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) // Show calculated total days
            }
        });

    } catch (e) {
        console.error("Add Member Error:", e);
        res.status(500).json({ success: false, message: 'Server Error' });
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

module.exports = { addMember, getAllMembers };