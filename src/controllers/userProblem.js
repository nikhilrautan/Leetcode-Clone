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

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

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

const updateProblem = async(req,res)=>{
    const {id} = req.params;
     const {
        title, description, difficulty, tags,
        visibletestCases, hiddenTestCases, startCode,
        referenceSolution, problemCreator
    } = req.body;

    try{
        if(!id){
            return res.status(400).send("Missing Id Field");
        }

        const DsaProblem = await Problem.findById(id);
        if(!DsaProblem){
            return res.send(404).send("Id is not present in server");
        }
    for (const { language, completeCode } of referenceSolution) {

            const language_id = getLanguageById(language);

            // Creating Batch Submission
            const submissions = visibletestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: language_id,
                stdin: testcase.input,
                expected_output: testcase.output,
            }));

            // submitting submition : token laake diye 
            const submitResult = await submitBatch(submissions);
           // token submit krae
            const resultToken = submitResult.map((value) => value.token); // array of tokens
           // token ka result mil gya : fir last m sara data update kra skta hu 
            const testResult = await submitToken(resultToken);

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Error Occurred: Reference solution failed on visible test cases");
                }
            }
        }
        // ab store krane k liye 
                                                              // update maarne se phle validtor pr chaeck kr lena
       const newProblem = await Problem.findByIdAndUpdate(id, {...req.body},{runvalidators:true, new:true});
      
       res.status(200).send(newProblem);
    }
    catch(err){
     res.status(500).send("Error: "+err); 
    }

}

const deleteProblem = async(req,res)=>{

    const {id} = req.params;
    try{
       if(!id)
        return res.status(400).send("Id is Missing");

       const deletedProblem = await Problem.findByIdAndDelete(id);

       if(!deletedProblem)
        return res.status(404).send("Problem is Missing");

       res.status(200).send("Successfully Deleted");
    }
    catch(err){
      res.status(500).send("Error: "+err);
    }
}

const getProblemById = async(req,res)=>{
    const {id} = req.params;
    try{
       if(!id)
        return res.status(400).send("Id is Missing");

       const getProblem = await Problem.findById(id).select('title description difficulty tags visibleTestCases startCode referenceSolution');

       if(!getProblem)
        return res.status(404).send("Problem is Missing");

       res.status(200).send(getProblem);
    }
    catch(err){
      res.status(500).send("Error: "+err);
    }
}

const getAllProblem = async(req,res)=>{
    try{
       const problems = await Problem.find({});

       if(problems.length == 0)
        return res.status(404).send("Problem is Missing");

       res.status(200).send(problems);
    }
    catch(err){
      res.status(500).send("Error: "+err);
    }
}


const solvedAllProblembyUser = async (req, res) => {
    try {
        const userId = req.result._id;

        const submissions = await Submission.find({ userId, status: 'accepted' }).distinct('problemId');

        const solvedProblems = await Problem.find({ _id: { $in: submissions } });

        res.status(200).send(solvedProblems);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
};

module.exports = { createProblem,updateProblem,deleteProblem ,getProblemById,getAllProblem};