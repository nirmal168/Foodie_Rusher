const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticate = require("../middlewares/auth");

const JWT_SECRET = process.env.JWT_SECRET || "foodie_rusher_secret_key_2026";

const generateInviteCode = () => {
    return "701674"; // Permanent code as requested
};
const generateStaffCode = () => "STF-" + Math.random().toString(36).substring(2, 6).toUpperCase();

// Register Route
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role, inviteCode } = req.body;
        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields (name, email, password, role) are required" });
        }
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
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
            inviteCode: myInviteCode
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
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
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

        await sendOtpMail(email, otp);
        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ error: "Failed to send OTP email" });
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

        user.password = await bcrypt.hash(newPassword, 10);
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

module.exports = router;
