const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { register, login, getProfile, refreshToken, logout, logoutAll } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be 8-128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const refreshValidation = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required"),
];

const logoutValidation = [
  body("refreshToken")
    .optional()
    .notEmpty()
    .withMessage("Refresh token cannot be empty"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/refresh", refreshValidation, validate, refreshToken);
router.post("/logout", protect, logoutValidation, validate, logout);
router.post("/logout-all", protect, logoutAll);
router.get("/profile", protect, getProfile);

module.exports = router;
