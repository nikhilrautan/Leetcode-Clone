const { getLanguageById, submitBatch, submitToken } = require("../utils/ProblemUtility");
// const Problem = require("../models/problem"); // uncomment if you're saving to DB

const createProblem = async (req, res) => {
    const {
        title, description, difficulty, tags,
        visibletestCases, hiddenTestCases, startCode,
        referenceSolution, problemCreator
    } = req.body;

    try {
        for (const { language, completeCode } of referenceSolution) {

            const language_id = getLanguageById(language);

            // Creating Batch Submission
            const submissions = visibletestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: language_id,
                stdin: testcase.input,
                expected_output: testcase.output,
            }));

            const submitResult = await submitBatch(submissions);

            const resultToken = submitResult.map((value) => value.token); // array of tokens

            const testResult = await submitToken(resultToken);

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Error Occurred: Reference solution failed on visible test cases");
                }
            }
        }

        await Problem.create({
            ...req.body,
            problemCreator:
        })

        // All reference solutions passed all visible test cases — safe to save
        // const userProblem = await Problem.create({
        //     ...req.body
        // });

        // now all the things are correct we can store this in DB
        res.status(201).send("Problem Created Successfully");


    } catch (err) {
        console.error(err);
        res.status(500).send("Error: " + err.message);
    }
};

module.exports = { createProblem };