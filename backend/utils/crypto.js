const CryptoJS = require('crypto-js');

// Must match frontend secret
const SECRET_KEY = process.env.CRYPTO_SECRET || 'sanatan-gym-secret-2024';

const decryptPassword = (encryptedPassword) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

module.exports = { decryptPassword };