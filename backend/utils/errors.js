/**
 * Custom Error Classes for EventNexus Backend
 * Provides structured error handling with appropriate HTTP status codes
 */

/**
 * Base application error class
 * All custom errors extend from this class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400 Bad Request)
 * Used for input validation failures, missing required fields, invalid formats
 */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

/**
 * Authentication Error (401 Unauthorized)
 * Used for invalid credentials, missing/invalid tokens
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

/**
 * Authorization Error (403 Forbidden)
 * Used for insufficient permissions, role-based access control failures
 */
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

/**
 * Not Found Error (404 Not Found)
 * Used when a requested resource doesn't exist
 */
class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with ID ${id} not found`, 404);
  }
}

/**
 * Conflict Error (409 Conflict)
 * Used for duplicate entries, capacity exceeded, deadline violations
 */
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};
