const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    profile_pic: { type: String, default: '' },
    
    // Membership Details
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    duration_months: { type: Number, required: true },
    
    // Finance
    discount: { type: Number, default: 0 }, // Flat Rs
    amount_paid: { type: Number, required: true },
    
    focus_note: { type: String, default: '' },
    isFirstLogin: { type: Boolean, default: true },
    status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
    createdBy: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);