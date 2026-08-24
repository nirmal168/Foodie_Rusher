require("dotenv").config();
const path = require("path");
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
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(",") 
      : [];
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('Not allowed by CORS'));
    }
    return callback(null, true); // Dev fallback: reflect origin
  },
  credentials: true
};
app.use(cors(corsOptions));
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
const PORT = process.env.PORT || 5000;

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Mounting Routes
app.use("/", authRouter); // handles login, register, me
app.use("/auth", authRouter); // alias for auth routes (e.g., /auth/register)
app.use("/", ordersRouter); // handles orders, staff, payments, etc.
app.use("/api/profile", profileRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemsRouter);

// Wildcard route to serve React index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Start server after routes and index handling
server.listen(PORT, () => console.log(`Server running on port ${PORT} with Real-time Support`));
