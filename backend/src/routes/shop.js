const express = require("express");
const router = express.Router();
const Shop = require("../models/Shop");
const authenticate = require("../middleware/auth");
const { upload } = require("../middleware/multer");
const uploadOnCloudinary = require("../utils/cloudinary");

// CREATE OR EDIT SHOP (Owner only)
router.post("/create-edit", authenticate, upload.single("image"), async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: "Forbidden. Owners only." });
        }
        
        const userId = req.user.userId;
        const { name, city, state, address, district, area, existingImage } = req.body;

        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadOnCloudinary(req.file.path);
        }

        if (!imageUrl && existingImage) {
            imageUrl = existingImage;
        }

        let shop = await Shop.findOne({ owner: userId });

        if (!shop) {
            shop = await Shop.create({
                name,
                city,
                state,
                address,
                district: district || "",
                area: area || "",
                owner: userId,
                image: imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
            });
        } else {
            shop = await Shop.findByIdAndUpdate(
                shop._id,
                {
                    name,
                    city,
                    state,
                    address,
                    district: district || shop.district,
                    area: area || shop.area,
                    image: imageUrl || shop.image,
                },
                { new: true }
            );
        }

        await shop.populate([
            { path: "owner", select: "name email" },
            { path: "items" }
        ]);

        return res.status(201).json(shop);
    } catch (error) {
        console.error("Shop create-edit error:", error);
        return res.status(500).json({
            error: "Error in creating or updating shop",
            details: error.message,
        });
    }
});

// GET OWNER'S SHOP
router.get("/get-my", authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: "Forbidden. Owners only." });
        }
        const shop = await Shop.findOne({ owner: req.user.userId })
            .populate({ path: "owner", select: "name email" })
            .populate({
                path: "items",
                options: { sort: { updatedAt: -1 } },
            });

        return res.status(200).json(shop || null);
    } catch (error) {
        return res.status(500).json({
            error: "Error in getting shop",
            details: error.message,
        });
    }
});

// GET SHOPS BY DISTRICT & AREA (Customer browses shops in their location)
router.get("/get-by-location", async (req, res) => {
    try {
        const { district, area } = req.query;
        let query = {};
        
        if (district) {
            query.district = { $regex: new RegExp(district.trim(), "i") };
        }
        if (area) {
            query.area = { $regex: new RegExp(area.trim(), "i") };
        }

        const shops = await Shop.find(query).populate("items");
        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({
            error: "Error in fetching shops by location",
            details: error.message,
        });
    }
});

module.exports = router;
