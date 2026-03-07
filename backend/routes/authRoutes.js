/**
 * Authentication Routes for EventNexus Backend
 * Defines routes for user registration and login
 * 
 * Requirements:
 * - 1.1: User registration endpoint
 * - 1.4: User login endpoint
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, registerSchema, loginSchema } = require('../middlewares/validate');

/**
 * POST /api/auth/register
 * Register a new user with email and password
 * 
 * Request body:
 * {
 *   email: string (required, valid email format),
 *   password: string (required, min 6 characters)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 * 
 * Requirements: 1.1
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * Login with email and password, returns JWT token
 * 
 * Request body:
 * {
 *   email: string (required, valid email format),
 *   password: string (required)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   token: string,
 *   user: {
 *     id: string,
 *     email: string,
 *     role: string
 *   }
 * }
 * 
 * Requirements: 1.4
 */
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
