const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Course Buddy OTP',
        text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };
