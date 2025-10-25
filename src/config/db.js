// Load environment variables
require('dotenv').config();

// Import Sequelize
const { Sequelize } = require('sequelize');

// Create the Sequelize instance using environment variables
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: process.env.DB_PORT,
  logging: false,  // Disable SQL logging
});

// Test the database connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully!'))
  .catch(err => console.error('Error connecting to the database:', err));

// Export the Sequelize instance for use in models
module.exports = sequelize;
