const logger = require('../config/logger');

const normaliseError = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return { statusCode: 409, message: `${field} already exists.` };
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return { statusCode: 400, message: messages.join('. ') };
  }

  if (err.name === 'CastError') {
    return { statusCode: 400, message: `Invalid ${err.path}: ${err.value}` };
  }

  if (err.name === 'JsonWebTokenError') {
    return { statusCode: 401, message: 'Invalid token.' };
  }
  if (err.name === 'TokenExpiredError') {
    return { statusCode: 401, message: 'Token has expired.' };
  }

  return {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  };
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = normaliseError(err);

  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      statusCode,
      message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn('Client error', { statusCode, message, path: req.path });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
