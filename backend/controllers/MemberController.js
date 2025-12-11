const Member = require('../model/Member');

const getProfile = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(200).json({ success: true, data: { name: 'Admin', role: 'admin' } });
        }

        const member = await Member.findById(req.user.id).select('-password -__v');
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

module.exports = { getProfile };