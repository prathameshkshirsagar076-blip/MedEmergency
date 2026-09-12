const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Request = sequelize.define('requests', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  prescription_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'matched', 'resolved', 'expired', 'cancelled'),
    defaultValue: 'pending',
  },
  is_emergency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  search_radius_km: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0,
  },
  patient_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  patient_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  matched_store_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['status'] },
    { fields: ['patient_id'] },
    { fields: ['matched_store_id'] },
    { fields: ['is_emergency'] },
  ]
});

module.exports = Request;
