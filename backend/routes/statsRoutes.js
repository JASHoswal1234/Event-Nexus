/**
 * Statistics Routes for EventNexus Backend
 * Defines routes for system-wide and event-specific statistics
 * 
 * Requirements:
 * - 10.1: System statistics endpoint
 * - 10.5: Event statistics endpoint
 */

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { protect, adminOnly } = require('../middlewares/auth');

/**
 * GET /api/stats
 * Get system-wide statistics
 * 
 * Response:
 * {
 *   success: boolean,
 *   stats: {
 *     totalUsers: number,
 *     totalEvents: number,
 *     totalRegistrations: number,
 *     totalTeams: number
 *   }
 * }
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4
 * Access: Admin only
 */
router.get('/', protect, adminOnly, statsController.getSystemStats);

/**
 * GET /api/stats/event/:eventId
 * Get event-specific statistics
 * 
 * Parameters:
 * - eventId: string (event ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   stats: {
 *     registrationCount: number,
 *     teamCount: number,
 *     checkInCount: number
 *   }
 * }
 * 
 * Requirements: 10.5, 10.6, 10.7
 * Access: Admin only
 */
router.get('/event/:eventId', protect, adminOnly, statsController.getEventStats);

module.exports = router;
