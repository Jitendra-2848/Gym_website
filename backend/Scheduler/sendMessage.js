const axios = require('axios');

const sendWhatsAppMessage = async (mobile, message) => {
    const url = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_API_KEY;

    if (!url || !token) {
        console.log(`Skipping message to ${mobile}: API URL or key missing`);
        return;
    }

    // Ensure Indian number format
    const fullNumber = mobile.match(/^\d{10}$/) ? `91${mobile}` : mobile;

    try {
        const data = {
            messaging_product: "whatsapp",
            to: fullNumber,
            type: "text",
            text: { body: message }
        };

        await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error(`❌ Failed to send to ${fullNumber}:`, err.response?.data || err.message);
    }
};

module.exports = sendWhatsAppMessage;
