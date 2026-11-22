const mongoose = require('mongoose');
const { Schema } = mongoose;

const goalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 200 },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Goal = mongoose.model('goal', goalSchema);

module.exports = Goal;