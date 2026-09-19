const logger = require('../utils/logger');

// ========================================
// ROUTE NOT FOUND
// ========================================

const notFound = (req, res) => {
  logger.warn(
    `Route not found method=${req.method} url=${req.originalUrl} ip=${req.ip}`
  );

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode === 200
      ? 500
      : res.statusCode;

  logger.error(
    `Unhandled application error method=${req.method} url=${req.originalUrl} statusCode=${statusCode} message="${err.message}"`,
    err
  );

  res.status(statusCode);

  res.json({
    success: false,
    message: err.message
  });
};

module.exports = {
  notFound,
  errorHandler
};