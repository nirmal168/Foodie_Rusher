const nodemailer = require("nodemailer");

// Create dynamic transporter
const getTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL || "your_email@gmail.com",
            pass: process.env.PASS || "your_email_app_password"
        }
    });
};

/**
 * Sends an OTP email to the specified recipient.
 * @param {string} to - The recipient's email address.
 * @param {string} otp - The 6-digit OTP code.
 * @returns {Promise}
 */
const sendOtpMail = async (to, otp) => {
    const transporter = getTransporter();
    const mailOptions = {
        from: `"Foodie Rusher" <${process.env.EMAIL || "foodierusher@gmail.com"}>`,
        to: to,
        subject: `Your Foodie Rusher OTP Code: ${otp}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #e23744; margin: 0; font-size: 28px; font-weight: 900; font-style: italic;">Foodie<span style="color: #1e293b;">Rusher</span></h1>
                    <p style="color: #64748b; font-size: 13px; font-weight: bold; text-transform: uppercase; margin-top: 4px;">Verification Code</p>
                </div>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;">
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello,</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your One-Time Password (OTP) for verification is:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #e23744; background: #fef2f2; padding: 14px 28px; border-radius: 12px; display: inline-block; border: 2px dashed #fca5a5;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code is valid for <strong>10 minutes</strong>. Please do not share this OTP with anyone.</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;">
                <p style="font-size: 11px; color: #94a3b8; text-align: center;">Foodie Rusher Automated Security Service</p>
            </div>
        `
    };

    console.log(`[EMAIL SERVICE] Sending real OTP email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE SUCCESS] Message sent to ${to}: ID ${info.messageId}`);
    return info;
};

module.exports = { sendOtpMail };
