const axios = require("axios");

const sendWhatsAppMessage = async ({ mobile, name, daysLeft, endDate }) => {
    const url = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_API_KEY;

    if (!url || !token) return;

    const to = mobile.startsWith("91") ? mobile : `91${mobile}`;

    let templateName;
    let params;

    if (daysLeft > 0) {
        templateName = process.env.DB_NAME || "membership_expires_in_3_days";
        params = [name, String(daysLeft), endDate];
    } else if (daysLeft === 0) {
        templateName = process.env.DB_NAME || "membership_expires_today";
        params = [name, endDate];
    } else {
        templateName = process.env.DB_NAME || "membership_today";
        params = [name, endDate];
    }

    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: templateName,
            language: { code: "en_US" },
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
        console.log(`✅ Sent ${templateName} → ${to}`);
    } catch (err) {
        console.error(
            `❌ WhatsApp failed → ${to}`,
            err.response?.data || err.message
        );
    }
};

module.exports = sendWhatsAppMessage;
