const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name",
    api_key: process.env.CLOUDINARY_API_KEY || "your_api_key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "your_api_secret"
});

/**
 * Uploads a local file to Cloudinary and deletes the local copy.
 * @param {string} localFilePath - Path to the local file.
 * @returns {Promise<string|null>} - The Cloudinary secure URL or null.
 */
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "foodie_rusher"
        });
        
        // Clean up the local temp file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);
        // Clean up the local temp file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

module.exports = uploadOnCloudinary;
