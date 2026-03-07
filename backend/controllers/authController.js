/**
 * Authentication Controller for EventNexus Backend
 * Handles user registration and login operations
 * 
 * Requirements:
 * - 1.1: User registration with email/password
 * - 1.2: Duplicate email error handling
 * - 1.4: JWT token generation on login
 * - 1.5: Invalid credentials error handling
 * - 2.4: Include user role in JWT payload
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { AuthenticationError, ConflictError } = require('../utils/errors');
const jwtConfig = require('../config/jwt');

/**
 * Register a new user
 * POST /api/auth/register
 * 
 * @param {Object} req.body - { email: string, password: string }
 * @returns {Object} - { success: boolean, message: string }
 * 
 * Requirements: 1.1, 1.2, 2.1
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('Email already in use');
  }

  // Create new user (password will be hashed by pre-save hook)
  const user = await User.create({
    email,
    password
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully'
  });
});

/**
 * Login user and return JWT token
 * POST /api/auth/login
 * 
 * @param {Object} req.body - { email: string, password: string }
 * @returns {Object} - { success: boolean, token: string, user: { id, email, role } }
 * 
 * Requirements: 1.4, 1.5, 2.4
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AuthenticationError('Please provide email and password');
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Validate password using bcrypt.compare
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Generate JWT token with user ID and role
  const token = jwt.sign(
    { 
      id: user._id,
      role: user.role 
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  // Return token and user info
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  });
});
