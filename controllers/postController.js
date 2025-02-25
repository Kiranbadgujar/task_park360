const { validationResult } = require("express-validator");
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Sequelize = require('sequelize');


// Express-validator
const validation = (req, res) => {
  const error = validationResult(req, res);
  if (!error.isEmpty()) {
    return res.status(400).json({ status:400,errors: error.array() });
  }
};

// create post
const createPost = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  try {

    const imagePath = req.file.path; 
    // console.log(req.file);
    const { title, content } = req.body; 
    const userId = req.user.user_id;

    // Retrieve user information from the database
    const user = await User.findByPk(userId); 

    // Check author role
    if (!user || user.role !== 'author') {
      return res.status(403).json({
        status: 403,
        message: "Only authors can create posts.",
      });
    }

    // Create the post with the provided data
    const post = await Post.create({
      userId, 
      title, 
      content, 
      image:imagePath,
    });

    // Return the created post as a response
    res.status(201).json(post);

  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "An error occurred while creating the post.",
    });
  }
};

// Get all Posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({ 
      where: { is_active: true },
      attributes: [
        'id',
        'title', 
        'content',
        [Sequelize.fn('CONCAT','http:/',Sequelize.col('image')),'image'],
        [Sequelize.fn('COUNT', Sequelize.col('likes.id')), 'likeCount'],
        [Sequelize.fn('COUNT', Sequelize.col('comments.id')), 'commentCount']
      ],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['first_name', 'last_name', 'email'],
        },
        {
          model: Comment,
          as: 'comments',
          attributes: [],
        },
        {
          model: Like,
          as: 'likes',
          attributes: []
        }
      ],
      group: ['Post.id'], 
    });
    
    res.status(200).json({ status: 200, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Posts by author
const getPostsByAuthor = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const posts = await Post.findAll({
      where: {
        userId: userId,
        is_active: true,
      },
      attributes: [
        'id',
        'title', 
        'content', 
        'image', 
        [Sequelize.fn('COUNT', Sequelize.col('likes.id')), 'likeCount'],
        [Sequelize.fn('COUNT', Sequelize.col('comments.id')), 'commentCount']
      ],
      include: [
        // {
        //   model: User,
        //   as: 'users',
        //   attributes: ['first_name', 'last_name', 'email'],
        // },
        {
          model: Comment,
          as: 'comments',
          attributes: ['comment'],
        },
          {
            model: Like,
            as: 'likes',
            attributes: [],
          }
    ],
    });

    if (!posts.length) {
      return res.status(404).json({ message: "No posts found or posts is inactive." });
    }

    res.status(200).json(posts); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update post
const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const postId = req.params.postId; 
    const userId = req.user.user_id; 

    if (!userId) {
      return res.status(403).json({ message: "You must be logged in to see comment on post." });
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ status:404,message: "Post not found." });
    }

    if (post.userId !== req.user.user_id) {
      return res.status(403).json({ status:403,message: "You are not authorized to update this post." });
    }

    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete post
const deletePost = async (req, res) => {
  try {
    const { activate } = req.body;
    // console.log(activate)
    const postId = req.params.postId; 

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ status: 404, message: "Post not found." });
    }

    if (post.userId !== req.user.user_id) {
      return res.status(403).json({ status: 403, message: "You are not authorized to update this post." });
    }

    post.is_active = activate;
    await post.save();
    return res.status(200).json({ status: 200, message: "Post updated successfully" });
    

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}


module.exports = {createPost , getPosts ,getPostsByAuthor, updatePost, deletePost}
