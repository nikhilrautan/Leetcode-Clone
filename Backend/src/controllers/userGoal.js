const mongoose = require('mongoose');
const Goal = require('../models/goal');

const shapeGoal = (g) => ({
  _id: g._id,
  text: g.text,
  done: g.done,
  createdAt: g.createdAt,
});

const serverError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong. Try again.' });
};

// GET /goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.result._id }).sort({ createdAt: -1 });
    res.status(200).json({ goals: goals.map(shapeGoal) });
  } catch (err) {
    serverError(res, err);
  }
};

// POST /goals  { text }
const createGoal = async (req, res) => {
  try {
    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Enter a goal first' });
    if (text.length > 200) return res.status(400).json({ error: 'Goals can be up to 200 characters' });

    const count = await Goal.countDocuments({ userId: req.result._id });
    if (count >= 100) return res.status(400).json({ error: 'You can have up to 100 goals' });

    const goal = await Goal.create({ userId: req.result._id, text });
    res.status(201).json({ goal: shapeGoal(goal) });
  } catch (err) {
    serverError(res, err);
  }
};

// PUT /goals/:id  { text?, done? }
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid goal' });

    const updates = {};
    if (typeof req.body.done === 'boolean') updates.done = req.body.done;
    if (req.body.text !== undefined) {
      const text = String(req.body.text).trim();
      if (!text) return res.status(400).json({ error: 'Goal cannot be empty' });
      if (text.length > 200) return res.status(400).json({ error: 'Goals can be up to 200 characters' });
      updates.text = text;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: req.result._id },
      { $set: updates },
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    res.status(200).json({ goal: shapeGoal(goal) });
  } catch (err) {
    serverError(res, err);
  }
};

// DELETE /goals/:id
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid goal' });

    const goal = await Goal.findOneAndDelete({ _id: id, userId: req.result._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    res.status(200).json({ message: 'Goal deleted' });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };