const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { submitCode, runCode } = require("../controllers/userSubmission");
const createRateLimiter = require("../middleware/rateLimiter");

const submitLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10,             // 10 submissions per minute per user
    message: "Too many submissions, slow down."
});

const runLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 15,
    message: "Too many run requests, slow down."
});

submitRouter.post("/submit/:id", userMiddleware, submitLimiter, submitCode);
submitRouter.post("/run/:id", userMiddleware, runLimiter, runCode);

module.exports = submitRouter;