/**
 * User Controller for EventNexus Backend
 * Handles user management operations
 */

const User = require('../models/User');
const Registration = require('../models/Registration');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');

/**
 * Get All Participants
 * GET /api/users/participants
 * Protected route (admin only)
 * 
 * Returns all users with role "participant"
 * Includes registration count for each participant
 */
exports.getAllParticipants = asyncHandler(async (req, res, next) => {
  // Find all users with role "participant"
  const participants = await User.find({ role: 'participant' })
    .select('email name createdAt')
    .sort({ createdAt: -1 });

  // Get registration count for each participant
  const participantsWithCount = await Promise.all(
    participants.map(async (participant) => {
      const registrationCount = await Registration.countDocuments({
        user: participant._id
      });

      return {
        id: participant._id,
        _id: participant._id,
        email: participant.email,
        name: participant.name,
        createdAt: participant.createdAt,
        registrationCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: participantsWithCount.length,
    participants: participantsWithCount
  });
});

/**
 * Get All Users
 * GET /api/users
 * Protected route (admin only)
 * 
 * Returns all users (both admin and participant)
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()
    .select('email name role createdAt')
    .sort({ createdAt: -1 });

  const usersWithCount = await Promise.all(
    users.map(async (user) => {
      const registrationCount = await Registration.countDocuments({
        user: user._id
      });

      return {
        id: user._id,
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        registrationCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: usersWithCount.length,
    users: usersWithCount
  });
});
