const express = require('express');

const problemRouter = express.Router();

// Create
problemRouter.post("/Create",problemCreate);
problemRouter.get("/:id",problemFetch);
problemRouter,get("/",problemAllFetch);
problemRouter.patch("/:id",problemUpdate);
problemRouter.delete("/:id",problemDelete);