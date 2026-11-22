const Group = require('../models/group');
const User = require('../models/user');
const Problem = require('../models/problem');

const XP = { easy: 10, medium: 20, hard: 40 };

// 6-character invite code, e.g. "K7QX2M" (no look-alike characters)
const makeCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const uniqueCode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = makeCode();
    if (!(await Group.findOne({ inviteCode: code }))) return code;
  }
  throw new Error('Could not generate an invite code, try again');
};

// GET /group  -> groups the logged-in user belongs to
const myGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.result._id }).sort({ createdAt: -1 });
    res.json(
      groups.map((g) => ({
        _id: g._id,
        name: g.name,
        description: g.description,
        inviteCode: g.inviteCode,
        memberCount: g.members.length,
        isOwner: g.owner.toString() === req.result._id.toString(),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /group  { name, description? }
const createGroup = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Group name is required' });
    if (name.length > 60) return res.status(400).json({ message: 'Group name is too long (max 60)' });

    const group = await Group.create({
      name,
      description: (req.body.description || '').trim(),
      owner: req.result._id,
      members: [req.result._id],
      inviteCode: await uniqueCode(),
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /group/join  { inviteCode }
const joinGroup = async (req, res) => {
  try {
    const code = (req.body.inviteCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'Enter an invite code' });

    const group = await Group.findOne({ inviteCode: code });
    if (!group) return res.status(404).json({ message: 'No group found with that code' });

    const uid = req.result._id;
    if (group.members.some((m) => m.toString() === uid.toString()))
      return res.status(400).json({ message: 'You are already in this group' });

    group.members.push(uid);
    await group.save();
    res.json({ _id: group._id, name: group.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /group/:id  -> group details + member leaderboard (members only)
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate({
      path: 'members',
      model: User,
      select: 'firstName problemSolved',
      populate: { path: 'problemSolved', model: Problem, select: 'difficulty' },
    });
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const uid = req.result._id.toString();
    if (!group.members.some((m) => m._id.toString() === uid))
      return res.status(403).json({ message: 'You are not a member of this group' });

    const members = group.members
      .map((m) => ({
        _id: m._id,
        name: m.firstName,
        solved: m.problemSolved.length,
        xp: m.problemSolved.reduce((s, p) => s + (XP[p?.difficulty?.toLowerCase()] || 0), 0),
        isOwner: m._id.toString() === group.owner.toString(),
      }))
      .sort((a, b) => b.xp - a.xp || b.solved - a.solved);

    res.json({
      _id: group._id,
      name: group.name,
      description: group.description,
      inviteCode: group.inviteCode,
      isOwner: group.owner.toString() === uid,
      members,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /group/:id/leave
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const uid = req.result._id.toString();
    if (group.owner.toString() === uid)
      return res.status(400).json({ message: 'The owner cannot leave. Delete the group instead.' });

    group.members = group.members.filter((m) => m.toString() !== uid);
    await group.save();
    res.json({ message: 'You left the group' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /group/:id  (owner or admin)
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isOwner = group.owner.toString() === req.result._id.toString();
    if (!isOwner && req.result.role !== 'admin')
      return res.status(403).json({ message: 'Only the owner can delete this group' });

    await group.deleteOne();
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { myGroups, createGroup, joinGroup, getGroup, leaveGroup, deleteGroup };