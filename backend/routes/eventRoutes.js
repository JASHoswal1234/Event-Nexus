/**
 * Event Routes for EventNexus Backend
 * Defines routes for event CRUD operations
 * 
 * Requirements:
 * - 3.1: Event creation endpoint
 * - 3.3: Event update endpoint
 * - 3.4: Event deletion endpoint
 * - 4.1: Get all events endpoint
 * - 4.2: Get event by ID endpoint
 */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validate, eventSchema } = require('../middlewares/validate');

/**
 * POST /api/events
 * Create a new event
 * 
 * Request body:
 * {
 *   title: string (required),
 *   description: string (required),
 *   date: Date (required),
 *   location: string (required),
 *   capacity: number (required, min: 1),
 *   registrationDeadline: Date (required),
 *   mode: string (required, enum: ['online', 'offline'])
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   event: Event
 * }
 * 
 * Requirements: 3.1
 * Access: Admin only
 */
router.post('/', protect, adminOnly, validate(eventSchema), eventController.createEvent);

/**
 * GET /api/events
 * Get all events with optional filters
 * 
 * Query parameters:
 * - mode: string (optional, filter by 'online' or 'offline')
 * - startDate: Date (optional, filter events after this date)
 * - endDate: Date (optional, filter events before this date)
 * 
 * Response:
 * {
 *   success: boolean,
 *   count: number,
 *   events: Event[]
 * }
 * 
 * Requirements: 4.1, 4.3, 4.4
 * Access: Protected (authenticated users)
 */
router.get('/', protect, eventController.getEvents);

/**
 * GET /api/events/:id
 * Get event by ID
 * 
 * Parameters:
 * - id: string (event ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   event: Event
 * }
 * 
 * Requirements: 4.2
 * Access: Protected (authenticated users)
 */
router.get('/:id', protect, eventController.getEventById);

/**
 * PUT /api/events/:id
 * Update an existing event
 * 
 * Parameters:
 * - id: string (event ID)
 * 
 * Request body (all fields optional):
 * {
 *   title: string,
 *   description: string,
 *   date: Date,
 *   location: string,
 *   capacity: number,
 *   registrationDeadline: Date,
 *   mode: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   event: Event
 * }
 * 
 * Requirements: 3.3
 * Access: Admin only
 */
router.put('/:id', protect, adminOnly, eventController.updateEvent);

/**
 * DELETE /api/events/:id
 * Delete an event and all related data (registrations, teams, announcements)
 * 
 * Parameters:
 * - id: string (event ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 * 
 * Requirements: 3.4
 * Access: Admin only
 */
router.delete('/:id', protect, adminOnly, eventController.deleteEvent);

module.exports = router;
