const logger = require('../utils/logger');

// ========================================
// ROUTE NOT FOUND
// ========================================

const notFound = (req, res) => {
  logger.warn(
    `Route not found method=${req.method} url=${req.originalUrl} ip=${req.ip}`
  );

  return res.status(404).json({
    success: false,
    message: 'Requested resource was not found'
  });
};

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : 500;

  // ========================================
  // LOG COMPLETE ERROR
  // ========================================

  logger.error(
    `Unhandled application error method=${req.method} url=${req.originalUrl} statusCode=${statusCode} ip=${req.ip} message="${err.message}"`,
    err
  );

  // ========================================
  // INVALID MONGODB OBJECT ID
  // ========================================

  if (err.name === 'CastError') {
    logger.warn(
      `Invalid resource identifier method=${req.method} url=${req.originalUrl} value=${err.value}`
    );

    return res.status(400).json({
      success: false,
      message: 'Invalid resource identifier'
    });
  }

  // ========================================
  // MONGODB DUPLICATE KEY
  // ========================================

  if (err.code === 11000) {
    const duplicateField =
      Object.keys(err.keyPattern || {})[0] || 'field';

    logger.warn(
      `Duplicate database value field=${duplicateField} method=${req.method} url=${req.originalUrl}`
    );

    return res.status(409).json({
      success: false,
      message: `A record with the provided ${duplicateField} already exists`
    });
  }

  // ========================================
  // MONGOOSE VALIDATION ERROR
  // ========================================

  if (err.name === 'ValidationError') {
    const validationFields = Object.keys(
      err.errors || {}
    );

    logger.warn(
      `Database validation failed fields=${validationFields.join(',')}`
    );

    return res.status(400).json({
      success: false,
      message: 'Invalid data provided'
    });
  }

  // ========================================
  // JSON PARSING ERROR
  // ========================================

  if (err instanceof SyntaxError && err.status === 400) {
    logger.warn(
      `Invalid JSON request method=${req.method} url=${req.originalUrl}`
    );

    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request'
    });
  }

  // ========================================
  // DEFAULT APPLICATION ERROR
  // ========================================

  const isProduction =
    process.env.NODE_ENV === 'production';

  return res.status(statusCode).json({
    success: false,
    message: isProduction
      ? 'Internal server error'
      : err.message || 'Internal server error'
  });
};

module.exports = {
  notFound,
  errorHandler
};