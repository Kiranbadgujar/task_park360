const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const sequelize = require('./config/db.js');
const path = require('path')

dotenv.config();

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended:  false }));

// static render html file
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// API logger
// app.use((req, res, next) => {
//   console.log(`[${req.method} ${req.originalUrl}]`);
//   next();   
// });

app.use('/', authRoutes);
app.use('/', postRoutes);
app.use('/', commentRoutes);
app.use('/', likeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await sequelize.sync();
    console.log(`Server running on ${PORT}`);
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
});
