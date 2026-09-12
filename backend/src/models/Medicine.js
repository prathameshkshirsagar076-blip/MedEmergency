const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medicine = sequelize.define('medicines', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  generic_name: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'General',
  },
  dosage_form: {
    type: DataTypes.STRING(100),
    defaultValue: 'Tablet',
  },
  alternatives: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comma separated or JSON list of alternative medicine names',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['name'] },
    { fields: ['generic_name'] },
  ]
});

module.exports = Medicine;
