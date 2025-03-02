const express = require('express');
const {createComment,getCommentsForPost,deleteCommentPost} = require('../controllers/commentControllers');
const middleware = require('../middlewares/authMiddleware')
const {commentValidator} = require("../helpers/validation")

const router = express.Router();

router.post('/comment',middleware,commentValidator,createComment);
router.get('/comment/:postId',middleware,getCommentsForPost);
router.delete('/comment/:postId',middleware,deleteCommentPost);

module.exports = router;