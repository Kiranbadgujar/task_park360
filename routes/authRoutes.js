const express = require("express");
const { registerUser, loginUser,getAllUsers ,getUserById , updateUser , deleteUser} = require("../controllers/authController");
const { loginValidator,  registrationValidator} = require("../helpers/validation");
const middleware = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/register", registrationValidator, registerUser);
router.post("/login", loginValidator, loginUser);
router.get("/user/",  getAllUsers);
router.get('/user/:userID', getUserById);
router.put('/update/:userID', middleware,registrationValidator,updateUser);
router.delete('/delete/:userID',middleware,deleteUser);

module.exports = router;
