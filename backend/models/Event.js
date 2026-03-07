const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  mode: {
    type: String,
    enum: {
      values: ['online', 'offline'],
      message: 'Mode must be either online or offline'
    },
    required: [true, 'Event mode is required']
  },
  registrationCount: {
    type: Number,
    default: 0,
    min: [0, 'Registration count cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes on date, mode, and createdBy
eventSchema.index({ date: 1 });
eventSchema.index({ mode: 1 });
eventSchema.index({ createdBy: 1 });

// Custom validation: registrationDeadline must be before event date
eventSchema.pre('validate', function(next) {
  if (this.registrationDeadline && this.date && this.registrationDeadline >= this.date) {
    const error = new Error('Registration deadline must be before event date');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Update updatedAt timestamp on save
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual field: availableSlots
eventSchema.virtual('availableSlots').get(function() {
  return this.capacity - this.registrationCount;
});

// Virtual field: isFull
eventSchema.virtual('isFull').get(function() {
  return this.registrationCount >= this.capacity;
});

// Virtual field: isRegistrationOpen
eventSchema.virtual('isRegistrationOpen').get(function() {
  return Date.now() < this.registrationDeadline;
});

// Ensure virtuals are included when converting to JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
