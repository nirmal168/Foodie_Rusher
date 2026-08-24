const nodemailer = require("nodemailer");

// Configure the nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL || "your_email@gmail.com",
        pass: process.env.PASS || "your_email_app_password"
    }
});

/**
 * Sends a password reset OTP email to a user.
 * @param {string} to - The recipient's email address.
 * @param {string} otp - The 6-digit OTP code.
 * @returns {Promise}
 */
const sendOtpMail = async (to, otp) => {
    const mailOptions = {
        from: `"Foodie Rusher Support" <${process.env.EMAIL || "your_email@gmail.com"}>`,
        to: to,
        subject: "Your Foodie Rusher OTP for Password Reset",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #6366f1; text-align: center; margin-bottom: 5px;">Foodie Rusher</h2>
                <h4 style="text-align: center; color: #777777; margin-top: 0;">Password Reset Request</h4>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p>Hello,</p>
                <p>We received a request to reset your password. Use the following One-Time Password (OTP) code to verify your identity. This OTP is valid for 10 minutes.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333333; background: #f3f4f6; padding: 12px 24px; border-radius: 8px; display: inline-block; border: 1px solid #e5e7eb;">${otp}</span>
                </div>
                <p>If you did not make this request, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpMail };
