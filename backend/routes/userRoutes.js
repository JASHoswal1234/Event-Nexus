/**
 * User Routes for EventNexus Backend
 * Defines routes for user management
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/auth');

/**
 * GET /api/users/participants
 * Get all participants
 * 
 * Response:
 * {
 *   success: boolean,
 *   count: number,
 *   participants: User[]
 * }
 * 
 * Access: Admin only
 */
router.get('/participants', protect, adminOnly, userController.getAllParticipants);

/**
 * GET /api/users
 * Get all users
 * 
 * Response:
 * {
 *   success: boolean,
 *   count: number,
 *   users: User[]
 * }
 * 
 * Access: Admin only
 */
router.get('/', protect, adminOnly, userController.getAllUsers);

module.exports = router;
