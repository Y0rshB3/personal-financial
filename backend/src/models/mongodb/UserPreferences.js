const mongoose = require('mongoose');

const UserPreferencesSchema = new mongoose.Schema({
  userId: {
    type: String, // UUID from PostgreSQL
    required: true,
    unique: true,
    index: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  language: {
    type: String,
    default: 'es'
  },
  notifications: {
    email: {
      weeklyReport: { type: Boolean, default: true },
      monthlyReport: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      savingsGoals: { type: Boolean, default: true }
    },
    push: {
      enabled: { type: Boolean, default: false }
    }
  },
  dashboard: {
    defaultCurrency: { type: String, default: 'USD' },
    defaultView: { type: String, enum: ['month', 'week', 'year'], default: 'month' },
    chartType: { type: String, enum: ['bar', 'line', 'pie'], default: 'bar' }
  },
  exportSettings: {
    defaultFormat: { type: String, enum: ['excel', 'csv', 'pdf'], default: 'excel' },
    includeCharts: { type: Boolean, default: true }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
UserPreferencesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserPreferences', UserPreferencesSchema);
