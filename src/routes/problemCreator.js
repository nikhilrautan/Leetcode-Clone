const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const { createProblem } = require("../controllers/userProblem");

// Create
problemRouter.post("/Create", adminMiddleware, createProblem);

// TODO: implement these in controllers/userProblem.js, then uncomment
// problemRouter.patch("/:id", updateProblem);
// problemRouter.delete("/:id", deleteProblem);
// problemRouter.get("/:id", getProblemById);
// problemRouter.get("/", getAllProblem);
// problemRouter.get("/user", solvedAllProblembuuUser);

module.exports = problemRouter;