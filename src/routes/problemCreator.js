const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const { createProblem } = require("../controllers/userProblem");

// Create
problemRouter.post("/Create", adminMiddleware, createProblem);

// TODO: implement these in controllers/userProblem.js, then uncomment
problemRouter.patch("/update/:id", updateProblem);
problemRouter.delete("/delete/:id", deleteProblem);
problemRouter.get("/ProblemById/:id", getProblemById);
problemRouter.get("/getAllProblem", getAllProblem);
problemRouter.get("/ProblemSolvedByUser", solvedAllProblembuuUser);

module.exports = problemRouter;