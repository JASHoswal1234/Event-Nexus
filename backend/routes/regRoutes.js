/**
 * Registration Routes for EventNexus Backend
 * Defines routes for event registration, cancellation, check-in, and retrieval
 * 
 * Requirements:
 * - 5.1: Event registration endpoint
 * - 5.6: Registration cancellation endpoint
 * - 6.1: Participant check-in endpoint
 * - 6.4: Get event registrations endpoint
 */

const express = require('express');
const router = express.Router();
const regController = require('../controllers/regController');
const { protect, adminOnly } = require('../middlewares/auth');

/**
 * POST /api/registrations/:eventId
 * Register for an event
 * 
 * Parameters:
 * - eventId: string (event ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   registration: Registration
 * }
 * 
 * Validations:
 * - Event exists
 * - No duplicate registration
 * - Event has available capacity
 * - Registration deadline has not passed
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * Access: Protected (authenticated users)
 */
router.post('/:eventId', protect, regController.registerForEvent);

/**
 * DELETE /api/registrations/:eventId
 * Cancel registration for an event
 * 
 * Parameters:
 * - eventId: string (event ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 * 
 * Requirements: 5.6
 * Access: Protected (authenticated users)
 */
router.delete('/:eventId', protect, regController.cancelRegistration);

/**
 * POST /api/registrations/:eventId/checkin
 * Check in a participant for an event
 * 
 * Parameters:
 * - eventId: string (event ID)
 * 
 * Request body:
 * {
 *   userId: string (required, user ID to check in)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   registration: Registration
 * }
 * 
 * Requirements: 6.1, 6.2, 6.3
 * Access: Admin only
 */
router.post('/:eventId/checkin', protect, adminOnly, regController.checkInParticipant);

/**
 * GET /api/registrations/event/:eventId
 * Get all registrations for an event
 * 
 * Parameters:
 * - eventId: string (event ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   count: number,
 *   registrations: Registration[]
 * }
 * 
 * Requirements: 6.4
 * Access: Admin only
 */
router.get('/event/:eventId', protect, adminOnly, regController.getEventRegistrations);

module.exports = router;
