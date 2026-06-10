const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authenticate = require("../middleware/auth");

router.get("/", authenticate, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

router.post("/read", authenticate, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.userId, read: false }, { read: true });
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark notifications as read" });
    }
});

module.exports = router;
