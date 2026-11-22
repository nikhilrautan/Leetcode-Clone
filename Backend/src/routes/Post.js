const express = require('express');
const postRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { createPost, deletePost, likePost, commentPost } = require('../controllers/userPost');

postRouter.post('/', userMiddleware, createPost);
postRouter.delete('/:id', userMiddleware, deletePost);
postRouter.post('/:id/like', userMiddleware, likePost);
postRouter.post('/:id/comment', userMiddleware, commentPost);

module.exports = postRouter;