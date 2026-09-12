const { sequelize, Sequelize } = require('../config/database');
const User = require('./User');
const Store = require('./Store');
const Medicine = require('./Medicine');
const Prescription = require('./Prescription');
const PrescriptionMedicine = require('./PrescriptionMedicine');
const Request = require('./Request');
const RequestResponse = require('./RequestResponse');
const Notification = require('./Notification');
const PasswordReset = require('./PasswordReset');
const PendingSignup = require('./PendingSignup');

// Define Relationships

// User <-> Store (1:1)
User.hasOne(Store, { foreignKey: 'user_id', as: 'store', onDelete: 'CASCADE' });
Store.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// User (Patient) <-> Prescription (1:N)
User.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions', onDelete: 'CASCADE' });
Prescription.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });

// Prescription <-> PrescriptionMedicine (1:N)
Prescription.hasMany(PrescriptionMedicine, { foreignKey: 'prescription_id', as: 'medicines', onDelete: 'CASCADE' });
PrescriptionMedicine.belongsTo(Prescription, { foreignKey: 'prescription_id', as: 'prescription' });

// Medicine <-> PrescriptionMedicine (1:N)
Medicine.hasMany(PrescriptionMedicine, { foreignKey: 'medicine_id', as: 'prescription_entries' });
PrescriptionMedicine.belongsTo(Medicine, { foreignKey: 'medicine_id', as: 'master_medicine' });

// User (Patient) <-> Request (1:N)
User.hasMany(Request, { foreignKey: 'patient_id', as: 'patient_requests' });
Request.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });

// Prescription <-> Request (1:N)
Prescription.hasMany(Request, { foreignKey: 'prescription_id', as: 'requests' });
Request.belongsTo(Prescription, { foreignKey: 'prescription_id', as: 'prescription' });

// Store (Matched Store) <-> Request
Store.hasMany(Request, { foreignKey: 'matched_store_id', as: 'matched_requests' });
Request.belongsTo(Store, { foreignKey: 'matched_store_id', as: 'matched_store' });

// Request <-> RequestResponse (1:N)
Request.hasMany(RequestResponse, { foreignKey: 'request_id', as: 'responses', onDelete: 'CASCADE' });
RequestResponse.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });

// Store <-> RequestResponse (1:N)
Store.hasMany(RequestResponse, { foreignKey: 'store_id', as: 'store_responses', onDelete: 'CASCADE' });
RequestResponse.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Store <-> Notification (1:N)
Store.hasMany(Notification, { foreignKey: 'store_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Request <-> Notification (1:N)
Request.hasMany(Notification, { foreignKey: 'request_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });

// User <-> PasswordReset (1:N)
User.hasMany(PasswordReset, { foreignKey: 'user_id', as: 'password_resets', onDelete: 'CASCADE' });
PasswordReset.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Store,
  Medicine,
  Prescription,
  PrescriptionMedicine,
  Request,
  RequestResponse,
  Notification,
  PasswordReset,
  PendingSignup,
};
