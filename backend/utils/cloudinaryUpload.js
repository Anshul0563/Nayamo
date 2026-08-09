const cloudinary = require("../config/cloudinary");

/**
 * Upload a Buffer to Cloudinary using a data-URI stream.
 *
 * Uses the existing Cloudinary configuration (backend only). No temporary
 * files are written to disk — the raw buffer is base64-encoded and streamed
 * directly to Cloudinary.
 *
 * @param {Buffer} buffer - The raw file buffer (e.g. from Multer memoryStorage).
 * @param {object} [options] - Cloudinary upload options.
 * @param {string} options.resource_type - "image" or "video".
 * @param {string} options.folder - Cloudinary folder to upload into.
 * @param {string} [options.mimetype] - The file MIME type (used for the data URI).
 * @throws {Error} If the buffer is missing or the upload fails / returns no URL.
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadBufferToCloudinary = async (buffer, options = {}) => {
  const {
    resource_type = "image",
    folder = "",
    mimetype = "application/octet-stream",
    ...rest
  } = options;

  if (!buffer || !(buffer instanceof Buffer) || buffer.length === 0) {
    throw new Error("Upload buffer is missing or empty");
  }

  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type,
    folder,
    ...rest,
  });

  if (!result || !result.secure_url || !result.public_id) {
    // Cloudinary may return a partial result on some failures; surface a clear
    // error so callers can roll back any already-uploaded assets.
    throw new Error(
      `Cloudinary upload did not return a usable ${resource_type} (public_id: ${
        result?.public_id || "none"
      })`,
    );
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

module.exports = { uploadBufferToCloudinary };
