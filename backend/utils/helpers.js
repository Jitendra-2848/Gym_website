const isValidMobile = (mobile) => /^[0-9]{10}$/.test(mobile);

const sanitize = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, ''); // Remove scripts
};

// Check env file for Admin
const checkAdmin = (mobile, password) => {
    const admin1 = mobile === process.env.ADMIN1_MOBILE && password === process.env.ADMIN1_PASSWORD;
    const admin2 = mobile === process.env.ADMIN2_MOBILE && password === process.env.ADMIN2_PASSWORD;
    if (admin1) return { is: true, id: 'ADMIN1' };
    if (admin2) return { is: true, id: 'ADMIN2' };
    return { is: false };
};

// Calculate End Date
const getEndDate = (start, months) => {
    const d = new Date(start);
    d.setMonth(d.getMonth() + parseInt(months));
    return d;
};

module.exports = { isValidMobile, sanitize, checkAdmin, getEndDate };