const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedEmergency API',
      version: '1.0.0',
      description: 'Emergency prescription, AI OCR extraction & medicine-finder real-time dispatch API documentation.',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local development server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /api/auth/login or /api/auth/google',
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication, Google OAuth, session refresh, and user profile' },
      { name: 'Prescriptions', description: 'Prescription upload, Gemini AI vision extraction & medicine confirmation' },
      { name: 'Stores', description: 'Pharmacy discovery, nearby search, registration, and profile' },
      { name: 'Requests', description: 'Emergency medicine broadcasts, radar tracking, and store responses' },
      { name: 'Medicines', description: 'Master catalog search and medicine lookup' },
      { name: 'Notifications', description: 'Real-time alert notifications for pharmacies' },
      { name: 'Admin', description: 'Administrator dashboard, store license verification, and stats' },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

module.exports = swaggerJsdoc(options);
