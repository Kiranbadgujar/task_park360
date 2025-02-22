const { body } = require("express-validator");

 const registrationValidator = [
  body("first_name").trim().notEmpty().withMessage("First name is required"),
  body("last_name").trim().notEmpty().withMessage("Last name is required"),
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  body("role").trim().notEmpty().withMessage("Please define your role"),
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];

const postValidator = [
  body("title").trim().isLength({ min: 5, max: 15 }).withMessage("Title must be between 5 and 15 characters"),
  body("content").trim().isLength({ min: 8 }).withMessage("Content must be at least 8 characters long"),
];

const commentValidator = [
  body("postId").trim().notEmpty().withMessage("Please provide a valid post ID"),
  body("comment").trim().isLength({ min: 8 }).withMessage("Comment must be at least 8 characters long"),
];

const likeValidator = [
  body("postId").trim().notEmpty().withMessage("Please provide a valid post ID"),
  body("like").trim().isBoolean().withMessage("Please provide 1 or 0 for like")
];


module.exports = {registrationValidator,loginValidator,postValidator,commentValidator,likeValidator}
