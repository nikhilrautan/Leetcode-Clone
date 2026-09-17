const axios = require('axios');

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63,
    }
    return language[lang.toLowerCase()]; // fixed: toLowerCase (capital L)
}

const submitBatch = async (submissions) => {

    const options = {
        method: 'POST',
        url: 'https://ce.judge0.com/submissions/batch',
        params: {
            base64_encoded: 'true'
        },
        headers: {
            'Content-Type': 'application/json'
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

    return await fetchData(); // array of tokens

    // 2 step process:
    // 1. submit code -> judge0 gives us tokens back
    // 2. use those tokens to GET the actual result

    // status_id:
    // 1: Queue
    // 2: Process
    // 3: Accepted
}

const submitToken = async (resultToken) => {

    const options = {
        method: 'GET',
        url: 'https://ce.judge0.com/submissions/batch',
        params: {
            tokens: resultToken.join(','), // resultToken is an array -> comma-separated string
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'Content-Type': 'application/json'
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

    return await fetchData(); // returns actual results (stdout, status, etc.)
}

module.exports = { getLanguageById, submitBatch, submitToken };