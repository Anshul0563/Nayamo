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
const isVideoMime = (mimeType) => ALLOWED_VIDEO_MIME_TYPES.includes(mimeType);

const validateFileSignature = (buffer, mimeType) => {
  if (!Buffer.isBuffer(buffer)) return false;
  const hex = buffer.toString("hex").toUpperCase();
  const ascii = buffer.toString("ascii");

  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      return hex.startsWith("FFD8FF");
    case "image/png":
      return hex.startsWith("89504E470D0A1A0A");
    case "image/webp":
      return ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP";
    case "video/mp4":
    case "video/quicktime":
      return ascii.slice(4, 8) === "ftyp";
    case "video/x-msvideo":
      return ascii.startsWith("RIFF") && ascii.slice(8, 12) === "AVI ";
    case "video/webm":
      return hex.startsWith("1A45DFA3");
    default:
      return false;
  }
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

const createUpload = (fileSize, files) => multer({
  storage,
  fileFilter,
  limits: {
    fileSize,
    files,
  },
});

const upload = createUpload(MAX_FILE_SIZE, 6);
const imageUpload = createUpload(MAX_IMAGE_SIZE, 5);

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
    const signatureValid = validateFileSignature(file.buffer, file.mimetype);
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

upload.validateSignatures = validateSignatures;
imageUpload.validateSignatures = validateSignatures;
module.exports = upload;
module.exports.imageUpload = imageUpload;
module.exports.isVideoMime = isVideoMime;
module.exports.ALLOWED_VIDEO_MIME_TYPES = ALLOWED_VIDEO_MIME_TYPES;
