const express = require('express');
const {createComment,getCommentsForPost,deleteCommentPost,getComments} = require('../controllers/commentControllers');
const middleware = require('../middlewares/authMiddleware')
const {commentValidator} = require("../helpers/validation")

const router = express.Router();

router.post('/comment',middleware,commentValidator,createComment);
router.get('/comment/:postId',middleware,getCommentsForPost);
router.get('/allComment/:postId',getComments);
router.delete('/comment/:postId',middleware,deleteCommentPost);

module.exports = router;