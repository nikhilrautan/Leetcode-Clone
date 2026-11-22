// src/models/group.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupSchema = new Schema({
  name: { type: String, required: true, trim: true, maxLength: 60 },
  description: { type: String, default: '' },
  owner: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  inviteCode: { type: String, unique: true, required: true },
}, { timestamps: true });

const Group = mongoose.model('group', groupSchema);
module.exports = Group;