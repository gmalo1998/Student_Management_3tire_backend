require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const logger = require('./utils/logger');

const {
  connectRedis,
} = require('./config/redis');

const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');

const {
  notFound,
  errorHandler,
} = require('./middleware/errorMiddleware');

const app = express();

// ========================================
// LOGGER CONFIGURATION
// ========================================

// Morgan captures HTTP/API access logs
// and sends them to Winston.

morgan.token('user-agent', (req) => {
  return req.get('user-agent') || 'unknown';
});

app.use(
  morgan(
    ':remote-addr :method :url :status :response-time ms user-agent=":user-agent"',
    {
      stream: {
        write: (message) => {
          logger.info(`HTTP ${message.trim()}`);
        },
      },
    }
  )
);

// ========================================
// MIDDLEWARE
// ========================================

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
  logger.debug('Health check requested');

  return res.status(200).json({
    success: true,
    message: 'Student Management API is running',
  });
});

// ========================================
// ROUTES
// ========================================

app.use('/api/auth', authRoutes);

app.use('/api/students', studentRoutes);

// ========================================
// ERROR HANDLING
// ========================================

app.use(notFound);

app.use(errorHandler);

// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    logger.info('========================================');
    logger.info('Application startup initiated');
    logger.info('========================================');

    // ------------------------------------
    // MongoDB
    // ------------------------------------

    logger.info('Connecting to MongoDB');

    await connectDB();

    logger.info('MongoDB connection established');

    // ------------------------------------
    // Redis
    // ------------------------------------

    logger.info('Connecting to Redis');

    await connectRedis();

    logger.info('Redis connection established');

    // ------------------------------------
    // Start HTTP Server
    // ------------------------------------

    app.listen(PORT, () => {
      logger.info(
        `Student Management API started successfully port=${PORT}`
      );

      logger.info(
        `Application environment=${process.env.NODE_ENV || 'development'}`
      );

      logger.info(
        `Health endpoint available at /api/health`
      );

      logger.info(
        'Application startup completed successfully'
      );
    });
  } catch (error) {
    logger.error(
      `Server startup failed message="${error.message}"`,
      error
    );

    process.exit(1);
  }
};

startServer();