const { createClient } = require('redis');
const logger = require('../utils/logger');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('connect', () => {
  logger.info('Redis connection established');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis reconnecting');
});

redisClient.on('error', (error) => {
  logger.error(
    `Redis connection error message="${error.message}"`,
    error
  );
});

redisClient.on('end', () => {
  logger.warn('Redis connection closed');
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    logger.error(
      `Redis startup connection failed message="${error.message}"`,
      error
    );

    throw error;
  }
};

module.exports = {
  redisClient,
  connectRedis
};