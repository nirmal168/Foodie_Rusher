const User = require("../models/User");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { getIo } = require("../sockets/socketHandler");

const autoAssignOrder = async (orderId, customerId) => {
    try {
        const availableStaff = await User.find({ role: 'staff' });
        if (availableStaff.length > 0) {
            // Artificial intelligence heuristic algorithm mock logic
            const nearestStaff = availableStaff[Math.floor(Math.random() * availableStaff.length)];
            
            const order = await Order.findByIdAndUpdate(orderId, { 
                staffId: nearestStaff._id, 
                status: 'preparing' 
            }, { new: true });
            
            if (!order) return;

            const io = getIo();

            const staffNotification = await Notification.create({
                userId: nearestStaff._id,
                title: "🤖 AI Smart Assignment",
                message: `Order #${order._id.toString().slice(-6)} was auto-assigned. Our AI detected you as the nearest optimal partner!`
            });
            io.to(nearestStaff._id.toString()).emit("new-notification", staffNotification);

            const customerNotification = await Notification.create({
                userId: customerId,
                title: "🤖 Driver Found",
                message: `Our AI matched you with ${nearestStaff.name}, the nearest partner for lightning-fast delivery.`
            });
            io.to(customerId.toString()).emit("new-notification", customerNotification);
            io.to(order._id.toString()).emit('order-status-update', order);
            
            console.log(`[AI Engine] Order ${orderId} matched to nearest staff ${nearestStaff.email}`);
        }
    } catch (err) {
        console.error("[AI Auto Assign Error]:", err);
    }
};

module.exports = autoAssignOrder;
