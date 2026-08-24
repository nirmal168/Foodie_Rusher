const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

const getDistricts = async (req, res) => {
    try {
        const districts = await Location.find({}, 'district');
        res.json(districts.map(d => d.district));
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch districts" });
    }
};

const getAllAreas = async (req, res) => {
    try {
        const locations = await Location.find({});
        const allAreas = locations.flatMap(l => l.areas || []);
        res.json(allAreas);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch all areas" });
    }
};

// GET /api/locations and /api/locations/districts
router.get("/", getDistricts);
router.get("/districts", getDistricts);

// GET /api/locations/areas
router.get("/areas", getAllAreas);

// GET /api/locations/:district/areas
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
