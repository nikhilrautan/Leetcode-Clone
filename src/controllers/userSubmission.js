const Problem = requie("../models/problem");
const Submission = require("../models/submission");
const submitCode = async(req,res)=>{


    try{
    const userId = req.result._id;
    const problemId = req.params.id;

    const {code,language} = req.body;
    if(!userId || !code || !problemId || !language)
        return res.status(400).send("Some field Missing");

    // Fetch the problem from dsatabase
    const problem =  await Problem.findById(problemId);

    // testcases(hidden)
  
    }
    catch(err){

    }
}

module.exports = submitCode;