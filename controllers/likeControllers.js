const { validationResult } = require("express-validator");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Like = require("../models/Like");
const Post = require("../models/Post");

// Express-validator
const validation = (req, res) => {
  const error = validationResult(req, res);
  if (!error.isEmpty()) {
    return res.status(400).json({ status: 400, errors: error.array() });
  }
};

// Get like for post only for author
const getLikeForPost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.user_id;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check if the logged-in user is the author of the post
    if (post.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not the author of this post." });
    }

    // Fetch the comments for the post
    const like = await Like.findAll({
      where: { postId },
      attributes: ["like"],
      include: [
        {
          model: User,
          as: "users",
          attributes: ["First_name", "Last_name","createdAt"],
        },
      ],
    });

    // const countLike = like.length;

    res.json({ status: 200, like });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// Create a new like
const createLike = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  const { like, postId } = req.body; 
  const userId = req.user.user_id;
  // console.log(like)

  // Check post
  const post = await Post.findByPk(postId);
  if (!post) {
    return res.status(404).json({ status: 404, message: "Post not found." });
  }

  // Check user role
  const user = await User.findByPk(userId);
  if (user.role !== "user") {
    return res.status(403).json({ status: 403, message: "Only users can like on posts." });
  }

  if (like === "1") {
    // console.log(like);
    const checkLike = await Like.findOne({ where: { userId, postId } });
    if (checkLike) {
      return res.status(403).json({ status: 403, message: "You have already liked this post." });
    }

    try {
      const content = await Like.create({ like, postId, userId });
      res.status(201).json({ status: 201, content });
    } catch (error) {
      console.error(error);
      res.status(500).send({  error: error.message });
    }

  }else{
    // console.log(like);
    const checkLike = await Like.findOne({ where: { userId, postId } });
    if (!checkLike) {
      return res.status(404).json({ status: 404, message: "You haven't liked this post yet." });
    }

    try {
      await checkLike.destroy();
      res.status(200).json({ status: 200, message: "Like removed successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).send({  error: error.message });
    }
  } 
};

module.exports = { createLike, getLikeForPost ,};
