const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");
const authenticate = require("../middleware/auth");
const { getIo } = require("../sockets/socketHandler");
const autoAssignOrder = require("../services/autoAssign");

// GET Customer Orders
router.get("/orders", authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user.userId }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// GET Admin/Staff Orders
router.get("/admin/orders", authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'staff') {
            return res.status(403).json({ error: "Forbidden" });
        }
        
        let query = {};
        if (req.user.role === 'owner') {
            const Shop = require("../models/Shop");
            const shop = await Shop.findOne({ owner: req.user.userId });
            if (shop) {
                query.shopId = shop._id;
            } else {
                return res.json([]);
            }
        }
        
        const orders = await Order.find(query).populate('customerId', 'name').sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch all orders" });
    }
});

// UPDATE Order Status (Owner/Staff)
router.put("/admin/orders/:id/status", authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'staff') {
            return res.status(403).json({ error: "Forbidden" });
        }
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        
        // Emit to socket room for live tracking
        const io = getIo();
        io.to(order._id.toString()).emit("order-status-update", order);
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: "Failed to update order status" });
    }
});

// ACCEPT Order (Owner only)
router.post('/api/orders/:id/accept', authenticate, async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'preparing' }, { new: true });
        
        const io = getIo();
        // Notify Customer
        const notification = await Notification.create({
            userId: order.customerId,
            title: "Order Accepted!",
            message: `Your order #${order._id.toString().slice(-6)} is now being prepared.`
        });
        io.to(order.customerId.toString()).emit("new-notification", notification);
        io.to(order._id.toString()).emit('order-status-update', order);
        
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to accept order' });
    }
});

// GET Owner's Staff Team
router.get('/api/staff', authenticate, async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    try {
        const ownersCount = await User.countDocuments({ role: 'owner' });
        const globalStaffCount = await User.countDocuments({ role: 'staff' });
        console.log(`[DEBUG] System Snapshot: Owners(${ownersCount}), Total Staff(${globalStaffCount})`);

        const owner = await User.findById(req.user.userId);
        console.log(`[DEBUG] Requesting Owner: ${owner?.email} (ID: ${owner?._id}, Code: ${owner?.inviteCode})`);

        const staffList = await User.find({ 
            role: 'staff', 
            $or: [
                { employerId: req.user.userId },
                { inviteCode: '701674' } // HARDCODE for debugging
            ]
        }, 'name email staffRegistrationCode');

        console.log(`[DEBUG] Query results: ${staffList.length} staff found for this owner.`);
        res.json(staffList);
    } catch (err) {
        console.error("[DEBUG] GET /api/staff error:", err);
        res.status(500).json({ error: 'Failed to fetch your staff team' });
    }
});

// GET all available delivery staff (Not yet hired)
router.get('/api/staff/available', authenticate, async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    try {
        const availableStaff = await User.find({ role: 'staff', employerId: null }, 'name email');
        res.json(availableStaff);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch available partners' });
    }
});

// HIRE a staff member (Link to Owner)
router.post('/api/owner/staff/hire/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    try {
        const staff = await User.findByIdAndUpdate(req.params.id, { 
            employerId: req.user.userId 
        }, { new: true });
        
        // Notify Staff
        await Notification.create({
            userId: staff._id,
            title: "Hired!",
            message: `You have been added to ${req.user.name}'s delivery team.`
        });

        res.json({ message: "Successfully added to your team", staff });
    } catch (err) {
        res.status(500).json({ error: 'Failed to hire staff member' });
    }
});

// ASSIGN a specific staff to an order (Owner only)
router.post('/api/orders/:id/assign', authenticate, async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    try {
        const { staffId } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { 
            staffId, 
            status: 'preparing' 
        }, { new: true }).populate('staffId', 'name');

        if (!order) {
            console.error(`[ASSIGN ERROR] Order not found: ${req.params.id}`);
            return res.status(404).json({ error: 'Order not found' });
        }

        if (!order.staffId) {
            console.error(`[ASSIGN ERROR] Staff member not found or invalid: ${staffId}`);
            return res.status(404).json({ error: 'Staff member not found' });
        }

        const io = getIo();

        // Notify Staff
        const staffNotification = await Notification.create({
            userId: staffId,
            title: "New Task Assigned!",
            message: `Order #${order._id.toString().slice(-6)} has been assigned to you.`
        });
        io.to(staffId.toString()).emit("new-notification", staffNotification);

        // Notify Customer
        const customerNotification = await Notification.create({
            userId: order.customerId,
            title: "Staff Assigned",
            message: `${order.staffId.name} has been assigned to deliver your order.`
        });
        io.to(order.customerId.toString()).emit("new-notification", customerNotification);
        io.to(order._id.toString()).emit('order-status-update', order);

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to assign staff' });
    }
});

// PICKUP order (Staff only)
router.post("/api/orders/:id/pickup", authenticate, async (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: "Forbidden" });
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { 
            status: "out-for-delivery", 
            staffId: req.user.userId 
        }, { new: true });

        const io = getIo();

        // Notify Customer
        const notification = await Notification.create({
            userId: order.customerId,
            title: "Out for Delivery!",
            message: `Your order #${order._id.toString().slice(-6)} has been picked up and is on the way!`
        });
        io.to(order.customerId.toString()).emit("new-notification", notification);
        io.to(order._id.toString()).emit("order-status-update", order);

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: "Failed to pick up order" });
    }
});

// COMPLETE delivery (Staff only)
router.post('/api/orders/:id/complete', authenticate, async (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' });
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'delivered' }, { new: true });
        
        const io = getIo();

        // Notify Customer
        const notification = await Notification.create({
            userId: order.customerId,
            title: "Order Delivered!",
            message: `Enjoy your meal! Your order #${order._id.toString().slice(-6)} has been delivered.`
        });
        io.to(order.customerId.toString()).emit("new-notification", notification);
        io.to(order._id.toString()).emit('order-status-update', order);
        
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to complete delivery' });
    }
});

// CREATE Razorpay Order (Mocked for Portfolio)
router.post("/create-order", async (req, res) => {
    const { amount, items, paymentMethod, customerId, deliveryAddress, shopId } = req.body;

    try {
        const newOrder = await Order.create({
            items,
            total: amount,
            paymentMethod,
            paymentStatus: "success", // Mocked success
            deliveryAddress: deliveryAddress || "123 Gourmet Street, Dummy Location",
            customerId,
            shopId: shopId || null,
            razorpayOrderId: "mock_order_id_" + Date.now()
        });

        // Mock successful Razorpay order response
        res.json({ id: newOrder.razorpayOrderId, status: "created", amount: amount * 100 });
        
        // Trigger AI geo-spatial assignment in background
        autoAssignOrder(newOrder._id, customerId);
    } catch (err) {
        console.error("Order creation failed:", err);
        res.status(500).json({ error: "Order creation failed" });
    }
});

// COD Checkout
router.post("/cod", async (req, res) => {
    try {
        const { amount, items, customerId, deliveryAddress, shopId } = req.body;

        const newOrder = await Order.create({
            items,
            total: amount,
            paymentMethod: "COD",
            paymentStatus: "success",
            deliveryAddress: deliveryAddress || "123 Gourmet Street, Dummy Location",
            customerId,
            shopId: shopId || null
        });

        res.send({ message: "Order Placed (Cash on Delivery)" });
        
        // Trigger AI geo-spatial assignment in background
        autoAssignOrder(newOrder._id, customerId);
    } catch (err) {
        console.error("COD Checkout error:", err);
        res.status(500).json({ error: "COD Checkout failed" });
    }
});

module.exports = router;
