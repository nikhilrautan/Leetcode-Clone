const axios = require('axios');

const getLanguageById = (lang)=>{
    const language ={
        "c++":54,
        "java":62,
        "javascript":63,

    }
    return language[lang.tolowerCase()];
}

const submitBatch = async (submissions)=>{


    const options = {
  method: 'POST',
  url: 'https://ce.judge0.com/submissions/batch',
  params: {
    base64_encoded: 'true'
  },
  headers: {
    'Content-Type': 'application/json'
    // no x-rapidapi-key or x-rapidapi-host needed — ce.judge0.com is open
  },
  data: {
    submissions
  }
};

async function fetchData() {
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

return await fetchData(); // array k format m token laakr dega

// 2 step m hota hai , 
//phle hum jo result ko submit maarte hai to judge0 hume token laake de deta hai aur fir vhi 
// tokens se get request maarenge aur actual result fetch kr lenge..


// jitne Batches honge utne token return krega
// status_id:
//1: Queue
//2: Process
//3: Accepted
}

module.exports = {getLanguageById, submitBatch};