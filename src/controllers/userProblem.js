const {getLanguageById , submitBatch}= require("../utils/ProblemUtility");

const createProblem = async (req,res)=>{
    const {title,description, difficulty, tags, 
        visibletestCases, hiddenTestCases,startCode,
        referenceSolution,problemCreator
    } = req.body;
}

try{
    for(const {language, completeCode} of referenceSolution){

   const language_id = getLanguageById(language);

   // I am Creating Batch Submission
   const submissions = visibletestCases.map((testcase)=>({
     source_code:completeCode,
     language_id: languageId,
     stdin: testcase.input,
     expected_output: testcase.output,
   }));
 
   const submitResult = await subitBatch(submissions);

   const resultToken = submitResult.map((value)=> value.token); // ek array bnaega jisme sirf tokens rkhe honge
  }

   const testResult = await submitToken(resultToken);
}
    catch(err){

    }
