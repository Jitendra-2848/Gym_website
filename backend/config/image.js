const sharp = require('sharp'); // ⚡ REQUIRES: npm install sharp

// ============ IMAGE HELPER - NO CLOUDINARY ============
// Stores compressed base64 in database

const MAX_SIZE_KB = 5; // Max after compression

const compressBase64 = async (base64String, maxWidth = 300, quality = 60) => {
    try {
        // 1. Basic Validation
        if (!base64String || !base64String.startsWith('data:image')) {
            return null;
        }

        // 2. Check if already small enough (skip compression)
        // (Approx calculation: Base64 length * 0.75 = bytes)
        const sizeKB = (base64String.length * 0.75) / 1024;
        if (sizeKB < 50) {
            return base64String;
        }

        // 3. Extract buffer from Base64
        // Split "data:image/png;base64,iVBOR..." -> get the part after comma
        const uriSplit = base64String.split(',');
        const imgBuffer = Buffer.from(uriSplit[1], 'base64');

        // 4. Use SHARP to Resize & Compress
        // We convert to JPEG because it offers the best compression for photos
        const compressedBuffer = await sharp(imgBuffer)
            .resize(maxWidth, null, { 
                withoutEnlargement: true, // Don't stretch small images
                fit: 'inside' 
            })
            .toFormat('jpeg', { quality: quality }) 
            .toBuffer();

        // 5. Convert back to Base64
        return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

    } catch (error) {
        console.error("Compression Failed:", error.message);
        // If compression crashes, return the original image as a fallback
        return base64String;
    }
};

const validateImage = (base64String) => {
    if (!base64String) {
        return { valid: true, value: '' };
    }

    if (typeof base64String === 'string' && base64String.startsWith('http')) {
        return { valid: true, value: base64String };
    }
    if (!base64String.startsWith('data:image')) {
        return { valid: false, message: 'Invalid image format' };
    }
    const sizeKB = (base64String.length * 0.75) / 1024;
    if (sizeKB > 5000) { // Max 5MB Input allowed
        return { valid: false, message: 'Image too large. Max 5MB allowed' };
    }
    const validTypes = ['data:image/jpeg', 'data:image/png', 'data:image/jpg', 'data:image/webp'];
    const isValidType = validTypes.some(type => base64String.startsWith(type));
    if (!isValidType) {
        return { valid: false, message: 'Only JPG, PNG, WEBP images allowed' };
    }

    return { valid: true, value: base64String };
};

const upload = {
    single: (fieldName) => {
        return async (req, res, next) => {
            try {
                const imageData = req.body[fieldName];

                if (!imageData) {
                    req.fileUrl = null;
                    return next();
                }

                if (typeof imageData === 'string' && imageData.startsWith('http')) {
                    req.fileUrl = imageData;
                    return next();
                }

                const validation = validateImage(imageData);
                
                if (!validation.valid) {
                    req.fileUrl = null;
                    req.imageError = validation.message;
                    return next();
                }

                const compressedImage = await compressBase64(validation.value);
                
                req.fileUrl = compressedImage;
                
                delete req.body[fieldName];

                next();

            } catch (error) {
                console.error('Image middleware error:', error.message);
                req.fileUrl = null;
                next();
            }
        };
    }
};

console.log("Image Helper Ready (Base64 Storage + Sharp Compression)");

module.exports = {
    upload,
    validateImage,
    compressBase64,
};