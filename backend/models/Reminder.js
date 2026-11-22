const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  times: [{ type: String }], 
  isActive: { type: Boolean, default: true },
  lastNotified: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);