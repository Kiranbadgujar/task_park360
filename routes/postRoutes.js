// routes/postRoutes.js
const express = require('express');
const {createPost,getPosts,getPostsByAuthor,updatePost,deletePost,getPostsById,getPostsByPagination} = require('../controllers/postController');
const middleware = require('../middlewares/authMiddleware')
const { postValidator } = require("../helpers/validation");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post('/create-post',middleware,upload.single("file"),postValidator ,createPost); 
router.get('/get-post', getPosts); 
router.get('/get-posts', getPostsByPagination); 
router.get('/get-post/:postId', getPostsById); 
router.get('/get-post-author',middleware, getPostsByAuthor); 
router.put('/update-post/:postId',middleware,upload.single("file"), updatePost); 
router.delete('/delete-post/:postId',middleware, deletePost); 

module.exports = router;