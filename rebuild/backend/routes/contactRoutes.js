const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const contactController = require("../controllers/contactController");

const validate = require("../middleware/validateMiddleware");

const contactValidation = [
  body("name").notEmpty().withMessage("Name required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("message").notEmpty().withMessage("Message required"),
];

router.post("/", contactValidation, validate, contactController.sendMessage);

module.exports = router;

