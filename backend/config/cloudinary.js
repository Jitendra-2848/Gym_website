const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.Cloudinary_CLOUD_NAME,
    api_key: process.env.Cloudinary_CLOUD_API_KEY,
    api_secret: process.env.Cloudinary_CLOUD_SECRET_KEY
});

const uploadToCloudinary = async (base64String) => {
    try {
        if (!base64String) return null;
        if (!base64String.startsWith('data:image')) return null;

        const result = await cloudinary.uploader.upload(base64String, {
            folder: 'sanatan_gym_members_photo'
        });

        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error.message);
        return null;
    }
};

const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl || !imageUrl.includes('cloudinary')) return false;

        const parts = imageUrl.split('/');
        const fileName = parts[parts.length - 1].split('.')[0];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${fileName}`;

        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Cloudinary delete error:', error.message);
        return false;
    }
};

cloudinary.api.ping()
    .then(() => console.log("✅ Cloudinary connected"))
    .catch((err) => console.log("❌ Cloudinary error:", err.message));

module.exports = {
    cloudinary,
    uploadToCloudinary,
    deleteFromCloudinary
};