/**
 * Announcement Controller for EventNexus Backend
 * Handles announcement creation, retrieval, and deletion operations
 * 
 * Requirements:
 * - 9.1: Create announcement with title, content, event association, and timestamp
 * - 9.2: Verify event exists when creating announcement
 * - 9.3: Return announcements ordered by timestamp descending
 * - 9.4: Delete announcement
 * - 9.5: Include author information in announcement responses
 */

const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');

/**
 * Create a new announcement
 * POST /api/announcements
 * 
 * @param {Object} req.body - { title: string, content: string, eventId: string }
 * @returns {Object} - { success: boolean, announcement: Announcement }
 * 
 * Requirements: 9.1, 9.2
 */
exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  const { title, content, eventId } = req.body;

  // Verify event exists
  const event = await Event.findById(eventId);
  if (!event) {
    throw new NotFoundError('Event', eventId);
  }

  // Create announcement with author set to authenticated admin user
  const announcement = await Announcement.create({
    title,
    content,
    event: eventId,
    author: req.user._id
  });

  // Populate author information before returning
  await announcement.populate('author', 'email role');

  res.status(201).json({
    success: true,
    announcement
  });
});

/**
 * Get all announcements for an event
 * GET /api/announcements/event/:eventId
 * 
 * @param {string} req.params.eventId - Event ID
 * @returns {Object} - { success: boolean, announcements: Announcement[] }
 * 
 * Requirements: 9.3, 9.5
 */
exports.getEventAnnouncements = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  // Find all announcements for the event, sorted by createdAt descending
  const announcements = await Announcement.find({ event: eventId })
    .sort({ createdAt: -1 })
    .populate('author', 'email role');

  res.status(200).json({
    success: true,
    count: announcements.length,
    announcements
  });
});

/**
 * Delete an announcement
 * DELETE /api/announcements/:id
 * 
 * @param {string} req.params.id - Announcement ID
 * @returns {Object} - { success: boolean, message: string }
 * 
 * Requirements: 9.4
 */
exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new NotFoundError('Announcement', req.params.id);
  }

  // Delete the announcement
  await Announcement.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});
