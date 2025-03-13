const express = require("express");
const { registerUser, loginUser,getAllUsers ,getUserById , updateUser , deleteUser,downloadPdf,downloadXls,VerifyUser ,forgetPassword ,resetPassword ,updatePassword} = require("../controllers/authController");
const { loginValidator,  registrationValidator} = require("../helpers/validation");
const middleware = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/register", registrationValidator, registerUser);
router.post("/login", loginValidator, loginUser);
router.get("/user/",  getAllUsers);
router.get('/userId/',middleware,getUserById);
router.put('/update/:userID',updateUser);
router.put('/updatepassword/:userID',updatePassword);
router.delete('/delete/:userID',middleware,deleteUser);
router.post('/verify',VerifyUser);
router.post('/forgetpassword',forgetPassword);
router.post('/resetpassword',resetPassword);
router.get('/download-pdf',downloadPdf);
router.get('/download-xls',downloadXls);

module.exports = router;
