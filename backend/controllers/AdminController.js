const Member = require('../model/Member');
const bcrypt = require('bcrypt');
const { sanitize } = require('../utils/helpers');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { decryptPassword } = require('../utils/crypto');
// ADD MEMBER
const addMember = async (req, res) => {
    try {
        const { name, mobile, email, startDate, duration, discount, totalAmount, focus_note } = req.body;

        // Validation
        if (!name || !mobile || !duration || !totalAmount) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        const mobileStr = String(mobile).trim();

        // Check existing
        const existing = await Member.findOne({ mobile: mobileStr });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Member already exists with this mobile number' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(mobileStr, 10);

        // Calculate dates
        const parsedStartDate = new Date(startDate);
        const endDate = new Date(parsedStartDate);
        endDate.setMonth(endDate.getMonth() + parseInt(duration));

        // Create member
        let profilePicUrl = '';
        if (req.body.profile_pic && req.body.profile_pic.startsWith('data:image')) {
            // For now, save base64 directly
            profilePicUrl = req.body.profile_pic;
        }

        const newMember = new Member({
            name: sanitize(name),
            mobile: mobileStr,
            email: sanitize(email || ''),
            password: hashedPassword,
            profile_pic: profilePicUrl,
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
                _id: newMember._id,
                name: newMember.name,
                mobile: newMember.mobile,
                profile_pic: newMember.profile_pic,
                start_date: formatDate(parsedStartDate),
                end_date: formatDate(endDate),
                duration_months: parseInt(duration)
            }
        });

    } catch (e) {
        console.error("Add Member Error:", e);
        res.status(500).json({ success: false, message: 'Server Error', error: e.message });
    }
};

// GET ALL MEMBERS
const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: members });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET USER PROFILE
const getuserprofile = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Member.findById(id).select('-password');

        if (!data) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// CANCEL MEMBERSHIP
const cancelMembership = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Member ID required" });
        }

        const data = await Member.findByIdAndUpdate(
            id,
            { iscancel: true },
            { new: true }
        );

        if (!data) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        return res.status(200).json({ success: true, data: data, message: "Membership cancelled" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateuser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            mobile,
            email,
            start_date,
            end_date,
            focus_note,
            iscancel,
            encryptedPassword,  // New: Encrypted password from frontend
            resetPassword       // New: Boolean flag
        } = req.body;

        // Find member
        const member = await Member.findById(id);
        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        // Handle photo update
        let photoUrl = member.profile_pic;

        if (req.body.profile_pic && req.body.profile_pic.startsWith('data:image')) {
            photoUrl = req.body.profile_pic;
        }

        // Build update object
        const updateData = {
            name: name ? name.trim() : member.name,
            mobile: mobile || member.mobile,
            email: email !== undefined ? email.trim() : member.email,
            start_date: start_date || member.start_date,
            end_date: end_date || member.end_date,
            focus_note: focus_note !== undefined ? focus_note.trim() : member.focus_note,
            profile_pic: photoUrl
        };

        // Handle cancel status
        if (iscancel !== undefined) {
            updateData.iscancel = iscancel === true || iscancel === 'true';
        }

        // ✅ HANDLE PASSWORD CHANGE
        if (resetPassword === true && encryptedPassword) {
            // 1. Decrypt the password
            const plainPassword = decryptPassword(encryptedPassword);

            if (!plainPassword || plainPassword.length < 4) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid password. Must be at least 4 characters."
                });
            }

            // 2. Hash with bcrypt
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);

            // 3. Update password and set isFirstLogin to true
            updateData.password = hashedPassword;
            updateData.isFirstLogin = true; // Force user to change on next login
        }

        const updatedMember = await Member.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');
        member.isFirstLogin = true;
        await member.save();
        return res.status(200).json({
            success: true,
            message: resetPassword
                ? "Member updated with new password. User must change it on first login."
                : "Member updated successfully",
            data: updatedMember
        });


    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// DELETE MEMBER
const deletemember = async (req, res) => {
    try {
        const { id } = req.params;

        const member = await Member.findById(id);
        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        // Delete photo from Cloudinary
        if (member.profile_pic) {
            await deleteFromCloudinary(member.profile_pic);
        }

        await Member.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Member deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    addMember,
    getAllMembers,
    getuserprofile,
    cancelMembership,
    updateuser,
    deletemember
};