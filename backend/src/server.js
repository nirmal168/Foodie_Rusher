require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const { initSockets } = require("./sockets/socketHandler");

// Import Routers
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const profileRouter = require("./routes/profile");
const locationsRouter = require("./routes/locations");
const notificationsRouter = require("./routes/notifications");
const shopRouter = require("./routes/shop");
const itemsRouter = require("./routes/items");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSockets(server);

// Middleware
app.use(cors());
app.use(express.json());

const User = require('./models/User');
// Ensure old unique index on staffRegistrationCode is removed (if present)
const mongoose = require('mongoose');
// Connect to MongoDB
connectDB();
// After connection, ensure old unique index is removed
mongoose.connection.once('open', async () => {
    try {
        await mongoose.connection.collection('users').dropIndex('staffRegistrationCode_1');
        console.log('Dropped staffRegistrationCode unique index');
    } catch (err) {
        if (err.codeName !== 'IndexNotFound') {
            console.error('Error dropping index:', err.message);
        }
    }
});
const PORT = process.env.PORT || 5001;

// Mounting Routes
app.use("/", authRouter); // handles login, register, me
app.use("/auth", authRouter); // alias for auth routes (e.g., /auth/register)
app.use("/", ordersRouter); // handles orders, staff, payments, etc.
app.use("/api/locations", locationsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemsRouter);

// Start server after routes and index handling
server.listen(PORT, () => console.log(`Server running on port ${PORT} with Real-time Support`));
