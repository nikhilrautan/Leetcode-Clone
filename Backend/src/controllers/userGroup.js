const crypto = require('crypto');
const mongoose = require('mongoose');
const Group = require('../models/group');

const MAX_MEMBERS = 50;

const makeCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();

const shapeGroup = (group, userId) => ({
  _id: group._id,
  name: group.name,
  description: group.description,
  inviteCode: group.inviteCode,
  memberCount: group.members.length,
  isOwner: group.ownerId.equals(userId),
  createdAt: group.createdAt,
});

const serverError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong. Try again.' });
};

// GET /group  -> groups I belong to
const myGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.result._id }).sort({ createdAt: -1 });
    res.status(200).json({ groups: groups.map((g) => shapeGroup(g, req.result._id)) });
  } catch (err) {
    serverError(res, err);
  }
};

// POST /group  { name, description? }
const createGroup = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();

    if (name.length < 3) return res.status(400).json({ error: 'Group name needs at least 3 characters' });
    if (name.length > 40) return res.status(400).json({ error: 'Group name can be up to 40 characters' });
    if (description.length > 200) {
      return res.status(400).json({ error: 'Description can be up to 200 characters' });
    }

    let group = null;
    for (let attempt = 0; attempt < 5 && !group; attempt++) {
      try {
        group = await Group.create({
          name,
          description,
          ownerId: req.result._id,
          members: [req.result._id],
          inviteCode: makeCode(),
        });
      } catch (err) {
        if (err.code !== 11000) throw err; // only retry on invite code collision
      }
    }
    if (!group) return res.status(500).json({ error: 'Could not create the group. Try again.' });

    res.status(201).json({ group: shapeGroup(group, req.result._id) });
  } catch (err) {
    serverError(res, err);
  }
};

// POST /group/join  { inviteCode }
const joinGroup = async (req, res) => {
  try {
    const code = String(req.body.inviteCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Enter an invite code' });

    const group = await Group.findOne({ inviteCode: code });
    if (!group) return res.status(404).json({ error: 'No group found for that code' });

    const userId = req.result._id;
    if (!group.members.some((id) => id.equals(userId))) {
      if (group.members.length >= MAX_MEMBERS) {
        return res.status(400).json({ error: 'This group is full' });
      }
      group.members.push(userId);
      await group.save();
    }

    res.status(200).json({ group: shapeGroup(group, userId) });
  } catch (err) {
    serverError(res, err);
  }
};

// GET /group/:id  -> group details + leaderboard (members only)
const getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid group' });

    const group = await Group.findById(id).populate('members', 'firstName problemSolved');
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const userId = req.result._id;
    if (!group.members.some((m) => m._id.equals(userId))) {
      return res.status(403).json({ error: 'Join this group to see it' });
    }

    const leaderboard = group.members
      .map((m) => ({
        _id: m._id,
        firstName: m.firstName,
        solved: (m.problemSolved || []).length,
        isOwner: group.ownerId.equals(m._id),
      }))
      .sort((a, b) => b.solved - a.solved);

    res.status(200).json({
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        inviteCode: group.inviteCode,
        memberCount: group.members.length,
        isOwner: group.ownerId.equals(userId),
        createdAt: group.createdAt,
      },
      leaderboard,
    });
  } catch (err) {
    serverError(res, err);
  }
};

// POST /group/:id/leave
const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid group' });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const userId = req.result._id;
    if (group.ownerId.equals(userId)) {
      return res.status(400).json({ error: 'Owners cannot leave. Delete the group instead.' });
    }

    group.members.pull(userId);
    await group.save();
    res.status(200).json({ message: 'You left the group' });
  } catch (err) {
    serverError(res, err);
  }
};

// DELETE /group/:id  (owner only)
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid group' });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (!group.ownerId.equals(req.result._id)) {
      return res.status(403).json({ error: 'Only the owner can delete this group' });
    }

    await group.deleteOne();
    res.status(200).json({ message: 'Group deleted' });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { myGroups, createGroup, joinGroup, getGroup, leaveGroup, deleteGroup };