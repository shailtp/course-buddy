const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendOTP } = require('../services/emailService');

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup Route
router.post('/signup', [
    check('email').isEmail().matches(/@sfsu\.edu$/).withMessage("Only SFSU emails allowed"),
    check('personalEmail').isEmail().withMessage("Valid personal email required"),
    check('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[a-z]/).matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must be 8+ characters, include uppercase, lowercase, and special character")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, personalEmail, password } = req.body;
    
    try {
        let user = await User.findOne({ $or: [{ email }, { personalEmail }] });
        if (user) {
            if (user.email === email) return res.status(400).json({ message: "SFSU email already registered" });
            if (user.personalEmail === personalEmail) return res.status(400).json({ message: "Personal email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();

        user = new User({ 
            name, 
            email, 
            personalEmail,
            password: hashedPassword, 
            otp, 
            otpExpires: Date.now() + 600000 // OTP expires in 10 minutes
        });
        await user.save();

        // Send OTP to personal email
        await sendOTP(personalEmail, otp);
        res.json({ message: "OTP sent to personal email" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// OTP Verification
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
        return res.status(400).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Account verified successfully!" });
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
});

// Forgot Password (Send OTP)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 600000; // OTP expires in 10 mins
    await user.save();

    // For security reasons, we should send the OTP to the user's personal email instead
    await sendOTP(user.personalEmail, otp);
    res.json({ message: "OTP sent to your personal email" });
});

// Reset Password (Verify OTP & Update Password)
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });
});

module.exports = router;
