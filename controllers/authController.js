const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { QueryTypes } = require("sequelize");
const { PDFDocument } = require("pdf-lib");
const json2xls = require('json2xls');
const fs = require("fs")
const path =require("path")
const { sendMail, sendForgotMail} = require("../middlewares/sendMail")

// Express-validator
const validation = (req, res) => {
  const error = validationResult(req, res);
  if (!error.isEmpty()) {
    return res.status(400).json({ status: 400, errors: error.array() });
  }
};

// Register User
const registerUser = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  const { first_name, last_name, email, password, role, mobile_number } =
    req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(400)
        .json({ status: 400, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(Math.random()*100000);
    const activationToken = jwt.sign(
      {
        first_name,last_name,email,password:hashedPassword,role,mobile_number,otp
      },
      process.env.Activation_Secret,
      {
        expiresIn : "1m"
      }
    );

    const data = {
      first_name,
      otp
    };

    await sendMail(email,"Blog-system",data)

    return res.status(201).json({ status: 201, message: "OTP Sent To Your Mail",activationToken});
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Error registering user", err });
  }
};

// Verify otp
const VerifyUser = async (req, res) => {
  try {
    const { otp, activation } = req.body;
    // console.log(otp);
    // console.log(activation)

    if (!activation) {
      return res.status(400).json({
        message: "Activation token is required",
      });
    }

    const verify = jwt.verify(activation, process.env.Activation_Secret);
    // console.log(verify);

    if (!verify) {
      return res.status(400).json({
        message: "Activation token expired or invalid",
      });
    }

    // Check OTP
    if (String(verify.otp) !== String(otp)) {
      return res.status(400).json({
        message: "Wrong OTP",
      });
    }

    await User.create({
      first_name: verify.first_name,
      last_name: verify.last_name,
      email: verify.email,
      password: verify.password,
      mobile_number: verify.mobile_number,
      role:verify.role
    });

    return res.status(200).json({
      message: "OTP Verified Successfully",
    });
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(500).json({
      message: "Failed to verify activation token",
      error: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ status: 400, message: "No email exists" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ status: 400, message: "Invalid password" });
    }

    const payload = {
      user_id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res
      .status(200)
      .json({ status: 200, message: "Login successful", token });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Error logging in", err });
  }
};

// forget password
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ status: 400, message: "No email exists" });
    }

    const otp = Math.floor(Math.random() * 100000);
    const activationToken = jwt.sign(
      { otp , email },
      process.env.Activation_Secret,
      { expiresIn: "55m" }
    );

    // Sending OTP mail
    const data = {
      email: user.email,
      otp
    };

    await sendForgotMail("Password Reset OTP", data);

    return res.status(201).json({
      status: 201,
      message: "OTP Sent To Your Mail",
      activationToken
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 500, message: "Error processing request", err });
  }
};

// reset password
const resetPassword = async (req, res) => {
  const { otp, password, activation } = req.body;
  console.log(otp,password,activation);

  try {
    // Verify the activation token (OTP)
    const decoded = jwt.verify(activation, process.env.Activation_Secret);
    const emailcheck =  decoded.email 
    console.log(emailcheck)
    if (String(decoded.otp) !== String(otp)) {
      return res.status(400).json({ status: 400, message: 'Invalid OTP' });
    }

    // Find the user (You might want to store the user ID in the token if needed)
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      return res.status(400).json({ status: 400, message: 'User not found' });
    }

    // Hash the new password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await user.update({ password: hashedPassword });

    return res.status(200).json({
      status: 200,
      message: 'Password successfully reset',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 500, message: 'Error resetting password', err });
  }
};

// Get All User
const getAllUsers = async (req, res) => {
  try {
    const users = await User.sequelize.query(
      'SELECT * FROM users WHERE role = "user"',
      {
        type: QueryTypes.SELECT,
      }
    );
    const countuser = users.length;
    res.status(200).json({ status: 200, countuser, users });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

// Get User By ID
const getUserById = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const user = await User.findOne({ where: { id: userId, is_active: 1 } });

    if (!user)
      return res
        .status(404)
        .json({ status: 404, message: "User not found OR user is inactive" });

    res.status(200).json({ status: 200, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPdate User
const updateUser = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const { userID } = req.params;
  const { first_name, last_name, email, password, mobile_number } = req.body;

  try {
    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (mobile_number) user.mobile_number = mobile_number;
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return res.status(200).json({ status: 200, message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating user", error: err.message });
  }
};

// Update Password
const updatePassword = async (req, res) => {
  const { userID } = req.params;
  const { password, currentPassword } = req.body;

  try {
    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Check if currentPassword matches the existing password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 400, message: "Current password is incorrect" });
    }

    // Check if the new password is the same as the current one
    if (password === currentPassword) {
      return res.status(400).json({ status: 400, message: "New password cannot be the same as the current password" });
    }

    // Hash the new password and update it
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ status: 200, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating password", error: err.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { userID } = req.params;
  try {
    const user = await User.findByPk(userID);
    if (!user)
      return res.status(404).json({ status: 404, message: "User not found" });
    await user.destroy();
    res.status(200).json({ status: 200, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};

// pdf
const downloadPdf = async (req, res) => {
  try {
    const userResponse = await getAllUsers(req, res);

    const users = userResponse.data.users;

    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await doc.embedFont(PDFDocument.StandardFonts.Helvetica);
    const fontSize = 12;

    page.drawText("Users List", {
      x: 20,
      y: height - 40,
      size: 18,
      font: font,
    });

    const headers = [
      "Sr.no",
      "First Name",
      "Last Name",
      "Email",
      "Number",
      "Role",
    ];

    const rows = users.map((user, index) => [
      index + 1,
      user.first_name,
      user.last_name,
      user.email,
      user.mobile_number,
      user.role,
    ]);

    const tableStartY = height - 70;
    const rowHeight = 20;
    const columnWidths = [40, 100, 100, 150, 100, 100];
    let yPosition = tableStartY;

    headers.forEach((header, colIndex) => {
      page.drawText(header, {
        x: 20 + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
        y: yPosition,
        size: fontSize,
        font: font,
      });
    });

    rows.forEach((row, rowIndex) => {
      yPosition -= rowHeight;
      row.forEach((cell, colIndex) => {
        page.drawText(String(cell), {
          x: 20 + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
          y: yPosition,
          size: fontSize,
          font: font,
        });
      });
    });

    const pdfBytes = await doc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users-list.pdf"'
    );

    res.send(pdfBytes);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
};

//excel
const downloadXls = async (req, res) => {
  try {
    // Fetch the users with role 'user' from the database
    const users = await User.sequelize.query(
      'SELECT * FROM users WHERE role = "user"',
      {
        type: QueryTypes.SELECT,
      }
    );

    // Convert the JSON data to an XLS format
    const xls = json2xls(users);

    // Path to save the file temporarily
    const filePath = './exported.xlsx';

    // Save the generated XLS file
    fs.writeFileSync(filePath, xls, 'binary');

    // Set the response headers for downloading the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=exported.xlsx');

    // Send the file as a response
    res.status(200).sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file.");
      }

      // Optional: Delete the file after it's been sent (if it's no longer needed)
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error("Error generating XLS:", error);
    res.status(500).send("Error generating XLS");
  }
};

module.exports = {
  loginUser,
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  downloadPdf,
  downloadXls,
  VerifyUser,
  forgetPassword,
  resetPassword,
  updatePassword
};
