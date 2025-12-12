const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.Cloudinary_CLOUD_NAME,
    api_key: process.env.Cloudinary_CLOUD_API_KEY,
    api_secret: process.env.Cloudinary_CLOUD_SECRET_KEY
});

// FIXED: Define storage OUTSIDE try-catch so upload exists
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'sanatan_gym_members_photo',
        format: 'jpg', // Convert everything to jpg
        transformation: [
            { width: 500, height: 500, crop: 'limit' }
        ]
    })
});

// FIX: multer declared outside so it's exported properly
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// OPTIONAL: test config
try {
    cloudinary.api.ping();
    console.log("Cloudinary connected successfully");
} catch (err) {
    console.log("Cloudinary config error:", err);
}

module.exports = { upload, cloudinary };
