const mongoose = require('mongoose');
const { generateUniqueCode } = require('../utils/generateCode');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  joinCode: {
    type: String,
    required: [true, 'Join code is required'],
    unique: true,
    uppercase: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes on event and members
teamSchema.index({ event: 1 });
teamSchema.index({ members: 1 });

// Custom validation: members.length <= capacity
teamSchema.pre('validate', function(next) {
  if (this.members && this.members.length > this.capacity) {
    const error = new Error('Number of members cannot exceed team capacity');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Virtual field: memberCount
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual field: isFull
teamSchema.virtual('isFull').get(function() {
  return this.members.length >= this.capacity;
});

// Virtual field: availableSlots
teamSchema.virtual('availableSlots').get(function() {
  return this.capacity - this.members.length;
});

// Pre-save hook to generate unique joinCode if not present
teamSchema.pre('save', async function(next) {
  if (!this.joinCode) {
    let isUnique = false;
    let code;
    
    // Keep generating codes until we find a unique one
    while (!isUnique) {
      code = generateUniqueCode();
      const existingTeam = await mongoose.model('Team').findOne({ joinCode: code });
      if (!existingTeam) {
        isUnique = true;
      }
    }
    
    this.joinCode = code;
  }
  next();
});

// Ensure virtuals are included when converting to JSON
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
