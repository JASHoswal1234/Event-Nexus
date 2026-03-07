/**
 * Unit tests for authentication middleware
 * Tests protect middleware functionality
 */

const jwt = require('jsonwebtoken');
const { protect } = require('../../../middlewares/auth');
const User = require('../../../models/User');
const { AuthenticationError } = require('../../../utils/errors');
const jwtConfig = require('../../../config/jwt');

// Mock dependencies
jest.mock('../../../models/User');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should call next with AuthenticationError when no token is provided', async () => {
      await protect(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
      expect(next.mock.calls[0][0].message).toBe('Not authorized, no token provided');
    });

    it('should call next with AuthenticationError when token is invalid', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await protect(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
      expect(next.mock.calls[0][0].message).toBe('Invalid token');
    });

    it('should call next with AuthenticationError when token is expired', async () => {
      req.headers.authorization = 'Bearer expiredtoken';
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await protect(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
      expect(next.mock.calls[0][0].message).toBe('Token expired');
    });

    it('should call next with AuthenticationError when user is not found', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'nonexistentid' });
      
      // Mock User.findById to return an object with select method that resolves to null
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      // Wait for the async operation to complete
      await new Promise(resolve => {
        const originalNext = next;
        next = jest.fn((err) => {
          originalNext(err);
          resolve();
        });
        protect(req, res, next);
      });
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
      expect(next.mock.calls[0][0].message).toBe('User not found');
    });

    it('should attach user to req.user and call next() when token is valid', async () => {
      const mockUser = {
        _id: 'userid123',
        email: 'test@example.com',
        role: 'participant'
      };

      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'userid123' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('validtoken', jwtConfig.secret);
      expect(User.findById).toHaveBeenCalledWith('userid123');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should extract token from Bearer authorization header', async () => {
      const mockUser = {
        _id: 'userid123',
        email: 'test@example.com',
        role: 'admin'
      };

      req.headers.authorization = 'Bearer mytoken123';
      jwt.verify.mockReturnValue({ id: 'userid123' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('mytoken123', jwtConfig.secret);
      expect(req.user).toEqual(mockUser);
    });
  });
});
