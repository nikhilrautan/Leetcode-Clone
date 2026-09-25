const Problem = requie("../models/problem");
const Submission = require("../models/submission");
const {getLanguageById,submitBatch} = require("../utils/problemUtility");
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

    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status:'pending',
      testCasesTotal:problem.hiddenTestCases.length,
    })
  
    // judge0 ko code submit krna hai 

    const language_id = getLanguageById(language);
      const submissions = problem.hiddenTestCases.map((testcase) => ({
                source_code: code,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output,
            }));

            // submitting submition : token laake diye 
            const submitResult = await submitBatch(submissions);
             // token submit krae
            const resultToken = submitResult.map((value) => value.token); // array of tokens
            // token ka result mil gya : fir last m sara data update kra skta hu 
            const testResult = await submitToken(resultToken);

            // submittedResult ko update krna hoga
            let testCasesPassed =0;
            let runtime =0;
            let memory =0;
            let status = 'accepted';
            let errorMessage = ' ';

         for(const testResult){
            if(test.status_id ==3){
                testCasesPassed++;
                runtime = runtime + parseFloate(test.time);
                memory = Math.max(memory,test.memory);
             }
             else{
               if(test.status_id==4){
                status = 'error'
                errorMessage = test.stderr
               }
               else{
                status = 'wrong'
                errorMessage = test.stderr
               }
             }
            }


            // store the result in Database in Submission
            submittedResult.status = status;
            submittedResult.testCasesPassed = testCasesPassed;
            submittedResult.errorMessage = errorMessage;
            submittedResult.runtime = runtime;
             submittedResult.memory = memory;
             
             await  submittedResult.save();

    }
    catch(err){

    }
}

module.exports = submitCode;