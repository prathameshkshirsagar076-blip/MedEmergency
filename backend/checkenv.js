require('dotenv').config();
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('PASS SET:', !!process.env.EMAIL_APP_PASSWORD);
console.log('PASS LENGTH:', process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.length : 0);
