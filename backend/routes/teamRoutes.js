/**
 * Team Routes for EventNexus Backend
 * Defines routes for team creation, joining, retrieval, and deletion
 * 
 * Requirements:
 * - 7.2: Team creation endpoint
 * - 8.1: Team joining endpoint
 * - 8.6: Get event teams endpoint
 * - 7.4: Team deletion endpoint
 */

const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validate, teamSchema } = require('../middlewares/validate');

/**
 * POST /api/teams
 * Create a new team for an event
 * 
 * Request body:
 * {
 *   name: string (required),
 *   eventId: string (required),
 *   capacity: number (required, min: 1)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   team: Team (includes auto-generated joinCode)
 * }
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.5, 7.6
 * Access: Protected (authenticated users - both participants and admins can create teams)
 */
router.post('/', protect, validate(teamSchema), teamController.createTeam);

/**
 * POST /api/teams/join
 * Join a team using a join code
 * 
 * Request body:
 * {
 *   joinCode: string (required)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   team: Team
 * }
 * 
 * Validations:
 * - Team exists with the provided join code
 * - User is registered for the event
 * - Team has available capacity
 * - User is not already in another team for the same event
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 * Access: Protected (authenticated users)
 */
router.post('/join', protect, teamController.joinTeam);

/**
 * GET /api/teams/event/:eventId
 * Get all teams for an event
 * 
 * Parameters:
 * - eventId: string (event ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   count: number,
 *   teams: Team[] (includes memberCount and member list)
 * }
 * 
 * Requirements: 8.6
 * Access: Protected (authenticated users)
 */
router.get('/event/:eventId', protect, teamController.getEventTeams);

/**
 * DELETE /api/teams/:id
 * Delete a team and all member associations
 * 
 * Parameters:
 * - id: string (team ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 * 
 * Requirements: 7.4
 * Access: Admin only
 */
router.delete('/:id', protect, adminOnly, teamController.deleteTeam);

module.exports = router;
