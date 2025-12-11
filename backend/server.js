// server.js (Complete)
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and Start Server
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('DB Connected');
        app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    })
    .catch(err => console.error(' DB Error', err));