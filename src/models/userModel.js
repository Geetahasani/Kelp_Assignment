const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Database connection

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  additional_info: {
    type: DataTypes.JSONB,
    allowNull: true,
  }
}, {
  tableName: 'users',
  timestamps: false, // Disable createdAt and updatedAt
});

module.exports = User;