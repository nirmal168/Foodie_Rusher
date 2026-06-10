require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Location = require("../src/models/Location");

const gujaratData = [
    {
        district: "Ahmedabad",
        areas: [
            { name: "Satellite", pincode: "380015", coordinates: { lat: 23.0298, lng: 72.5333 } },
            { name: "Navrangpura", pincode: "380009", coordinates: { lat: 23.0373, lng: 72.5613 } },
            { name: "Prahlad Nagar", pincode: "380015", coordinates: { lat: 23.0120, lng: 72.5108 } },
            { name: "Vastrapur", pincode: "380015", coordinates: { lat: 23.0350, lng: 72.5293 } },
            { name: "Bopal", pincode: "380058", coordinates: { lat: 23.0338, lng: 72.4633 } }
        ]
    },
    {
        district: "Surat",
        areas: [
            { name: "Adajan", pincode: "395009", coordinates: { lat: 21.1925, lng: 72.7997 } },
            { name: "Vesu", pincode: "395007", coordinates: { lat: 21.1415, lng: 72.7744 } },
            { name: "Piplod", pincode: "395007", coordinates: { lat: 21.1593, lng: 72.7795 } },
            { name: "Varachha", pincode: "395006", coordinates: { lat: 21.2121, lng: 72.8660 } }
        ]
    },
    {
        district: "Vadodara",
        areas: [
            { name: "Alkapuri", pincode: "390007", coordinates: { lat: 22.3117, lng: 73.1706 } },
            { name: "Sayajigunj", pincode: "390005", coordinates: { lat: 22.3106, lng: 73.1873 } },
            { name: "Gotri", pincode: "390021", coordinates: { lat: 22.3218, lng: 73.1417 } }
        ]
    },
    {
        district: "Rajkot",
        areas: [
            { name: "Kalavad Road", pincode: "360005", coordinates: { lat: 22.2844, lng: 70.7600 } },
            { name: "University Road", pincode: "360005", coordinates: { lat: 22.2917, lng: 70.7728 } },
            { name: "Mundra Road", pincode: "360001", coordinates: { lat: 22.2989, lng: 70.7960 } }
        ]
    }
];

async function seed() {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/food_delivery";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB for seeding locations...");
        
        await Location.deleteMany({});
        console.log("Cleared existing locations.");
        
        await Location.insertMany(gujaratData);
        console.log("Successfully seeded Gujarat locations!");
        
        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
