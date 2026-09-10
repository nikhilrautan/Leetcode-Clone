const express = require('express');

const problemRouter = express.Router();

// Create
problemRouter.post("/Create",createProblem);
problemRouter.patch("/:id",updateProblem);
problemRouter.delete("/:id",deleteProblem);

problemRouter.get("/:id",getProblemById);
problemRouter,get("/",getAllProblem);
problemRouter.get("/user",solvedAllProblembuuUser);