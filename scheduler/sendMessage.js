const axios = require("axios");

const TEMPLATES = {
    BIRTHDAY: "happy_birthday_wish",
    EXPIRY_WARNING: "membership_expiry_warning",    // For 7, 3, 1 days left
    EXPIRY_TODAY: "membership_expires_today",       // For 0 days left
    EXPIRY_OVER: "membership_renewal_reminder"      // For -1, -3 days (expired)
};

const sendWhatsAppMessage = async ({ mobile, name, daysLeft, endDate, type }) => {
    const url = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_API_KEY;

    if (!url || !token) {
        console.error("Missing WhatsApp API URL or Token in .env");
        return;
    }

    // Format Mobile Number (Add 91 if missing)
    const to = mobile.startsWith("91") ? mobile : `91${mobile}`;

    let templateName = "";
    let params = [];

    //Birthday Template
    if (type === "birthday") {
        templateName = TEMPLATES.BIRTHDAY;
        params = [name];
    }

    //Expiry Templates
    else if (type === "expiry") {

        //Case: 7, 3, or 1 days remaining
        if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
            templateName = TEMPLATES.EXPIRY_WARNING;
            params = [name, String(daysLeft), endDate];
        }

        //Case: Expires TODAY (0 days)
        else if (daysLeft === 0) {
            templateName = TEMPLATES.EXPIRY_TODAY;
            params = [name, endDate];
        }

        // Case: Already Expired (-1 or -3 days ago)
        else if (daysLeft === -1 || daysLeft === -3) {
            templateName = TEMPLATES.EXPIRY_OVER;
            params = [name];
        }
    }

    // If no valid template, skip
    if (!templateName) return;

    const payload = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
            name: templateName,
            language: { code: "en_IN" },
            components: [
                {
                    type: "body",
                    parameters: params.map(p => ({
                        type: "text",
                        text: p
                    }))
                }
            ]
        }
    };

    try {
        await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log(`WhatsApp Sent | To: ${name} | Template: ${templateName}`);
    } catch (err) {
        console.error(
            `WhatsApp Failed | To: ${name} | Error:`,
            err.response?.data?.error?.message || err.message
        );
    }
};

module.exports = sendWhatsAppMessage;