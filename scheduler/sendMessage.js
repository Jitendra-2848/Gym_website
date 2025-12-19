const axios = require("axios");

const sendWhatsAppMessage = async (mobile) => {
    const url = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_API_KEY;

    if (!url || !token) {
        console.log("❌ WhatsApp API URL or Token missing");
        return;
    }

    const to = mobile.startsWith("91") ? mobile : `91${mobile}`;

    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: "hello_world",
            language: { code: "en_US" }
        }
    };

    try {
        await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log(`✅ WhatsApp sent to ${to}`);
    } catch (err) {
        console.error(
            `❌ Failed to send to ${to}:`,
            err.response?.data || err.message
        );
    }
};

module.exports = sendWhatsAppMessage;
