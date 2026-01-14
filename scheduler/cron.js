const cron = require("node-cron");
const mongoose = require("mongoose");
const Member = require("./Member");
const sendWhatsAppMessage = require("./sendMessage");
require("dotenv").config({ path: "./.env.prod" });

mongoose
    .connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME || "gym"
    })
    .then(() => console.log("✅ DB Connected Successfully"))
    .catch(err => console.error("❌ DB Connection Error:", err));

function getDailyCronExpr() {
    const raw = (process.env.RUN_DAILY_AT || "00:00").trim();
    const parts = raw.split(":");
    const hh = parts[0] || 0;
    const mm = parts[1] || 0;
    console.log(`🕒 Scheduler set to run daily at ${hh}:${mm}`);
    return `${mm} ${hh} * * *`;
}

cron.schedule(getDailyCronExpr(), async () => {
    console.log("Cron Job Started...");

    try {
        const members = await Member.find({}, "-password");
        console.log(`👥 Checking ${members.length} members...`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentDay = today.getDate();
        const currentMonth = today.getMonth();

        for (const m of members) {
            try {
                if (m.iscancel) continue;
                if (!m.mobile) continue;
                if (m.Date_Of_Birth) {
                    const end = new Date(m.end_date);
                    end.setHours(0, 0, 0, 0);
                    //checking if the user plan is already expired then skip it
                    if (end >= today) {
                        const dob = new Date(m.Date_Of_Birth);
                        if (dob.getDate() === currentDay && dob.getMonth() === currentMonth) {
                            console.log(`🎂 Birthday detected: ${m.name}`);
                            await sendWhatsAppMessage({
                                mobile: m.mobile,
                                name: m.name,
                                type: "birthday"
                            });
                        }
                    } else {
                        console.log(`Skipping birthday for ${m.name} because plan expired`);
                    }
                }


                // Membership Expiry Check
                if (m.end_date) {
                    const end = new Date(m.end_date);
                    end.setHours(0, 0, 0, 0);
                    const diffTime = end - today;
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    /*
                       7  = 7 days remaining
                       3  = 3 days remaining
                       1  = 1 day remaining
                       0  = Expires today
                       -1 = Expired 1 day ago
                       -3 = Expired 3 days ago
                    */


                    // SIR YOU CAN CHANGE YOUR DAYS AS PER YOUR CHANGES FROM THIS ARRAY
                    const triggerDays = [7, 3, 1, 0, -1, -3];

                    if (triggerDays.includes(diffDays)) {
                        console.log(`⚠️ Expiry Alert: ${m.name} (${diffDays} days)`);

                        await sendWhatsAppMessage({
                            mobile: m.mobile,
                            name: m.name,
                            daysLeft: diffDays,
                            endDate: end.toDateString(),
                            type: "expiry"
                        });
                    }
                }

            } catch (innerError) {
                console.error(`⚠️ Error processing member ${m.name}:`, innerError.message);
            }
        }

        console.log("Cron Job Finished Successfully");

    } catch (err) {
        console.error("Critical Cron Job Error:", err.message);
    }
});