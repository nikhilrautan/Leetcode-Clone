const express = require('express');
const groupRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { myGroups, createGroup, joinGroup, getGroup, leaveGroup, deleteGroup } = require('../controllers/userGroup');

groupRouter.get('/', userMiddleware, myGroups);
groupRouter.post('/', userMiddleware, createGroup);
groupRouter.post('/join', userMiddleware, joinGroup);
groupRouter.get('/:id', userMiddleware, getGroup);
groupRouter.post('/:id/leave', userMiddleware, leaveGroup);
groupRouter.delete('/:id', userMiddleware, deleteGroup);

module.exports = groupRouter;