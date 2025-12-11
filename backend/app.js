const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { setupSecurity } = require('./middleware/security');

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');

const app = express();

// Security Init
setupSecurity(app);

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/member', memberRoutes);

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Not Found' }));

module.exports = app;