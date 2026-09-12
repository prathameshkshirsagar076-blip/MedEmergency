const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prescription = sequelize.define('prescriptions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image_path: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  ocr_raw_text: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  is_emergency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('uploaded', 'scanned', 'processed'),
    defaultValue: 'uploaded',
  },
});

module.exports = Prescription;
