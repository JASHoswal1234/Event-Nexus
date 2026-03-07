/**
 * Unit tests for errorHandler middleware
 * Tests error handling for various error types
 */

const errorHandler = require('../../../middlewares/errorHandler');
const logger = require('../../../utils/logger');

// Mock logger
jest.mock('../../../utils/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request object
    req = {
      method: 'POST',
      path: '/api/test',
      body: {},
      params: {},
      query: {},
      user: { id: 'user123' }
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock next function
    next = jest.fn();
  });

  describe('Mongoose ValidationError', () => {
    it('should handle ValidationError with 400 status', () => {
      const err = {
        name: 'ValidationError',
        message: 'Validation failed',
        errors: {
          email: { path: 'email', message: 'Invalid email format' },
          password: { path: 'password', message: 'Password too short' }
        }
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation Error',
        details: [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short' }
        ]
      });
    });
  });

  describe('Mongoose Duplicate Key Error', () => {
    it('should handle duplicate key error with 409 status', () => {
      const err = {
        code: 11000,
        message: 'Duplicate key error',
        keyPattern: { email: 1 }
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Conflict',
        message: 'email already exists'
      });
    });
  });

  describe('JWT Errors', () => {
    it('should handle JsonWebTokenError with 401 status', () => {
      const err = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed'
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    });

    it('should handle TokenExpiredError with 401 status', () => {
      const err = {
        name: 'TokenExpiredError',
        message: 'jwt expired'
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed',
        message: 'Token expired'
      });
    });
  });

  describe('CastError', () => {
    it('should handle CastError with 400 status', () => {
      const err = {
        name: 'CastError',
        message: 'Cast to ObjectId failed',
        path: '_id',
        value: 'invalid-id'
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation Error',
        message: 'Invalid _id: invalid-id'
      });
    });
  });

  describe('Generic Errors', () => {
    it('should handle generic error with custom status code', () => {
      const err = {
        message: 'Custom error',
        statusCode: 403
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Custom error',
        message: 'Custom error'
      });
    });

    it('should default to 500 status for unhandled errors', () => {
      const err = {
        message: 'Unexpected error'
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });

    it('should sanitize error message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const err = {
        message: 'Internal database connection failed'
      };

      errorHandler(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal database connection failed',
        message: 'An unexpected error occurred'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Logging', () => {
    it('should log error with full context', () => {
      const err = {
        message: 'Test error',
        stack: 'Error stack trace'
      };

      errorHandler(err, req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Test error', {
        stack: 'Error stack trace',
        method: 'POST',
        path: '/api/test',
        user: 'user123',
        timestamp: expect.any(String),
        body: {},
        params: {},
        query: {}
      });
    });

    it('should handle unauthenticated requests', () => {
      req.user = undefined;
      const err = {
        message: 'Test error',
        stack: 'Error stack trace'
      };

      errorHandler(err, req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Test error', 
        expect.objectContaining({
          user: 'unauthenticated'
        })
      );
    });
  });
});
