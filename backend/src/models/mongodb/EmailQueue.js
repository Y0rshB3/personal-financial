const mongoose = require('mongoose');

const EmailQueueSchema = new mongoose.Schema({
  userId: {
    type: String, // UUID from PostgreSQL
    required: true,
    index: true
  },
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    path: String,
    contentType: String
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
EmailQueueSchema.index({ status: 1, scheduledFor: 1 });
EmailQueueSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('EmailQueue', EmailQueueSchema);
