const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const {sequelize ,QueryTypes} = require('sequelize')

// Express-validator
const validation = (req, res) => {
  const error = validationResult(req, res);
  if (!error.isEmpty()) {
    return res.status(400).json({ status:400,errors: error.array() });
  }
};

// Register User
const registerUser = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  const { first_name, last_name, email, password, contact_number, address } =
    req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ status:400,message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name,
      last_name,
      email,
      password:hashedPassword,
      contact_number,
      address,
    });

    return res.status(201).json({ status:201,message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status:500,message: "Error registering user" });
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
      return res.status(400).json({ status:400,message: "No email exists" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ status:400,message: "Invalid password" });
    }

    const payload = {
      user_id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ status:200,message: "Login successful",token});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status:500,message: "Error logging in" });
  }
};

// Get All User

const getAllUsers = async (req, res) => {
  try {
    const users = await User.sequelize.query('SELECT * FROM users',{
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ status: 200, users });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};


// Get User By ID
const getUserById = async (req, res) => {
  const { userID } = req.params;
  try {
    const user = await User.findByPk(userID);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPdate User
const updateUser = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  const { userID } = req.params;
  const { first_name, last_name, email, contact_number, address } = req.body;

  try {
    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ status:404,message: "User not found" });
    }
 
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ status:400,message: "Email already exists" });
      }
    }

    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.email = email || user.email;
    user.contact_number = contact_number || user.contact_number;
    user.address = address || user.address;

    await user.save();

    return res.status(200).json({ status:200,message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating user" });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { userID } = req.params;
  try {
    const user = await User.findByPk(userID);
    if (!user) return res.status(404).json({ status:404,message: "User not found" });
    await user.destroy();
    res.status(200).json({ status:200,message: "User deleted" });
  } catch (err) {
    res.status(500).json({ status:500,message: err.message });
  }
};


module.exports = {loginUser,registerUser,getAllUsers,getUserById,updateUser,deleteUser};
