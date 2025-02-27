const { validationResult } = require("express-validator");
const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');

// Express-validator
const validation = (req, res) => {
  const error = validationResult(req, res);
  if (!error.isEmpty()) {
    return res.status(400).json({ status:400,errors: error.array() });
  }
};

// Get comment for post only for author
const getCommentsForPost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.user_id; 
  console.log(postId);

  try {
    // Get the post
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check if the logged-in user is the author of the post
    if (post.userId !== userId) { 
      return res.status(403).json({ message: "You are not the author of this post." });
    }

    // Check role
    // const user = await User.findByPk(userId);

    // if (user.role !== 'author') {
    //   return res.status(403).json({ message: "Only authors can see comments." });
    // }

    // Fetch the comments for the post
    const comments = await Comment.findAll({
      where: { postId },
      attributes:['comment'],
      include: [{
        model: Post,
        as: 'posts',
        attributes: ['title', 'content'],
      }],
    });

    const countComment = comments.length;

    res.json({status:200,countComment,comments}); 

  } catch (error) {
    console.error(error);  
    res.status(500).send(error.message);
  }
};

// Create a new comment
const createComment = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }
  
  const { comment, postId } = req.body;
  const userId = req.user.user_id;

  // Get user details
  const user = await User.findByPk(userId); 
  if (!user) {
    return res.status(404).json({ status: 404, message: "User not found" });
  }

  // Check user role
  if (user.role !== 'user') {
    return res.status(403).json({ status: 403, message: "Only users can comment on posts." });
  }

//  check comment 
  const checkcomment = await Comment.findOne({ where: { userId, postId } }); 
  if (checkcomment) {
    return res.status(403).json({ status: 403, message: "You have already commented on this post." });
  }

  try {
    const content = await Comment.create({ comment, postId, userId });
    res.status(201).json({ status: 201, content });
  } catch (error) {
    console.error(error); 
    res.status(500).send({ message: "Internal Server Error",error });
  }
};

module.exports = {createComment,getCommentsForPost}
