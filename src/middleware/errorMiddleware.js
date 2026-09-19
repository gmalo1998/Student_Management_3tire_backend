const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {

  console.error(err.stack);

  res.status(
    res.statusCode === 200
      ? 500
      : res.statusCode
  );

  res.json({
    success: false,
    message: err.message
  });
};

module.exports = {
  notFound,
  errorHandler
};