const getLanguageById = require("../utils/ProblemUtility");

const createProblem = async (req,res)=>{
    const {title,description, difficulty, tags, 
        visibletestCases, hiddenTestCases,startCode,
        referenceSolution,problemCreator
    } = req.body;
}

try{
    for(const {language, completeCode} of referenceSolution){

   const language_id = getLanguageById(language);
    }
}
    catch(err){

    }
