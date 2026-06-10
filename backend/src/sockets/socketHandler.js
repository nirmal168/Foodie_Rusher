const { Server } = require("socket.io");
const User = require("../models/User");

let io = null;

const initSockets = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("join-order", (orderId) => {
            socket.join(orderId);
            console.log(`Socket ${socket.id} joined order room: ${orderId}`);
        });

        socket.on("join-user", (userId) => {
            socket.join(userId);
            console.log(`Socket ${socket.id} joined user room: ${userId}`);
        });

        socket.on("update-location", async (data) => {
            const { userId, lat, lng, orderId } = data;
            try {
                await User.findByIdAndUpdate(userId, { 
                    location: { lat, lng, updatedAt: new Date() } 
                });
                // Broadcast location to customers tracking this order
                io.to(orderId).emit("delivery-tracking", { lat, lng, userId });
            } catch (err) {
                console.error("Socket location update error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = {
    initSockets,
    getIo
};
