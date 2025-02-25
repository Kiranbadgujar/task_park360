const express = require('express');
const {createComment,getCommentsForPost} = require('../controllers/commentControllers');
const middleware = require('../middlewares/authMiddleware')
const {commentValidator} = require("../helpers/validation")

const router = express.Router();

router.post('/comment',middleware,commentValidator,createComment);
router.get('/:postId',middleware,getCommentsForPost);

module.exports = router;