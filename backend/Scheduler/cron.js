const cron = require('node-cron');
const fs = require('fs');
const Member = require('../model/Member');
const sendWhatsAppMessage = require('./sendMessage');

cron.schedule('0 0 * * *', async () => {
    try {
        const members = await Member.find({}, '-password');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);

        const expiring = [];

        for (const m of members) {
            if (m.iscancel) continue;

            const end = new Date(m.end_date);
            end.setHours(0, 0, 0, 0);

            if (end >= today && end <= threeDaysLater) {
                const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
                const message = daysLeft === 0
                    ? `⚠️ Your plan expires today! Please renew it. End date: ${end.toDateString()}`
                    : `Your plan will end in ${daysLeft} day(s). End date: ${end.toDateString()}`;

                await sendWhatsAppMessage(m.mobile, message);

                expiring.push({
                    mobile: m.mobile,
                    days_left: daysLeft,
                    end_date: end.toDateString(),
                    message
                });
            }
        }

        console.log(`Scheduler done → Expiring: ${expiring.length}`);
    } catch (err) {
        console.error('Scheduler Error:', err.message);
    }
});
