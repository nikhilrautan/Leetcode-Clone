const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const { createProblem } = require("../controllers/userProblem");

// Create
problemRouter.post("/Create", adminMiddleware, createProblem);

problemRouter.patch("/update/:id",adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware, deleteProblem);

// these are user specific (we dont need admin here so not using adminMiddleware)
problemRouter.get("/ProblemById/:id", getProblemById);
problemRouter.get("/getAllProblem", getAllProblem);
problemRouter.get("/ProblemSolvedByUser", solvedAllProblembuuUser);

module.exports = problemRouter;