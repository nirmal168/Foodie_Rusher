const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Shop = require("../models/Shop");
const authenticate = require("../middleware/auth");
const { upload } = require("../middleware/multer");
const uploadOnCloudinary = require("../utils/cloudinary");

// ADD ITEM TO MENU (Owner only)
router.post("/add", authenticate, upload.single("image"), async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: "Forbidden. Owners only." });
        }

        const { name, category, foodType, price } = req.body;
        let imageUrl = "";

        if (req.file) {
            imageUrl = await uploadOnCloudinary(req.file.path);
        }

        const shop = await Shop.findOne({ owner: req.user.userId });
        if (!shop) {
            return res.status(404).json({ error: "Shop not found. Create your shop first." });
        }

        const item = await Item.create({
            name,
            image: imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
            category,
            foodType,
            price: Number(price),
            shop: shop._id
        });

        shop.items.push(item._id);
        await shop.save();

        await shop.populate([
            { path: "owner", select: "name email" },
            { path: "items", options: { sort: { updatedAt: -1 } } }
        ]);

        return res.status(201).json(shop);
    } catch (error) {
        console.error("Item add error:", error);
        return res.status(500).json({ error: "Error in adding item", details: error.message });
    }
});

// EDIT MENU ITEM (Owner only)
router.put("/edit/:itemId", authenticate, upload.single("image"), async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: "Forbidden. Owners only." });
        }

        const { itemId } = req.params;
        const { name, category, foodType, price, existingImage } = req.body;
        
        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadOnCloudinary(req.file.path);
        }

        const updateData = {
            name,
            category,
            foodType,
            price: Number(price),
        };

        if (imageUrl) {
            updateData.image = imageUrl;
        } else if (existingImage) {
            updateData.image = existingImage;
        }

        const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true });
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        const shop = await Shop.findOne({ owner: req.user.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        });

        return res.status(200).json(shop);
    } catch (error) {
        console.error("Item edit error:", error);
        return res.status(500).json({ error: "Error in editing item", details: error.message });
    }
});

// DELETE MENU ITEM (Owner only)
router.delete("/delete/:itemId", authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: "Forbidden. Owners only." });
        }

        const { itemId } = req.params;

        const item = await Item.findByIdAndDelete(itemId);
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        const shop = await Shop.findOne({ owner: req.user.userId });
        if (shop) {
            shop.items = shop.items.filter(id => id.toString() !== itemId);
            await shop.save();
            await shop.populate({
                path: "items",
                options: { sort: { updatedAt: -1 } }
            });
        }

        return res.status(200).json(shop);
    } catch (error) {
        console.error("Item delete error:", error);
        return res.status(500).json({ error: "Error in deleting item", details: error.message });
    }
});

// GET ITEMS BY SHOP
router.get("/get-by-shop/:shopId", async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId).populate("items");
        if (!shop) {
            return res.status(404).json({ error: "Shop not found" });
        }

        return res.status(200).json({
            shop,
            items: shop.items
        });
    } catch (error) {
        return res.status(500).json({ error: "Error in getting items by shop", details: error.message });
    }
});

// RATE ITEM
router.post("/rating", async (req, res) => {
    try {
        const { itemId, rating } = req.body;
        if (!itemId || !rating) {
            return res.status(400).json({ error: "itemId and rating are required" });
        }
        const numericRating = Number(rating);
        if (numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        const newCount = item.rating.count + 1;
        const newAverage = ((item.rating.average * item.rating.count) + numericRating) / newCount;
        item.rating.count = newCount;
        item.rating.average = newAverage;
        await item.save();

        return res.status(200).json({ rating: item.rating });
    } catch (error) {
        return res.status(500).json({ error: "Error in rating item", details: error.message });
    }
});

module.exports = router;
