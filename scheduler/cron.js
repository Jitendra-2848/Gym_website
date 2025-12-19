const cron = require("node-cron");
const mongoose = require("mongoose");
const Member = require("./Member");
const sendWhatsAppMessage = require("./sendMessage");
require("dotenv").config({ path: "./.env.local" });

mongoose
    .connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME || "gym"
    })
    .then(() => console.log("DB Connected"))
    .catch(err => console.error("DB Error", err));

function getDailyCronExpr() {
    const raw = (process.env.RUN_DAILY_AT || "00:00").trim();
    const m = raw.match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/);
    const hh = m ? Number(m[1]) : 0;
    const mm = m ? Number(m[2]) : 0;
    console.log(`[Scheduler] Daily at ${hh}:${mm}`);
    return `${mm} ${hh} * * *`;
}

cron.schedule(getDailyCronExpr(), async () => {
    try {
        const members = await Member.find({}, "-password");
        console.log(`[Scheduler] Members found: ${members.length}`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);

        for (const m of members) {
            if (m.iscancel) continue;

            const end = new Date(m.end_date);
            end.setHours(0, 0, 0, 0);

            if (end >= today && end <= threeDaysLater) {
                await sendWhatsAppMessage(m.mobile);
            }
        }

        console.log("[Scheduler] Run completed");
    } catch (err) {
        console.error("[Scheduler] Error:", err.message);
    }
});
