const express = require('express');
const feedRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getFeed } = require('../controllers/userFeed');   // use your real function names

feedRouter.get('/', userMiddleware, getFeed);

module.exports = feedRouter;