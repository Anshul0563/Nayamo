
 const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  register,
  login,
  logout,
  profile,
  refresh,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

// Validation
const authValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("Password min 8 chars"),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name 2-50 chars"),
];

// Routes
router.post("/register", authValidation, validate, register);
router.post("/login", authValidation, validate, login);

router.use(protect); // All below protected

router.post("/logout", logout);
router.get("/profile", profile);
router.post("/refresh", refresh);

module.exports = router;

