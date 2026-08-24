const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticate = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "foodie_rusher_secret_key_2026";

const generateInviteCode = () => {
    return "701674"; // Permanent code as requested
};
const generateStaffCode = () => "STF-" + Math.random().toString(36).substring(2, 6).toUpperCase();

// Register Route
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role, inviteCode, phone } = req.body;
        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields (name, email, password, role) are required" });
        }
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }
        // Check if phone already exists
        if (phone) {
            const cleanPhone = phone.replace(/\s+/g, '');
            const existingPhone = await User.findOne({ phone: cleanPhone });
            if (existingPhone) {
                return res.status(409).json({ error: "Mobile number already registered" });
            }
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        let employerId = null;
        let myInviteCode = null;
        let myStaffCode = null;
        if (role === 'owner') {
            // Ensure only one owner exists
            const existingOwner = await User.findOne({ role: 'owner' });
            if (existingOwner) {
                return res.status(403).json({ error: "Owner account already exists" });
            }
            myInviteCode = generateInviteCode();
        } else if (role === 'staff') {
            if (!inviteCode) return res.status(400).json({ error: "Invite code required for staff" });
            const owner = await User.findOne({ role: 'owner', inviteCode }).sort({ _id: -1 });
            if (!owner) return res.status(400).json({ error: "Invalid invite code" });
            employerId = owner._id;
            myStaffCode = generateStaffCode();
            myInviteCode = inviteCode;
        }
        const userData = {
            name,
            email,
            password: hashedPassword,
            role,
            employerId,
            inviteCode: myInviteCode,
            phone: phone ? phone.replace(/\s+/g, '') : undefined
        };
        // Include staffRegistrationCode only for staff accounts
        if (myStaffCode) {
            userData.staffRegistrationCode = myStaffCode;
        }
        const user = await User.create(userData);
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                inviteCode: user.inviteCode,
                staffRegistrationCode: user.staffRegistrationCode
            }
        });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(409).json({ error: "Duplicate field value error" });
        }
        res.status(500).json({ error: "Server error during registration" });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanPhone = email ? email.replace(/\s+/g, '') : '';
        const user = await User.findOne({
            $or: [
                { email: email },
                { phone: cleanPhone }
            ]
        });
        if (!user || !(await bcryptjs.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
});

// Get current user details
router.get("/me", authenticate, async (req, res) => {
    try {
        let user = await User.findById(req.user.userId).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        // Force permanent code for all owners
        if (user.role === 'owner' && user.inviteCode !== '701674') {
            user.inviteCode = '701674';
            try {
                await user.save();
            } catch (saveErr) {
                console.error("Save code error (permanent):", saveErr);
            }
        }
        const userObj = user.toObject();
        userObj.id = user._id.toString();
        res.json(userObj);
    } catch (err) {
        console.error("Fetch me error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

const { sendOtpMail } = require("../utils/mail");

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found with this email" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        user.isOtpVerified = false;
        await user.save();

        try {
            await sendOtpMail(email, otp);
            console.log(`[OTP Verification] Sent OTP ${otp} to ${email}`);
            res.json({ message: "OTP sent to your email" });
        } catch (err) {
            console.error("[OTP Verification] Failed to send SMTP email:", err);
            return res.status(500).json({ error: "Failed to send reset OTP email. Please ensure your SMTP email credentials (EMAIL and PASS) in backend/.env are correct." });
        }
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ error: "Failed to process forgot password request" });
    }
});

// Verify OTP Route
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.resetOtp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.isOtpVerified = true;
        await user.save();

        res.json({ message: "OTP verified successfully. You can now reset your password." });
    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ error: "Server error during OTP verification" });
    }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.isOtpVerified) {
            return res.status(400).json({ error: "OTP has not been verified" });
        }

        user.password = await bcryptjs.hash(newPassword, 10);
        user.resetOtp = undefined;
        user.otpExpires = undefined;
        user.isOtpVerified = false;
        await user.save();

        res.json({ message: "Password reset successfully. You can now login with your new password." });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ error: "Server error during password reset" });
    }
});

// OTP Send Endpoint
router.post("/otp/send", async (req, res) => {
    try {
        const { type, identifier, role } = req.body;
        if (!type || !identifier) {
            return res.status(400).json({ error: "Type and identifier are required" });
        }

        let user = null;
        if (type === 'email') {
            user = await User.findOne({ email: identifier });
            if (!user) {
                // Sign Up placeholder
                const defaultName = identifier.split('@')[0];
                const hashedPassword = await bcryptjs.hash(Math.random().toString(36), 10);
                user = await User.create({
                    name: defaultName,
                    email: identifier,
                    password: hashedPassword,
                    role: role || 'customer'
                });
            }
        } else if (type === 'phone') {
            const cleanPhone = identifier.replace(/\s+/g, '');
            user = await User.findOne({ phone: cleanPhone });
            if (!user) {
                // Sign Up placeholder
                const defaultName = `User_${cleanPhone.slice(-4)}`;
                const mockEmail = `phone_${cleanPhone}@foodierusher.local`;
                const hashedPassword = await bcryptjs.hash(Math.random().toString(36), 10);
                user = await User.create({
                    name: defaultName,
                    email: mockEmail,
                    password: hashedPassword,
                    phone: cleanPhone,
                    role: role || 'customer'
                });
            }
        } else {
            return res.status(400).json({ error: "Invalid OTP type" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
        user.isOtpVerified = false;
        await user.save();

        console.log(`[OTP Login/Signup] Sent ${type} OTP: ${otp} to ${identifier}`);
        
        if (type === 'email') {
            try {
                await sendOtpMail(identifier, otp);
            } catch (err) {
                console.error("[OTP Send SMTP Error]:", err);
                return res.status(500).json({ error: "Failed to send OTP email. Please verify that your SMTP email settings (EMAIL and PASS) in backend/.env are configured correctly." });
            }
        } else if (type === 'phone') {
            // In a production environment, you would integrate Twilio or a similar SMS gateway here:
            console.log(`[SMS Gateway Mock] Sending SMS to ${identifier}: Your OTP is ${otp}`);
        }

        res.json({ 
            message: "OTP sent successfully"
        });
    } catch (err) {
        console.error("OTP send error:", err);
        res.status(500).json({ error: err.message || "Failed to send OTP" });
    }
});

// OTP Verify and Login/Signup Endpoint
router.post("/otp/verify", async (req, res) => {
    try {
        const { type, identifier, otp } = req.body;
        if (!type || !identifier || !otp) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let user = null;
        if (type === 'email') {
            user = await User.findOne({ email: identifier });
        } else if (type === 'phone') {
            const cleanPhone = identifier.replace(/\s+/g, '');
            user = await User.findOne({ phone: cleanPhone });
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.resetOtp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.resetOtp = undefined;
        user.otpExpires = undefined;
        user.isOtpVerified = true;
        await user.save();

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        console.error("OTP verify error:", err);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
});

module.exports = router;
