// src/models/goal.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const goalSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  title: { type: String, required: true },
  target: { type: Number, default: 1 },
  progress: { type: Number, default: 0 },
  deadline: Date,
  status: { type: String, enum: ['active', 'completed', 'missed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('goal', goalSchema);