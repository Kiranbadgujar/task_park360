const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const {QueryTypes} = require('sequelize')

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

  const { first_name, last_name, email, password, role } =  req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ status:400,message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      first_name,
      last_name,
      email,
      password:hashedPassword,
      role,
    });

    return res.status(201).json({ status:201,message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ status:500,message: "Error registering user",err });
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
    return res.status(500).json({ status:500,message: "Error logging in",err });
  }
};

// Get All User
const getAllUsers = async (req, res) => {
  try {
    const users = await User.sequelize.query('SELECT * FROM users WHERE is_active = "1"',{
      type: QueryTypes.SELECT,
    });
    const countuser = users.length;
    res.status(200).json({ status: 200,countuser, users });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

// Get User By ID
const getUserById = async (req, res) => {
  const { userID } = req.params;
  try {
    const user = await User.findOne({where: {id: userID,is_active: 1}});

    if (!user) return res.status(404).json({ status:404,message: "User not found OR user is inactive" });

    res.status(200).json({status:200,user});
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
  const { first_name, last_name, email,role ,is_active} = req.body;

  try {
    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ status:404,message: "User not found" });
    }
 
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.is_active = is_active || user.is_active;

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
