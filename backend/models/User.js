const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /@sfsu\.edu$/ },
    personalEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    completed_courses: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
