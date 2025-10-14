const mongoose = require('mongoose');

const ProcessedFileSchema = new mongoose.Schema({
  userId: {
    type: String, // UUID from PostgreSQL
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'csv', 'excel'],
    required: true
  },
  size: {
    type: Number
  },
  extractedText: {
    type: String
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed
  },
  processedTransactions: [{
    date: Date,
    amount: Number,
    description: String,
    imported: { type: Boolean, default: false },
    transactionId: String // Reference to PostgreSQL transaction if imported
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  }
});

// Indexes
ProcessedFileSchema.index({ userId: 1, createdAt: -1 });
ProcessedFileSchema.index({ status: 1 });

module.exports = mongoose.model('ProcessedFile', ProcessedFileSchema);
