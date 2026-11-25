const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const buildSource = require("../utils/buildSource");

// Readable reason for a failed Judge0 test result
const describeFailure = (test) =>
  test.stderr || test.compile_output || test.status?.description || "Wrong Answer";

const submitCode = async (req, res) => {

  try {

    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");


    if (language === 'cpp')
      language = 'c++'

    // Fetch the problem from database
    const problem = await Problem.findById(problemId);
    if (!problem)
      return res.status(404).send("Problem not found");

    // Guard: nothing to judge against (checked BEFORE saving a submission)
    if (!Array.isArray(problem.hiddenTestCases) || problem.hiddenTestCases.length === 0)
      return res.status(400).send("This problem has no hidden test cases yet.");

    // Store the submission first as pending
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: 'pending',
      testCasesTotal: problem.hiddenTestCases.length
    })

    // Judge0 code ko submit karna hai
    const languageId = getLanguageById(language);

    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: buildSource(problem.driverCode, language, code),
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output
    }));


    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);


    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;


    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time)
        memory = Math.max(memory, test.memory);
      } else if (status === 'accepted') {
        // Judge0: 4 = Wrong Answer, anything else (5+) = TLE / compile / runtime error
        status = test.status_id == 4 ? 'wrong' : 'error';
        errorMessage = describeFailure(test);
      }
    }


    // Store the result in Database in Submission
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    const accepted = (status == 'accepted')

    // Only mark the problem as solved when the submission was accepted
    if (accepted && !req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(201).json({
      accepted,
      error: accepted ? null : errorMessage,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory
    });

  }
  catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
}

// Submissions per day for the last 7 days (oldest first). Used by the dashboard chart.
const getActivity = async (req, res) => {
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6);

    const subs = await Submission.find(
      { userId: req.result._id, createdAt: { $gte: since } },
      'createdAt'
    );

    const counts = Array(7).fill(0);
    subs.forEach((s) => {
      const d = new Date(s.createdAt);
      d.setHours(0, 0, 0, 0);
      const i = Math.round((d - since) / 86400000);
      if (i >= 0 && i < 7) counts[i]++;
    });
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const runCode = async (req, res) => {

  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    // Fetch the problem from database
    const problem = await Problem.findById(problemId);
    if (!problem)
      return res.status(404).send("Problem not found");

    // Guard: this was the cause of the "reading 'map'" and empty-batch errors
    if (!Array.isArray(problem.visibleTestCases) || problem.visibleTestCases.length === 0)
      return res.status(400).json({
        success: false,
        error: "This problem has no example test cases yet."
      });

    if (language === 'cpp')
      language = 'c++'

    // Judge0 code ko submit karna hai
    const languageId = getLanguageById(language);

    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: buildSource(problem.driverCode, language, code),
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output
    }));


    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        runtime = runtime + parseFloat(test.time)
        memory = Math.max(memory, test.memory);
      } else if (status) {
        status = false;
        errorMessage = describeFailure(test);
      }
    }

    res.status(201).json({
      success: status,
      error: errorMessage,
      testCases: testResult,
      runtime,
      memory
    });

  }
  catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
}


module.exports = { submitCode, runCode, getActivity };