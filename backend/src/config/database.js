const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  database: process.env.DB_NAME || 'medemergency',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3307,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
};

if (process.env.DB_SOCKET) {
  dbConfig.dialectOptions = {
    socketPath: process.env.DB_SOCKET,
  };
}

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

module.exports = { sequelize, Sequelize };
