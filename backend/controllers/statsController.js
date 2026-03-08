/**
 * Statistics Controller for EventNexus Backend
 * Handles system-wide and event-specific statistics
 * 
 * Requirements:
 * - 10.1: Return total user count
 * - 10.2: Return total event count
 * - 10.3: Return total registration count
 * - 10.4: Return total team count
 * - 10.5: Return registration count for specific event
 * - 10.6: Return team count for specific event
 * - 10.7: Return check-in count for specific event
 */

const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');

/**
 * Get system-wide statistics
 * GET /api/stats
 * 
 * @returns {Object} - { totalUsers, totalEvents, totalRegistrations, totalTeams, totalCheckIns }
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */
exports.getSystemStats = asyncHandler(async (req, res, next) => {
  // Get start of today (midnight)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Count documents in each collection
  const [totalUsers, totalEvents, totalRegistrations, totalTeams, totalCheckIns] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Registration.countDocuments(),
    Team.countDocuments(),
    Registration.countDocuments({ 
      checkedIn: true,
      checkInTime: { $gte: startOfToday }
    })
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalTeams,
      totalCheckIns
    }
  });
});

/**
 * Get event-specific statistics
 * GET /api/stats/event/:eventId
 * 
 * @param {string} req.params.eventId - Event ID
 * @returns {Object} - { registrationCount, teamCount, checkInCount }
 * 
 * Requirements: 10.5, 10.6, 10.7
 */
exports.getEventStats = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  // Verify event exists
  const event = await Event.findById(eventId);
  if (!event) {
    throw new NotFoundError('Event', eventId);
  }

  // Count registrations, teams, and checked-in registrations for the event
  const [registrationCount, teamCount, checkInCount] = await Promise.all([
    Registration.countDocuments({ event: eventId }),
    Team.countDocuments({ event: eventId }),
    Registration.countDocuments({ event: eventId, checkedIn: true })
  ]);

  res.status(200).json({
    success: true,
    stats: {
      registrationCount,
      teamCount,
      checkInCount
    }
  });
});
