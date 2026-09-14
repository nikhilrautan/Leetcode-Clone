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

return await fetchData();

}

module.exports = {getLanguageById, submitBatch};