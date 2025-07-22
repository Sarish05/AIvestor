// backend/config/database.js - Database Configuration (if needed in future)
require('dotenv').config();

const databaseConfig = {
  // MongoDB configuration (if you decide to add a database later)
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aivestor',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // Redis configuration (for caching)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
  }
};

module.exports = databaseConfig;
