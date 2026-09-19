const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    logger.info('MongoDB connection initialization started');

    const connection = await mongoose.connect(
      process.env.MONGO_URI
    );

    logger.info(
      `MongoDB connected successfully host=${connection.connection.host} database=${connection.connection.name}`
    );

  } catch (error) {
    logger.error(
      `MongoDB connection failed message="${error.message}"`,
      error
    );

    throw error;
  }
};

module.exports = connectDB;