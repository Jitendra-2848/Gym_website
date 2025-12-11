const bcrypt = require("bcrypt");

const Adminsec = async (mobile, password) => {
    if (mobile !== process.env.ADMIN_MOBILE) {
        return { is: false };
    }

    if (password !== process.env.ADMIN_PASSWORD) {
        return { is: false };
    }

    // Hash password to store in JWT
    const hash = await bcrypt.hash(password, 12);

    return {
        is: true,
        hash: hash
    };
};

module.exports = { Adminsec };