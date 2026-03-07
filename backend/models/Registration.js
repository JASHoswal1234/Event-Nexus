const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkInTime: {
    type: Date
  }
});

// Add compound unique index on user + event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Add indexes on event and user
registrationSchema.index({ event: 1 });
registrationSchema.index({ user: 1 });

// Post-save hook to increment event.registrationCount
registrationSchema.post('save', async function(doc) {
  try {
    const Event = mongoose.model('Event');
    await Event.findByIdAndUpdate(doc.event, {
      $inc: { registrationCount: 1 }
    });
  } catch (error) {
    console.error('Error incrementing registration count:', error);
  }
});

// Post-remove hook to decrement event.registrationCount
registrationSchema.post('remove', async function(doc) {
  try {
    const Event = mongoose.model('Event');
    await Event.findByIdAndUpdate(doc.event, {
      $inc: { registrationCount: -1 }
    });
  } catch (error) {
    console.error('Error decrementing registration count:', error);
  }
});

// Post-deleteOne hook to decrement event.registrationCount
registrationSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  try {
    const Event = mongoose.model('Event');
    await Event.findByIdAndUpdate(doc.event, {
      $inc: { registrationCount: -1 }
    });
  } catch (error) {
    console.error('Error decrementing registration count:', error);
  }
});

// Post-findOneAndDelete hook to decrement event.registrationCount
registrationSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const Event = mongoose.model('Event');
      await Event.findByIdAndUpdate(doc.event, {
        $inc: { registrationCount: -1 }
      });
    } catch (error) {
      console.error('Error decrementing registration count:', error);
    }
  }
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
