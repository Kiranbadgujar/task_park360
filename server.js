const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const sequelize = require('./config/db.js');
const Comment = require('./models/Comment.js'); 
const Like = require('./models/Like.js'); 

dotenv.config();

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended:  false }));

app.use('/', authRoutes);
app.use('/', postRoutes);
app.use('/', commentRoutes);
app.use('/', likeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await sequelize.sync();
    Comment.sync(); 
    Like.sync(); 
    console.log(`Server running on ${PORT}`);
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
});