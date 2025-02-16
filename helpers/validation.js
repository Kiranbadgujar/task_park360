const { body } = require("express-validator");

exports.registrationValidator = [
  body("first_name").trim().notEmpty().withMessage("First name is required"),
  body("last_name").trim().notEmpty().withMessage("Last name is required"),
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  body("contact_number").trim().isLength({ min: 10, max: 10 }).withMessage("Invalid mobile number"),
  // body("address").trim().isLength({ max: 8 }).withMessage("Invalid address"),
];

exports.loginValidator = [
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];
