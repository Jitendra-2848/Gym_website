const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Member = require('../model/Member');
const { checkAdmin } = require('../utils/helpers');

const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const login = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                message: 'Credentials required'
            });
        }
        const adminData = await checkAdmin(mobile, password);

        if (adminData.is) {
            const token = jwt.sign(
                {
                    hash: adminData.hash,
                    role: 'admin'
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            res.cookie('token', token, cookieOpts);
            return res.status(200).json({
                success: true,
                role: 'admin',
                message: 'Admin Login'
            });
        }
        const member = await Member.findOne({ mobile });

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

        const token = jwt.sign(
            {
                id: member._id,
                role: 'member'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, cookieOpts);

        if (member.isFirstLogin) {
            return res.status(200).json({
                success: true,
                role: 'member',
                isFirstLogin: true,
                mobile: member.mobile
            });
        }

        return res.status(200).json({
            success: true,
            role: 'member',
            isFirstLogin: false,
            message: 'Member Login'
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

const setFirstPassword = async (req, res) => {
    try {
        const { mobile, newPassword } = req.body;
        if(mobile == newPassword){
            return res.status(400).json({message:"password should not same as mobile"});
        }
        const member = await Member.findOne({ mobile });
        if (!member || !member.isFirstLogin) return res.status(400).json({ success: false, message: 'Not allowed' });
        member.password = await bcrypt.hash(newPassword, 10);
        member.isFirstLogin = false;
        await member.save();
        const token = jwt.sign({ id: member._id, role: 'member' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, cookieOpts);
        res.status(200).json({ success: true, message: 'Password set' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Error' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token', cookieOpts);
    res.status(200).json({ success: true, message: 'Logged out' });
};
const check = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ user: null });
        }
        console.log(req.user);
        if (req.user.role === 'admin') {
            const isValidAdmin = await bcrypt.compare(
                process.env.ADMIN1_PASSWORD,
                req.user.hash
            );
            const isValidAdmin2 = await bcrypt.compare(
                process.env.ADMIN2_PASSWORD,
                req.user.hash
            );
            

            if (isValidAdmin || isValidAdmin2) {
                return res.json({
                    user: {
                        // name: process.env.ADMIN_NAME,
                        mobile: process.env.ADMIN1_MOBILE,
                        role: 'admin'
                    }
                });
            }

            return res.json({ user: null });
        }
        if (req.user.role === 'member') {
            const user = await Member.findById(req.user.id)
                .select("-password -createdBy -createdAt -amount_paid -discount -_id -updatedAt -__v")
                .lean();

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
        console.log("Check error:", error.message);
        return res.json({ user: null });
    }
};
module.exports = { login, setFirstPassword, logout ,check};

