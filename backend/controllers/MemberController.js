const Member = require('../model/Member');

const getProfile = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(200).json({ success: true, data: { name: 'Admin', role: 'admin' } });
        }
        const member = await Member.findById(req.user.id).select('-password -password -createdBy -createdAt -amount_paid -discount -_id -updatedAt -__v');
        if (!member) return res.status(404).json({ success: false, message: 'User not found' });

        // --- Date Calculation ---
        const now = new Date();
        const end = new Date(member.end_date);

        // Normalize to midnight for accurate day counts
        const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        let daysRemaining = 0;
        if (endMidnight > nowMidnight) {
            const diffTime = endMidnight - nowMidnight;
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        // --- Date Formatting (DD-MM-YYYY) ---
        const formatDate = (dateObj) => {
            return dateObj.toLocaleDateString('en-GB').replace(/\//g, '-');
        };

        // Create a clean response object
        const memberData = member.toObject();
        
        // Remove raw ISO dates
        delete memberData.start_date;
        delete memberData.end_date;

        res.status(200).json({ 
            success: true, 
            data: { 
                ...memberData,
                start_date: formatDate(member.start_date), // Overwrite with formatted
                end_date: formatDate(member.end_date),     // Overwrite with formatted
                daysRemaining 
            } 
        });

    } catch (e) {
        console.error("Profile Error:", e);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// ... existing imports
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. CHECK IMAGE ERRORS FROM MIDDLEWARE
        // The helper you provided sets this if validation fails (e.g., file too big)
        if (req.imageError) {
            return res.status(400).json({ 
                success: false, 
                message: req.imageError 
            });
        }

        // Destructure body
        // Note: 'profile_pic' is removed from req.body by the middleware if it processed an image
        let { name, email, mobile } = req.body;

        // 2. Fetch current user first (Needed for comparison)
        const currentMember = await Member.findById(userId);
        if (!currentMember) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        const updateFields = {};

        // --- NAME VALIDATION ---
        if (name) {
            const trimmedName = String(name).trim();
            if (trimmedName.length < 2 || trimmedName.length > 40) {
                return res.status(400).json({ success: false, message: 'Name must be between 2 and 40 characters.' });
            }
            updateFields.name = trimmedName;
        }

        // --- MOBILE VALIDATION ---
        if (mobile) {
            const trimmedMobile = String(mobile).trim();

            // Format Check
            if (!/^\d{10}$/.test(trimmedMobile)) {
                return res.status(400).json({ success: false, message: "Invalid mobile number. Must be 10 digits." });
            }

            // Uniqueness Check (Only if different from current)
            if (trimmedMobile !== currentMember.mobile) {
                const mobileExists = await Member.findOne({ mobile: trimmedMobile });
                if (mobileExists) {
                    return res.status(400).json({ success: false, message: "Mobile number already in use." });
                }
                updateFields.mobile = trimmedMobile;
            }
        }

        // --- EMAIL VALIDATION ---
        if (email) {
            const trimmedEmail = String(email).trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(trimmedEmail)) {
                 return res.status(400).json({ success: false, message: "Invalid email format." });
            }

            if (trimmedEmail !== currentMember.email) {
                 const emailExists = await Member.findOne({ email: trimmedEmail });
                 if (emailExists) {
                     return res.status(400).json({ success: false, message: "Email already in use." });
                 }
                 updateFields.email = trimmedEmail;
            }
        }

        // --- FILE UPLOAD (Handled by Middleware) ---
        // Your middleware puts the valid base64 string into req.fileUrl
        if (req.fileUrl) {
            updateFields.profile_pic = req.fileUrl;
        }

        // --- EXECUTE UPDATE ---
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ success: false, message: "No changes provided." });
        }

        const updatedMember = await Member.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-password -__v");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedMember
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        
        // Handle MongoDB Duplicate Key Error (Safety net)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false, 
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` 
            });
        }

        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { getProfile,updateProfile };