/**
 * Centralized Error Handler Middleware
 * Handles all errors in the application with appropriate logging and responses
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5
 */

const logger = require('../utils/logger');

/**
 * Error handler middleware
 * Logs errors with full context and returns sanitized responses
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error with full context including stack trace, method, path, user, timestamp
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    path: req.path,
    user: req.user?.id || req.user?._id || 'unauthenticated',
    timestamp: new Date().toISOString(),
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Determine status code (default to 500 for server errors)
  let statusCode = err.statusCode || 500;

  // Handle Mongoose ValidationError (400 Bad Request)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(statusCode).json({
      success: false,
      error: 'Validation Error',
      details
    });
  }

  // Handle Mongoose duplicate key error (409 Conflict)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    return res.status(statusCode).json({
      success: false,
      error: 'Conflict',
      message: `${field} already exists`
    });
  }

  // Handle JWT errors (401 Unauthorized)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    return res.status(statusCode).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    return res.status(statusCode).json({
      success: false,
      error: 'Authentication failed',
      message: 'Token expired'
    });
  }

  // Handle CastError (invalid ObjectId format) as 400 Bad Request
  if (err.name === 'CastError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      error: 'Validation Error',
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // Generic error response
  // In production, hide internal error details for security
  // In development, show full error message for debugging
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    message: message
  });
};

module.exports = errorHandler;
