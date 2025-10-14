const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: String, // UUID from PostgreSQL
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'create_transaction',
      'update_transaction',
      'delete_transaction',
      'create_category',
      'update_category',
      'delete_category',
      'export_excel',
      'send_email',
      'upload_pdf',
      'process_pdf',
      'update_profile'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient querying
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1 });

// TTL index - auto-delete logs older than 90 days
ActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
