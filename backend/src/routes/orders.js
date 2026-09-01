const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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

// GET Owner's Staff Team (Guaranteed linking for all staff)
router.get('/api/staff', authenticate, async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    try {
        const owner = await User.findById(req.user.userId);
        const ownerInviteCode = owner?.inviteCode || '701674';

        // Retrieve all staff members in the platform
        let staffList = await User.find({ role: 'staff' }, 'name email phone staffRegistrationCode inviteCode employerId');

        // Automatically ensure all staff members are linked to owner & have a staffRegistrationCode
        let updated = false;
        for (let s of staffList) {
            let needsSave = false;
            if (!s.employerId && owner) {
                s.employerId = owner._id;
                needsSave = true;
            }
            if (!s.inviteCode) {
                s.inviteCode = ownerInviteCode;
                needsSave = true;
            }
            if (!s.staffRegistrationCode) {
                s.staffRegistrationCode = "STF-" + Math.random().toString(36).substring(2, 6).toUpperCase();
                needsSave = true;
            }
            if (needsSave) {
                try {
                    await s.save();
                    updated = true;
                } catch (e) {}
            }
        }

        if (updated) {
            staffList = await User.find({ role: 'staff' }, 'name email phone staffRegistrationCode inviteCode employerId');
        }

        res.json(staffList);
    } catch (err) {
        console.error("GET /api/staff error:", err);
        res.status(500).json({ error: 'Failed to fetch staff team' });
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

const handleCreateOrder = async (req, res) => {
    const { amount, items, paymentMethod = 'online', customerId, deliveryAddress, shopId } = req.body;

    try {
        const cleanShopId = mongoose.Types.ObjectId.isValid(shopId) ? shopId : null;
        const cleanCustomerId = mongoose.Types.ObjectId.isValid(customerId) ? customerId : null;

        const newOrder = await Order.create({
            items: (items || []).map(i => ({ name: i.name, price: Number(i.price) || 0, quantity: Number(i.quantity) || 1 })),
            total: Number(amount) || 0,
            paymentMethod: paymentMethod,
            paymentStatus: "success", // Instant Mocked Success
            deliveryAddress: deliveryAddress || "123 Gourmet Street, Dummy Location",
            customerId: cleanCustomerId,
            shopId: cleanShopId,
            razorpayOrderId: "order_" + Date.now(),
            status: "pending"
        });

        // Mock successful Razorpay order response
        res.json({ 
            success: true,
            id: newOrder.razorpayOrderId, 
            orderId: newOrder._id,
            status: "created", 
            amount: (Number(amount) || 0) * 100,
            order: newOrder
        });
        
        // Trigger AI geo-spatial assignment in background
        if (cleanCustomerId) {
            autoAssignOrder(newOrder._id, cleanCustomerId).catch(() => {});
        }
    } catch (err) {
        console.error("Order creation failed:", err);
        res.status(500).json({ error: "Order creation failed" });
    }
};

const handleCodOrder = async (req, res) => {
    try {
        const { amount, items, customerId, deliveryAddress, shopId } = req.body;
        const cleanShopId = mongoose.Types.ObjectId.isValid(shopId) ? shopId : null;
        const cleanCustomerId = mongoose.Types.ObjectId.isValid(customerId) ? customerId : null;

        const newOrder = await Order.create({
            items: (items || []).map(i => ({ name: i.name, price: Number(i.price) || 0, quantity: Number(i.quantity) || 1 })),
            total: Number(amount) || 0,
            paymentMethod: "COD",
            paymentStatus: "success",
            deliveryAddress: deliveryAddress || "123 Gourmet Street, Dummy Location",
            customerId: cleanCustomerId,
            shopId: cleanShopId,
            status: "pending"
        });

        res.json({ 
            success: true,
            message: "Order Placed (Cash on Delivery)",
            orderId: newOrder._id,
            order: newOrder
        });
        
        // Trigger AI geo-spatial assignment in background
        if (cleanCustomerId) {
            autoAssignOrder(newOrder._id, cleanCustomerId).catch(() => {});
        }
    } catch (err) {
        console.error("COD Checkout error:", err);
        res.status(500).json({ error: "COD Checkout failed" });
    }
};

// CREATE Online/Razorpay Order Routes
router.post("/create-order", handleCreateOrder);
router.post("/api/create-order", handleCreateOrder);
router.post("/create-razorpay-order", handleCreateOrder);
router.post("/api/create-razorpay-order", handleCreateOrder);

// COD Checkout Routes
router.post("/cod", handleCodOrder);
router.post("/api/cod", handleCodOrder);

module.exports = router;
