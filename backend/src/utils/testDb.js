const { sequelize } = require('../models');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully with Sequelize pool.');
    await sequelize.sync({ alter: true });
    console.log('✅ All database tables synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error);
    process.exit(1);
  }
}

testConnection();
