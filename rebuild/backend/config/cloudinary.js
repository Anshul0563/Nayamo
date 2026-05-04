const cloudinary = require("cloudinary").v2;
const logger = require("./logger");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (buffer, folder = "products") => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { 
        folder,
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) throw error;
        return result;
      }
    ).end(buffer);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};

module.exports = { cloudinary, uploadImage };

