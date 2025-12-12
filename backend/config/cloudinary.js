const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.Cloudinary_CLOUD_NAME,
    api_key: process.env.Cloudinary_CLOUD_API_KEY,
    api_secret: process.env.Cloudinary_CLOUD_SECRET_KEY
});

// ============ UPLOAD BASE64 TO CLOUDINARY ============
const uploadToCloudinary = async (base64String) => {
    try {
        if (!base64String) return null;
        if (!base64String.startsWith('data:image')) return null;

        const result = await cloudinary.uploader.upload(base64String, {
            folder: 'sanatan_gym_members_photo',
            transformation: [
                {
                    width: 400,
                    height: 400,
                    crop: 'fill',
                    gravity: 'face',
                    quality: 'auto:low'
                }
            ]
        });

        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error.message);
        return null;
    }
};

// ============ DELETE FROM CLOUDINARY ============
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

// ============ MIDDLEWARE: UPLOAD SINGLE IMAGE ============
const upload = {
    single: (fieldName) => {
        return async (req, res, next) => {
            try {
                const base64Image = req.body[fieldName];

                // No image provided - continue
                if (!base64Image) {
                    req.fileUrl = null;
                    return next();
                }

                // Already a URL (not base64) - keep it
                if (base64Image.startsWith('http')) {
                    req.fileUrl = base64Image;
                    return next();
                }

                // Upload base64 to Cloudinary
                if (base64Image.startsWith('data:image')) {
                    const url = await uploadToCloudinary(base64Image);
                    req.fileUrl = url;
                    
                    // Remove base64 from body to save memory
                    delete req.body[fieldName];
                    
                    return next();
                }

                // Invalid format
                req.fileUrl = null;
                next();

            } catch (error) {
                console.error('Upload middleware error:', error.message);
                req.fileUrl = null;
                next();
            }
        };
    }
};

// Test connection
cloudinary.api.ping()
    .then(() => console.log("✅ Cloudinary connected"))
    .catch((err) => console.log("❌ Cloudinary error:", err.message));

module.exports = { 
    upload, 
    cloudinary,
    uploadToCloudinary,
    deleteFromCloudinary
};