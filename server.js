const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/db.js');

dotenv.config();

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended:  false }));

app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(3000, async () => {
  try {
    await sequelize.sync();
    console.log(`Server running on ${PORT}`);
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
});