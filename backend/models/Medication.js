const mongoose = require('mongoose');

const medSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Medication', medSchema);