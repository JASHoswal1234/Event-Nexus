const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add compound index on event + createdAt (descending)
announcementSchema.index({ event: 1, createdAt: -1 });

// Add index on author
announcementSchema.index({ author: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
