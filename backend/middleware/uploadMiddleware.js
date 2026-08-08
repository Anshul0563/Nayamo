const multer = require("multer");

// Allowed file types
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];
const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_VIDEO_MIME_TYPES];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE = MAX_VIDEO_SIZE; // Multer global limit (videos are largest)

// File signature validation (magic bytes)
const VALID_SIGNATURES = {
  "image/jpeg": ["FFD8FF"],
  "image/png": ["89504E47"],
  "image/webp": ["52494646"],
  "image/jpg": ["FFD8FF"],
  "video/mp4": ["66747970", "0000001466747970"], // ftyp
  "video/quicktime": ["66747970"], // ftyp (QuickTime .mov)
  "video/x-msvideo": ["52494646"], // RIFF (AVI)
  "video/webm": ["1A45DFA3"], // EBML header
};

const isVideoMime = (mimeType) => ALLOWED_VIDEO_MIME_TYPES.includes(mimeType);

const validateFileSignature = (buffer) => {
  const hex = buffer.toString("hex", 0, 16).toUpperCase();
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
    files: 6, // Max 6 files per upload (5 images + 1 video)
  },
});

// Middleware to validate file signatures after upload
const validateSignatures = (req, res, next) => {
  const collectFiles = () => {
    if (req.file) return [req.file];
    if (Array.isArray(req.files)) return req.files;
    if (req.files && typeof req.files === "object") {
      return Object.values(req.files).flat();
    }
    return [];
  };

  const files = collectFiles();

  for (const file of files) {
    const signatureValid = validateFileSignature(file.buffer);
    const sizeValid = isVideoMime(file.mimetype)
      ? file.size <= MAX_VIDEO_SIZE
      : file.size <= MAX_IMAGE_SIZE;

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid file signature. File may be corrupted or malicious.",
      });
    }
    if (!sizeValid) {
      return res.status(400).json({
        success: false,
        message: isVideoMime(file.mimetype)
          ? "Each review video must be 50 MB or smaller"
          : "Each review image must be 5 MB or smaller",
      });
    }
  }

  next();
};

module.exports = upload;
module.exports.validateSignatures = validateSignatures;
module.exports.isVideoMime = isVideoMime;
module.exports.ALLOWED_VIDEO_MIME_TYPES = ALLOWED_VIDEO_MIME_TYPES;
