const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Member = require('../model/Member');
const { checkAdmin, authCheckAdmin } = require('../utils/helpers');
const { validation } = require('../utils/validators');

const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const login = async (req, res) => {
    try {
        const { mobile, password } = req.body;
        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                message: 'Mobile and Password are required'
            });
        }
        // 1. Check Admin Credentials
        const adminData = await checkAdmin(mobile, password);
        if (adminData.is) {
            const token = jwt.sign(
                {
                    hash: adminData.hash,
                    id: adminData.id,
                    role: 'admin'
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            res.cookie('token', token, cookieOpts);
            return res.status(200).json({
                success: true,
                role: 'admin',
                message: 'Admin Login Successful'
            });
        }
        // 2. Check Member Credentials
        const member = await Member.findOne({ mobile });
        const mobileStr = String(mobile);
        const idStr = String(member._id);
        const pickIndexes = [0, 2, 4, 6];
        const mobilePart = pickIndexes.map(i => mobileStr[i] ?? '').join('');
        const idPart = pickIndexes.map(i => idStr[i] ?? '').join('');
        const combinedValue = mobilePart + idPart;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(combinedValue, salt);
        if (!member) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, member.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // 3. Issue Token
        const token = jwt.sign(
            {
                id: member._id,
                role: 'member',
                hash,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.cookie('token', token, cookieOpts);
        // 4. Return User Data
        return res.status(200).json({
            success: true,
            id: member._id,
            role: 'member',
            name: member.name,
            mobile: member.mobile,
            duration:member.duration_months,
            isFirstLogin: member.isFirstLogin, // Frontend needs this to redirect
            message: 'Login Successful'
        });

    } catch (e) {
        console.error("Login Error:", e);
        res.status(500).json({
            success: false,
            message: 'Invalid crendentials'
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user.id; // From Auth Middleware

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide new password"
            });
        }

        // 1. Find Member
        const member = await Member.findById(userId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (!member.isFirstLogin) {
            return res.status(400).json({ success: false, message: "user already changed password." })
        }
        const salt = await bcrypt.genSalt(10);
        member.password = await bcrypt.hash(newPassword, salt);
        member.isFirstLogin = false;
        await member.save();
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (e) {
        console.error("Reset Password Error:", e);
        res.status(500).json({ success: false, message: 'Server error updating password' });
    }
};

const logout = (req, res) => {
    const { maxAge, ...logoutOpts } = cookieOpts;
    res.clearCookie('token', logoutOpts);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};
// ================= CHECK AUTH =================
const check = async (req, res,next) => {
    try {
        if (!req.user) {
            return res.json({ user: null });
        }
        if (req.user.role === 'admin') {
            const check = await authCheckAdmin(req.user.hash);
            // const isValidAdmin = await bcrypt.compare(process.env.ADMIN1_PASSWORD, req.user.hash);
            // const isValidAdmin2 = await bcrypt.compare(process.env.ADMIN2_PASSWORD, req.user.hash);

            if (check) {
                return res.json({
                    user: {
                        role: 'admin'
                    }
                });
            }
        }

        // Member Check
        if (req.user.role === 'member') {
            const user = await Member.findById(req.user.id)
                .select("name mobile role isFirstLogin profile_pic") // Select only needed fields
                .lean();
            const isvalid = validation(user.mobile, user._id,req.user.hash) 
            if(!isvalid){
                return res.status(401).json({message:"Unauthorized Token"});
            }
            if (!user) {
                return res.json({ user: null });
            }

            return res.json({
                user: {
                    ...user,
                    role: 'member'
                }
            });
        }
        return res.json({ user: null });
    } catch (error) {
        console.log("Auth Check Error:", error.message);
        return res.json({ user: null });
    }
};

module.exports = { login, resetPassword, logout, check };