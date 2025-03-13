const express = require('express');
const {createLike ,getLikeForPost ,getLike} = require('../controllers/likeControllers');
const middleware = require('../middlewares/authMiddleware')
const { likeValidator } = require("../helpers/validation")

const router = express.Router();

router.post('/like',middleware,likeValidator,createLike);
router.get('/like/:postId',middleware,getLikeForPost);
router.get('/likes/:postId',getLike);

module.exports = router;