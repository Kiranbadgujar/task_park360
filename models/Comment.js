const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Comment = sequelize.define('Comment', {
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

// User 
const User = require('./User');
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' }); 
Comment.belongsTo(User, { foreignKey: 'userId', as: 'users' });

// Post 
const Post = require('./Post');
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });  
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'posts' });

module.exports = Comment;
