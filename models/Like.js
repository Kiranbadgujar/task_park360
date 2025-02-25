const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Like = sequelize.define("Like", {
  like: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

const User = require("./User");
User.hasMany(Like, { foreignKey: "userId", as: "likes" });
Like.belongsTo(User, { foreignKey: "userId", as: "users" });

const Post = require("./Post");
Post.hasMany(Like, { foreignKey: "postId", as: "likes" });
Like.belongsTo(Post, { foreignKey: "postId", as: "posts" });

module.exports = Like;
