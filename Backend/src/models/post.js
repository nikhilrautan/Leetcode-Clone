// src/models/post.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    text: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

const postSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, required: true, trim: true, maxlength: 500 },
    problemId: { type: Schema.Types.ObjectId, ref: 'problem' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('post', postSchema);