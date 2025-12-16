const jwt = require('jsonwebtoken');
const { authCheckAdmin } = require('../utils/helpers');

const verifyAdmin = async(req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        req.user = decoded;
        const check = await authCheckAdmin(req.user.hash);
        next();
    } catch (err) {
        console.log(err)
        return res.status(403).json({ success: false, message: 'Invalid token.', });
    }
};
module.exports = verifyAdmin;