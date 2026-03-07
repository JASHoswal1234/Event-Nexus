const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/errors');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const Announcement = require('../models/Announcement');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Admin
 */
exports.createEvent = asyncHandler(async (req, res, next) => {
  const { title, description, date, location, capacity, registrationDeadline, mode } = req.body;

  // Create event with createdBy set to the authenticated admin user
  const event = await Event.create({
    title,
    description,
    date,
    location,
    capacity,
    registrationDeadline,
    mode,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    event
  });
});

/**
 * @desc    Get all events with optional filters
 * @route   GET /api/events
 * @access  Public/Protected
 */
exports.getEvents = asyncHandler(async (req, res, next) => {
  const { mode, startDate, endDate } = req.query;

  // Build query object
  const query = {};

  // Filter by mode if provided
  if (mode) {
    query.mode = mode;
  }

  // Filter by date range if provided
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  // Find events and populate registration info
  const events = await Event.find(query)
    .populate('createdBy', 'email role')
    .sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    events
  });
});

/**
 * @desc    Get event by ID
 * @route   GET /api/events/:id
 * @access  Public/Protected
 */
exports.getEventById = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'email role');

  if (!event) {
    throw new NotFoundError('Event', req.params.id);
  }

  res.status(200).json({
    success: true,
    event
  });
});

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Admin
 */
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    throw new NotFoundError('Event', req.params.id);
  }

  // Allowed fields for update
  const allowedUpdates = [
    'title',
    'description',
    'date',
    'location',
    'capacity',
    'registrationDeadline',
    'mode'
  ];

  // Apply only the provided fields
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      event[field] = req.body[field];
    }
  });

  // Save the updated event (triggers validation)
  await event.save();

  res.status(200).json({
    success: true,
    event
  });
});

/**
 * @desc    Delete event and cascade delete related data
 * @route   DELETE /api/events/:id
 * @access  Admin
 */
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new NotFoundError('Event', req.params.id);
  }

  // Cascade delete: Remove all related registrations
  await Registration.deleteMany({ event: req.params.id });

  // Cascade delete: Remove all related teams
  await Team.deleteMany({ event: req.params.id });

  // Cascade delete: Remove all related announcements
  await Announcement.deleteMany({ event: req.params.id });

  // Delete the event itself
  await Event.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Event and all related data deleted successfully'
  });
});
