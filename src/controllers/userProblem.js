const { getLanguageById, submitBatch, submitToken } = require("../utils/ProblemUtility");
const Problem = require("../models/problem");
const Submission = require("../models/submission");

const createProblem = async (req, res) => {
    const {
        title, description, difficulty, tags,
        visibletestCases, hiddenTestCases, startCode,
        referenceSolution, problemCreator
    } = req.body;

    try {
        for (const { language, completeCode } of referenceSolution) {

            const language_id = getLanguageById(language);

            const submissions = visibletestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: language_id,
                stdin: testcase.input,
                expected_output: testcase.output,
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Error Occurred: Reference solution failed on visible test cases");
                }
            }
        }

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        res.status(201).send("Problem Created Successfully");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error: " + err.message);
    }
};

const updateProblem = async (req, res) => {
    const { id } = req.params;
    const {
        title, description, difficulty, tags,
        visibletestCases, hiddenTestCases, startCode,
        referenceSolution, problemCreator
    } = req.body;

    try {
        if (!id) {
            return res.status(400).send("Missing Id Field");
        }

        const DsaProblem = await Problem.findById(id);
        if (!DsaProblem) {
            return res.status(404).send("Id is not present in server");
        }

        for (const { language, completeCode } of referenceSolution) {

            const language_id = getLanguageById(language);

            const submissions = visibletestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: language_id,
                stdin: testcase.input,
                expected_output: testcase.output,
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Error Occurred: Reference solution failed on visible test cases");
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });

        res.status(200).send(newProblem);
    }
    catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

const deleteProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id)
            return res.status(400).send("Id is Missing");

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem)
            return res.status(404).send("Problem is Missing");

        res.status(200).send("Successfully Deleted");
    }
    catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id)
            return res.status(400).send("Id is Missing");

        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');

        if (!getProblem)
            return res.status(404).send("Problem is Missing");

        res.status(200).send(getProblem);
    }
    catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

const getAllProblem = async (req, res) => {
    try {
        const problems = await Problem.find({}).select('_id title difficulty tags');

        if (problems.length == 0)
            return res.status(404).send("Problem is Missing");

        res.status(200).send(problems);
    }
    catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

const solvedAllProblembyUser = async (req, res) => {
    try {
        const user = req.result; // already populated by userMiddleware

        if (!user) {
            return res.status(404).send("User not found");
        }

        const populatedUser = await user.populate({
            path: "problemSolved",
            select: "_id title difficulty tags",
        });

        res.status(200).json(populatedUser.problemSolved);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

const submittedProblem = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;

        const ans = await Submission.find({ userId, problemId });

        if (ans.length == 0)
            return res.status(200).send("No Submission present");

        res.status(200).send(ans);
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    solvedAllProblembyUser,
    submittedProblem
};