const multer = require("multer");
const path = require("path");

// Allowed file types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// File signature validation (magic bytes)
const VALID_SIGNATURES = {
  "image/jpeg": ["FFD8FF"],
  "image/png": ["89504E47"],
  "image/webp": ["52494646"],
  "image/jpg": ["FFD8FF"],
};

const validateFileSignature = (buffer) => {
  const hex = buffer.toString("hex", 0, 4).toUpperCase();
  return Object.values(VALID_SIGNATURES).some((signatures) =>
    signatures.some((sig) => hex.startsWith(sig))
  );
};

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type. Only ${ALLOWED_MIME_TYPES.join(", ")} are allowed.`), false);
  }

  // Additional validation happens after upload in memory
  cb(null, true);
};

// Memory storage for security (avoids temp file leaks)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Max 5 files per upload
  },
});

// Middleware to validate file signatures after upload
const validateSignatures = (req, res, next) => {
  if (!req.file && (!req.files || req.files.length === 0)) {
    return next();
  }

  const files = req.file ? [req.file] : req.files;

  for (const file of files) {
    if (!validateFileSignature(file.buffer)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file signature. File may be corrupted or malicious.",
      });
    }
  }

  next();
};

module.exports = upload;
module.exports.validateSignatures = validateSignatures;
