const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');

const setupSecurity = (app) => {
    app.use(helmet()); // Secure Headers
    app.use(mongoSanitize()); // Stop NoSQL Injection
    app.use(xss()); // Stop XSS
    app.use(hpp()); // Stop Param Pollution
};

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, 
    message: { success: false, message: 'Too many login attempts.' }
});

module.exports = { setupSecurity, loginLimiter };