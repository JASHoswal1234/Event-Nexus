/**
 * Announcement Routes for EventNexus Backend
 * Defines routes for announcement creation, retrieval, and deletion
 * 
 * Requirements:
 * - 9.1: Announcement creation endpoint
 * - 9.3: Get event announcements endpoint
 * - 9.4: Announcement deletion endpoint
 */

const express = require('express');
const router = express.Router();
const annController = require('../controllers/annController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validate, announcementSchema } = require('../middlewares/validate');

/**
 * POST /api/announcements
 * Create a new announcement for an event
 * 
 * Request body:
 * {
 *   title: string (required),
 *   content: string (required),
 *   eventId: string (required)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   announcement: Announcement (includes author info and timestamp)
 * }
 * 
 * Requirements: 9.1, 9.2, 9.5
 * Access: Admin only
 */
router.post('/', protect, adminOnly, validate(announcementSchema), annController.createAnnouncement);

/**
 * GET /api/announcements/event/:eventId
 * Get all announcements for an event
 * 
 * Parameters:
 * - eventId: string (event ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   count: number,
 *   announcements: Announcement[] (ordered by timestamp descending, includes author info)
 * }
 * 
 * Requirements: 9.3, 9.5
 * Access: Protected (authenticated users)
 */
router.get('/event/:eventId', protect, annController.getEventAnnouncements);

/**
 * DELETE /api/announcements/:id
 * Delete an announcement
 * 
 * Parameters:
 * - id: string (announcement ID)
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 * 
 * Requirements: 9.4
 * Access: Admin only
 */
router.delete('/:id', protect, adminOnly, annController.deleteAnnouncement);

module.exports = router;
