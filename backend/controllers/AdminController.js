const Member = require('../model/Member');
const bcrypt = require('bcrypt');
const { sanitize,formatDate } = require('../utils/helpers');
const { decryptPassword } = require('../utils/crypto');
// ========== HELPER FUNCTIONS ==========

// Get member status
const getStatus = (member) => {
    if (member.iscancel) return 'cancelled';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(member.start_date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(member.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (today < startDate) return 'Pending';
    if (today > endDate) return 'expired';
    return 'Active';
};
// Get days left
const getDaysLeft = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
};
const addMember = async (req, res) => {
    try {
        const { name, mobile,Date_Of_Birth, email, startDate, duration, discount, totalAmount, focus_note, profile_pic } = req.body;

        // ========== REQUIRED FIELDS ==========
        if (!name || !mobile || !duration || !totalAmount || !Date_Of_Birth) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // ========== NAME VALIDATION ==========
        const trimmedName = String(name).trim();
        if (trimmedName.length < 2 || trimmedName.length > 40) {
            return res.status(400).json({ success: false, message: 'Name must be 2-40 characters' });
        }

        // ========== MOBILE VALIDATION ==========
        const mobileStr = String(mobile).trim().replace(/\D/g, '');
        if (mobileStr.length !== 10) {
            return res.status(400).json({ success: false, message: 'Mobile must be 10 digits' });
        }
        if (!/^[6-9]/.test(mobileStr)) {
            return res.status(400).json({ success: false, message: 'Mobile must start with 6, 7, 8 or 9' });
        }

        // ========== DURATION VALIDATION ==========
        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum < 1 || durationNum > 24) {
            return res.status(400).json({ success: false, message: 'Duration must be 1-24 months' });
        }

        // ========== AMOUNT VALIDATION ==========
        const amountNum = parseFloat(totalAmount);
        if (isNaN(amountNum) || amountNum < 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        // ========== DISCOUNT VALIDATION ==========
        const discountNum = parseFloat(discount) || 0;
        if (discountNum < 0) {
            return res.status(400).json({ success: false, message: 'Discount cannot be negative' });
        }
        if (discountNum > amountNum) {
            return res.status(400).json({ success: false, message: 'Discount cannot be more than amount' });
        }

        // ========== DATE VALIDATION ==========
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let parsedStartDate;
        
        if (startDate) {
            parsedStartDate = new Date(startDate);
            
            // Check valid date
            if (isNaN(parsedStartDate.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid date format' });
            }
            parsedStartDate.setHours(0, 0, 0, 0);
            const futureLimit = new Date(today);
            futureLimit.setDate(futureLimit.getDate() + 30);
            if (parsedStartDate > futureLimit) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Start date cannot be more than 30 days in the future' 
                });
            }
        } else {
            // Default: Today
            parsedStartDate = new Date(today);
        }

        // ========== CHECK EXISTING MEMBER ==========
        const existing = await Member.findOne({ mobile: mobileStr });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Mobile number already registered' });
        }

        // ========== CALCULATE END DATE ==========
        const endDate = new Date(parsedStartDate);
        endDate.setMonth(endDate.getMonth() + durationNum);

        // ========== CALCULATE DAYS LEFT ==========
        const diffTime = endDate - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // ========== DETERMINE STATUS ==========
        let status = 'Active';
        if (parsedStartDate > today) {
            status = 'Pending'; // Starts in future
        }

        // ========== CREATE MEMBER ==========
        const hashedPassword = await bcrypt.hash(mobileStr, 10);

        const newMember = new Member({
            name: sanitize(trimmedName),
            mobile: mobileStr,
            email: sanitize(email || ''),
            password: hashedPassword,
            profile_pic: req.fileUrl || profile_pic || '',
            Date_Of_Birth:Date_Of_Birth,
            start_date: parsedStartDate,
            end_date: endDate,
            duration_months: durationNum,
            days_left: daysLeft,
            status: status,
            discount: discountNum,
            amount_paid: amountNum,
            focus_note: sanitize(focus_note || ''),
            createdBy: req.user?.id || 'admin',
        });

        await newMember.save();

        // ========== SUCCESS ==========
        return res.status(201).json({
            success: true,
            message: status === 'Pending' 
                ? `Member added! Membership starts on ${formatDate(parsedStartDate)}` 
                : 'Member added successfully',
            data: {
                _id: newMember._id,
                name: newMember.name,
                mobile: newMember.mobile,
                profile_pic: newMember.profile_pic,
                start_date: formatDate(parsedStartDate),
                end_date: formatDate(endDate),
                duration_months: durationNum,
                days_left: daysLeft,
                status: status
            }
        });

    } catch (e) {
        console.error("Add Member Error:", e);
        
        if (e.code === 11000) {
            return res.status(400).json({ success: false, message: 'Mobile already exists' });
        }
        
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Helper function

const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find().select('-password').sort({ createdAt: -1 }).lean();

        // Add status and days_left to each member
        const membersWithStatus = members.map(member => ({
            ...member,
            status: getStatus(member),
            days_left: getDaysLeft(member.end_date)
        }));

        res.status(200).json({ success: true, data: membersWithStatus });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
const getuserprofile = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await Member.findById(id).select('-password').lean();

        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        return res.status(200).json({
            success: true,
            data: {
                ...member,
                status: getStatus(member),
                days_left: getDaysLeft(member.end_date)
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
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
            duration_months,
            focus_note,
            Date_Of_Birth,
            discount = 0,
            iscancel,
            encryptedPassword,
            resetPassword
        } = req.body;

        // 1. Find member
        const member = await Member.findById(id);
        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        // 2. Get current status & Days Left
        const currentStatus = getStatus(member);
        const statusLower = currentStatus.toLowerCase(); // Normalize for comparison

        // Calculate days left
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentEndDate = new Date(member.end_date);
        currentEndDate.setHours(0, 0, 0, 0);
        const diffTime = currentEndDate - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 3. Mobile validation
        if (mobile && mobile !== member.mobile) {
            const mobileRegex = /^\d{10}$/;
            if (!mobileRegex.test(mobile)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid mobile number. Must be exactly 10 digits."
                });
            }

            const existingMember = await Member.findOne({
                mobile: mobile,
                _id: { $ne: id }
            });

            if (existingMember) {
                return res.status(400).json({
                    success: false,
                    message: "This mobile number is already in use by another member."
                });
            }
        }

        // 4. Calculate dates based on status
        let sDate, eDate, newDuration;

        // =====================================================
        // KEY LOGIC: Determine if Fresh Start or Extension
        // =====================================================
        // Fresh Start = Expired, Pending, Cancelled, OR Active with ≤3 days left
        // Extension = Active with >3 days left (stack durations)
        // =====================================================
        
        const isActiveWithTimeLeft = statusLower === 'active' && daysLeft > 3;
        const isFreshStart = !isActiveWithTimeLeft; // Everything else is fresh start

        if (duration_months && parseInt(duration_months) > 0) {
            const renewalMonths = parseInt(duration_months);

            if (isFreshStart) {
                sDate = new Date(today);
                eDate = new Date(today);
                eDate.setMonth(eDate.getMonth() + renewalMonths);
                newDuration = renewalMonths; // Reset to renewal months only

                console.log(` Fresh Start: ${renewalMonths} month(s) from today`);
            } else {
                sDate = new Date(member.start_date);
                eDate = new Date(member.end_date);
                eDate.setMonth(eDate.getMonth() + renewalMonths);
                newDuration = member.duration_months + renewalMonths; // Stack durations

                console.log(` Extension: ${member.duration_months} + ${renewalMonths} = ${newDuration} month(s)`);
            }
        }
        // Manual date override
        else if (start_date && end_date) {
            sDate = new Date(start_date);
            eDate = new Date(end_date);
            newDuration = member.duration_months;
        }
        else if (end_date) {
            sDate = new Date(member.start_date);
            eDate = new Date(end_date);
            newDuration = member.duration_months;
        }
        // No changes to dates
        else {
            sDate = new Date(member.start_date);
            eDate = new Date(member.end_date);
            newDuration = member.duration_months;
        }

        // Validate dates
        if (eDate < sDate) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date."
            });
        }

        // 5. Handle photo update
        let photoUrl = member.profile_pic;
        if (req.fileUrl) {
            photoUrl = req.fileUrl;
        }

        // 6. Build update object
        const updateData = {
            name: name ? name.trim() : member.name,
            mobile: mobile || member.mobile,
            email: email !== undefined ? email.trim() : member.email,
            start_date: sDate,
            end_date: eDate,
            discount,
            Date_Of_Birth,
            duration_months: newDuration,
            focus_note: focus_note !== undefined ? focus_note.trim() : member.focus_note,
            profile_pic: photoUrl,
        };

        // Handle cancel status
        if (iscancel !== undefined) {
            updateData.iscancel = iscancel === true || iscancel === 'true';
        }

        // Increment renewal count for fresh start renewals
        if (isFreshStart && duration_months && parseInt(duration_months) > 0) {
            updateData.renewal_count = (member.renewal_count || 0) + 1;
            updateData.iscancel = false;
        }

        // 7. Handle password change
        if (resetPassword === true && encryptedPassword) {
            const plainPassword = decryptPassword(encryptedPassword);

            if (!plainPassword || plainPassword.length < 4) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid password. Must be at least 4 characters."
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);

            updateData.password = hashedPassword;
            updateData.isFirstLogin = true;
        }

        // 8. Update member
        const updatedMember = await Member.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password').lean();

        // Get new status
        const newStatus = getStatus(updatedMember);
        const newDaysLeft = getDaysLeft(updatedMember.end_date);

        // Build response message
        let message = "Member updated successfully";
        if (resetPassword) {
            message = "Member updated with new password.";
        } else if (duration_months) {
            if (isFreshStart) {
                message = `Membership renewed for ${duration_months} month(s). Started fresh from today.`;
            } else {
                message = `Membership extended by ${duration_months} month(s). Total duration: ${newDuration} month(s).`;
            }
        }

        return res.status(200).json({
            success: true,
            message: message,
            previousStatus: currentStatus,
            newStatus: newStatus,
            daysLeftBeforeUpdate: daysLeft,
            actionType: duration_months ? (isFreshStart ? 'renewal' : 'extension') : 'update',
            data: {
                ...updatedMember,
                status: newStatus,
                days_left: newDaysLeft
            }
        });

    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const deletemember = async (req, res) => {
    try {
        const { id } = req.params;

        const member = await Member.findById(id);
        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }
        await Member.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Member deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const pricing = async (req, res) => {
    try {
        const rate = [
            { months: 1, price: process.env['1_Month_subscription'], label: "1 Month" },
            { months: 3, price: process.env['3_Month_subscription'], label: "3 Months" },
            { months: 6, price: process.env['6_Month_subscription'], label: "6 Months" },
            { months: 12, price: process.env['12_Month_subscription'], label: "12 Months" }
        ];
        return res.status(200).json({ success: true, rate });
    } catch (error) {
        console.error("Error in price: " + error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
module.exports = {
    addMember,
    getAllMembers,
    getuserprofile,
    cancelMembership,
    updateuser,
    deletemember,
    pricing
};
