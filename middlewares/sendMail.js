const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const loadTemplate = (fileName, data) => {
  const templatePath = path.join(__dirname, "../emailTemplate", fileName);
  let template = fs.readFileSync(templatePath, "utf8");

  // Replace placeholders with actual data
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    template = template.replace(new RegExp(placeholder, "g"), value);
  }

  return template;
};

const sendMail = async (email, subject, data) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  // Load OTP HTML template
  const html = loadTemplate("otpVerification.html", {
    first_name: data.first_name,
    otp: data.otp,
  });

  // Send OTP email to user
  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject: subject,
    html: html,
  });
};

const sendAdminEmail = async (data, email) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  // Load Registration details HTML template
  const adminHtml = loadTemplate("userRegistration.html", {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    mobile_number: data.mobile_number,
  });

  // Send registration details to admin
  await transport.sendMail({
    from: process.env.Gmail,
    to: "badgujark404@gmail.com", // Admin email address
    subject: "New User Registration",
    html: adminHtml,
  });

  // Load Welcome details HTML template
  const welcomeHtml = loadTemplate("welcomeUser.html", {
    first_name: data.first_name,
  });

  // Send welcome message to user
  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject: "Welcome to blog system",
    html: welcomeHtml,
  });
};

const sendForgotMail = async (subject, data) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  // Load Forgot Password OTP HTML template
  const html = loadTemplate("forgotPassword.html", {
    otp: data.otp,
  });

  await transport.sendMail({
    from: process.env.Gmail,
    to: data.email,
    subject,
    html,
  });
};

module.exports = {
  sendMail,
  sendForgotMail,
  sendAdminEmail
};
