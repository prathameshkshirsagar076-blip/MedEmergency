const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PrescriptionMedicine = sequelize.define('prescription_medicines', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  prescription_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  medicine_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  custom_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  confidence: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0,
  },
  confidence_level: {
    type: DataTypes.STRING(20),
    defaultValue: 'high',
  },
  dosage_instruction: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_selected: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = PrescriptionMedicine;
