const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error del servidor';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
