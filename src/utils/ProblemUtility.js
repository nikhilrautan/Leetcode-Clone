const axios = require('axios');

// Maps language name -> Judge0 language ID
const getLanguageById = (lang) => {
    const language = {
        "c": 50,
        "c++": 54,
        "java": 62,
        "javascript": 63,
        "python": 71,
        "python3": 71,
        "c#": 51,
        "go": 60,
        "typescript": 74,
        "ruby": 72,
        "php": 68,
        "rust": 73,
        "kotlin": 78,
        "swift": 83,
    };
    const id = language[lang.toLowerCase()];
    if (!id) throw new Error(`Unsupported language: ${lang}`);
    return id;
};

// Simple delay helper for polling
const waiting = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Step 1: Submit a batch of code submissions -> returns array of tokens
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

    try {
        const response = await axios.request(options);
        return response.data; // array of { token }
    } catch (error) {
        console.error('submitBatch error:', error?.response?.data || error.message);
        throw error;
    }

    // status_id reference:
    // 1: In Queue
    // 2: Processing
    // 3: Accepted
    // 4+: Wrong Answer / Compilation Error / Runtime Error / TLE etc.
};

// Step 2: Poll using tokens until all submissions finish -> returns final results
const submitToken = async (resultToken, maxRetries = 15) => {
    const options = {
        method: 'GET',
        url: 'https://ce.judge0.com/submissions/batch',
        params: {
            tokens: resultToken.join(','),
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error('submitToken error:', error?.response?.data || error.message);
            throw error;
        }
    };

    let attempts = 0;

    while (true) {
        const result = await fetchData();

        const isResultObtained = result.submissions.every((r) => r.status_id > 2);

        if (isResultObtained) {
            return result.submissions;
        }

        attempts++;
        if (attempts >= maxRetries) {
            throw new Error('Judge0 polling timed out — submission took too long to process.');
        }

        await waiting(1000);
    }
};

module.exports = { getLanguageById, submitBatch, submitToken };