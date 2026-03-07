/**
 * Authentication and Authorization Middleware
 * Implements Requirements 1.7, 2.2: JWT validation and role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const asyncHandler = require('../utils/asyncHandler');
const jwtConfig = require('../config/jwt');

/**
 * Protect middleware - Verify JWT token and attach user to request
 * Validates: Requirements 1.7, 2.2
 * 
 * Extracts token from Authorization header (Bearer token)
 * Verifies token signature and expiration
 * Loads user from database by decoded ID
 * Attaches user to req.user
 * Throws AuthenticationError if token invalid/expired or user not found
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new AuthenticationError('Not authorized, no token provided');
  }

  try {
    // Verify token with jwt.verify
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Load user from database by decoded ID
    const user = await User.findById(decoded.id).select('-password');

    // Throw error if user not found
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to req.user
    req.user = user;

    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }
    
    // Re-throw any error (including AuthenticationError)
    throw error;
  }
});

/**
 * AdminOnly middleware - Verify user has admin role
 * Validates: Requirements 2.2, 2.3
 * 
 * Checks if req.user.role === 'admin'
 * Throws AuthorizationError if user is not an admin
 * Must be used after protect middleware (requires req.user to be set)
 */
const adminOnly = (req, res, next) => {
  // Check if user exists (should be set by protect middleware)
  if (!req.user) {
    throw new AuthenticationError('User not authenticated');
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  next();
};

module.exports = {
  protect,
  adminOnly
};
