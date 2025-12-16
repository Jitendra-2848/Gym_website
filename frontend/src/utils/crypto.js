import CryptoJS from 'crypto-js';

// Use environment variable in production
const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET || 'sanatan-gym-secret-2025';

export const encryptPassword = (password) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

export const decryptPassword = (encryptedPassword) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};