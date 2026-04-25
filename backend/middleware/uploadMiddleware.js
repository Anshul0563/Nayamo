const multer = require("multer");
const path = require("path");

// Allowed file types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${ALLOWED_MIME_TYPES.join(", ")} are allowed.`), false);
  }
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

module.exports = upload;
