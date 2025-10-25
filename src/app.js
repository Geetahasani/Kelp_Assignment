const express = require('express');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const cors = require('cors');
const csvRoutes = require('./routes/csvRoutes');
const sequelize = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(fileUpload());
app.use(cors());

// Routes
app.use('/api/csv', csvRoutes);

// Database connection function
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync();
    console.log('Models synchronized');
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
};

module.exports = { app, connectDatabase };