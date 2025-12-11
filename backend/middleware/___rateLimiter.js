// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many attempts. Try after 15 min.' },
    standardHeaders: true,
    legacyHeaders: false
})
const memberApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, message: 'Too many requests.' }
})

module.exports = { loginLimiter, memberApiLimiter };