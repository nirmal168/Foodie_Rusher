const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

router.get("/", async (req, res) => {
    try {
        const districts = await Location.find({}, 'district');
        res.json(districts.map(d => d.district));
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch districts" });
    }
});

router.get("/:district/areas", async (req, res) => {
    try {
        const { district } = req.params;
        const location = await Location.findOne({ district });
        res.json(location ? location.areas : []);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch areas" });
    }
});

module.exports = router;
