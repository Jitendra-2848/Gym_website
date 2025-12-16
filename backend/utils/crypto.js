const CryptoJS = require('crypto-js');
const CRYPTO_SECRET = process.env.CRYPTO_SECRET;

const decryptPassword = (encryptedPassword) => {
    try {
        if (!encryptedPassword) return null;
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, CRYPTO_SECRET);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption results in an empty string, it often means the key was wrong 
        // or the input wasn't encrypted with AES.
        if (!decrypted) {
            console.warn("Decryption resulted in empty string. Check Secret Keys.");
            return null; 
        }

        return decrypted;
    } catch (error) {
        // This catches the "Malformed UTF-8" error
        console.error('Decryption failed:', error.message);
        return null;
    }
};

module.exports = { decryptPassword };