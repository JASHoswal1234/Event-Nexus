/**
 * Registration Controller for EventNexus Backend
 * Handles event registration, cancellation, check-in, and registration retrieval
 * Implements Requirements 5.1-5.6, 6.1-6.4
 */

const Registration = require('../models/Registration');
const Event = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../utils/errors');

/**
 * Register for Event
 * POST /api/registrations/:eventId
 * Protected route (participant or admin)
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * Checks:
 * - Event exists
 * - No duplicate registration
 * - Event has available capacity
 * - Registration deadline has not passed
 * 
 * Creates registration with checkedIn = false
 * Returns created registration
 */
exports.registerForEvent = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  // Find event
  const event = await Event.findById(eventId);
  if (!event) {
    throw new NotFoundError('Event', eventId);
  }

  // Check if user is already registered
  const existingRegistration = await Registration.findOne({
    user: userId,
    event: eventId
  });

  if (existingRegistration) {
    throw new ConflictError('User already registered for this event');
  }

  // Check if event is at full capacity
  if (event.registrationCount >= event.capacity) {
    throw new ConflictError('Event is at full capacity');
  }

  // Check if registration deadline has passed
  if (Date.now() > event.registrationDeadline) {
    throw new ConflictError('Registration deadline has passed');
  }

  // Create registration
  const registration = await Registration.create({
    user: userId,
    event: eventId
  });

  // Populate user info for response
  await registration.populate('user', 'email role');
  await registration.populate('event', 'title date location');

  res.status(201).json({
    success: true,
    registration
  });
});

/**
 * Cancel Registration
 * DELETE /api/registrations/:eventId
 * Protected route (participant or admin)
 * 
 * Validates: Requirements 5.6
 * 
 * Finds and deletes registration
 * Decrements event registrationCount (via model hook)
 * Returns success message
 */
exports.cancelRegistration = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  // Find registration
  const registration = await Registration.findOne({
    user: userId,
    event: eventId
  });

  if (!registration) {
    throw new NotFoundError('Registration', `for event ${eventId}`);
  }

  // Delete registration (triggers post-hook to decrement count)
  await registration.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Registration cancelled successfully'
  });
});

/**
 * Check In Participant
 * POST /api/registrations/:eventId/checkin
 * Protected route (admin only)
 * 
 * Validates: Requirements 6.1, 6.2, 6.3
 * 
 * Validates admin role (via middleware)
 * Finds registration by userId (from body) and eventId
 * Updates checkedIn to true and sets checkInTime
 * Returns updated registration
 */
exports.checkInParticipant = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  // Validate userId is provided
  if (!userId) {
    throw new ConflictError('User ID is required for check-in');
  }

  // Find registration
  const registration = await Registration.findOne({
    user: userId,
    event: eventId
  });

  if (!registration) {
    throw new NotFoundError('Registration', `for user ${userId} and event ${eventId}`);
  }

  // Update check-in status
  registration.checkedIn = true;
  registration.checkInTime = new Date();
  await registration.save();

  // Populate user info for response
  await registration.populate('user', 'email role');
  await registration.populate('event', 'title date location');

  res.status(200).json({
    success: true,
    registration
  });
});

/**
 * Get Event Registrations
 * GET /api/registrations/event/:eventId
 * Protected route (admin only)
 * 
 * Validates: Requirements 6.4
 * 
 * Validates admin role (via middleware)
 * Finds all registrations for event
 * Populates user info
 * Returns list with checkedIn status and checkInTime
 */
exports.getEventRegistrations = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  // Verify event exists
  const event = await Event.findById(eventId);
  if (!event) {
    throw new NotFoundError('Event', eventId);
  }

  // Find all registrations for event
  const registrations = await Registration.find({ event: eventId })
    .populate('user', 'email role createdAt')
    .populate('event', 'title date location')
    .sort({ registrationDate: -1 });

  res.status(200).json({
    success: true,
    count: registrations.length,
    registrations
  });
});
