const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RequestResponse = sequelize.define('request_responses', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  response: {
    type: DataTypes.ENUM('available', 'not_available'),
    allowNull: false,
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  responded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  indexes: [
    { fields: ['request_id', 'store_id'], unique: true },
    { fields: ['response'] },
  ]
});

module.exports = RequestResponse;
