require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require("../src/models/User");
const Order = require("../src/models/Order");

async function seed() {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/food_delivery";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding test data...");

    // Cleanup existing test data if any
    await User.deleteMany({ email: /test/ });
    await Order.deleteMany({ deliveryAddress: /Test/ });

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Owner
    const owner = await User.create({
        name: 'Test Owner',
        email: 'owner@test.com',
        password: hashedPassword,
        role: 'owner',
        inviteCode: '701674'
    });
    console.log("Created Owner: owner@test.com / password123");

    // Create Staff
    const staff = await User.create({
        name: 'Test Staff',
        email: 'staff@test.com',
        password: hashedPassword,
        role: 'staff',
        employerId: owner._id,
        inviteCode: '701674',
        staffRegistrationCode: 'STF-TEST'
    });
    console.log("Created Staff: staff@test.com / password123");

    // Create Customer
    const customer = await User.create({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: hashedPassword,
        role: 'customer'
    });
    console.log("Created Customer: customer@test.com / password123");

    // Create some Orders
    await Order.create([
        {
            items: [{ name: 'Margherita Pizza', price: 399 }, { name: 'Iced Caramel Macchiato', price: 179 }],
            total: 578,
            paymentStatus: 'success',
            deliveryAddress: 'Test Sector 12, Faridabad',
            customerId: customer._id,
            status: 'pending'
        },
        {
            items: [{ name: 'Double Cheese Burger', price: 199 }],
            total: 199,
            paymentStatus: 'success',
            deliveryAddress: 'Test Block B, Delhi',
            customerId: customer._id,
            status: 'pending'
        }
    ]);
    console.log("Created 2 Pending Orders");

    process.exit();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
