const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblembyUser, submittedProblem, getProblemForAdmin } = require("../controllers/userProblem");
const userMiddleware = require("../middleware/userMiddleware");

// Create
problemRouter.post("/Create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

// these are user specific (we dont need admin here so not using adminMiddleware)
problemRouter.get("/problemById/:id", userMiddleware, getProblemById);
problemRouter.get("/getAllProblem", userMiddleware, getAllProblem);
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);
problemRouter.get("/admin/:id", adminMiddleware, getProblemForAdmin);
problemRouter.get("/admin/:id", adminMiddleware, getProblemForAdmin);

module.exports = problemRouter;