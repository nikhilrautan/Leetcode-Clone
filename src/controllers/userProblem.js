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
   const submissions = visibletestCases.map((input, output)=>({
     source_code:completeCode,
     language_id: languageId,
     stdin: input,
     expected_output: output,
   }));
 
   const submitResult = await subitBatch(submissions);
  }
}
    catch(err){

    }
