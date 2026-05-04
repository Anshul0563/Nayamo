const multer = require("multer");
const path = require("path");
const logger = require("../config/logger");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      logger.warn("Invalid file type:", file.mimetype);
      cb(new Error("Images only (jpeg, png, gif) - max 5MB"));
    }
  },
});

const validateSignatures = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one image required",
    });
  }

  // Limit to 5 images
  if (req.files.length > 5) {
    return res.status(400).json({
      success: false,
      message: "Maximum 5 images allowed",
    });
  }

  next();
};

module.exports = { upload, validateSignatures };

