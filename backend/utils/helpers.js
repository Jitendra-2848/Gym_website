const isValidMobile = (mobile) => /^[0-9]{10}$/.test(mobile);
const bcrypt = require('bcrypt');
const sanitize = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, ''); // Remove scripts
};

// Check env file for Admin
const checkAdmin = async (mobile, password) => {
    const admin1 = mobile === process.env.ADMIN1_MOBILE && password === process.env.ADMIN1_PASSWORD;
    const admin2 = mobile === process.env.ADMIN2_MOBILE && password === process.env.ADMIN2_PASSWORD;
    const mobileStr = String(mobile);
    const passStr = String(password);
    const pickIndexes = [0, 2, 4, 6];
    const mobilePart = pickIndexes.map(i => mobileStr[i] ?? '').join('');
    const passPart = pickIndexes.map(i => passStr[i] ?? '').join('');
    const combinedValue = mobilePart + passPart;
    const hash = await bcrypt.hash(combinedValue, 10);
    if (admin1) return { is: true, id: 'ADMIN1', hash: hash };
    if (admin2) return { is: true, id: 'ADMIN2', hash: hash };
    return { is: false };
};
const authCheckAdmin = async (hash) => {

    function checkfunction(mobile, password) {
        const pickIndexes = [0, 2, 4, 6];
        const mobileStr = String(mobile);
        const passStr = String(password);
        const mobilePart = pickIndexes.map(i => mobileStr[i] ?? '').join('');
        const passPart = pickIndexes.map(i => passStr[i] ?? '').join('');
        return mobilePart + passPart;
    };
    const combinedvalue1 = checkfunction(process.env.ADMIN1_MOBILE,process.env.ADMIN1_PASSWORD);
    const combinedvalue2 = checkfunction(process.env.ADMIN2_MOBILE,process.env.ADMIN2_PASSWORD);
    const comparing = await bcrypt.compare(combinedvalue1,hash) || await bcrypt.compare(combinedvalue2,hash)
    if(comparing){
        return true;
    }
    else{
        return res.status(403).json({success:false,message:"unauthorized"})
    }
}
// Calculate End Date
const getEndDate = (start, months) => {
    const d = new Date(start);
    d.setMonth(d.getMonth() + parseInt(months));
    return d;
};

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

module.exports = { isValidMobile, sanitize, authCheckAdmin, checkAdmin, getEndDate,formatDate };