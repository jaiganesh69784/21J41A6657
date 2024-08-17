const express = require('express');
const axios = require('axios');

const app = express();
const port = 9875;

const windowSize = 10;
let numberWindow = [];

const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIzODc5MzY4LCJpYXQiOjE3MjM4NzkwNjgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjgwOTI4NDdmLTMxMWYtNDVlMi04NjkxLTY3M2JiMTBkNGVhYyIsInN1YiI6InN2amFpZ2FuZXNocmVkZHkyMDAzQGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6ImdvTWFydCIsImNsaWVudElEIjoiODA5Mjg0N2YtMzExZi00NWUyLTg2OTEtNjczYmIxMGQ0ZWFjIiwiY2xpZW50U2VjcmV0IjoiZHRmQmpFQk9vQ3dmaFR4SyIsIm93bmVyTmFtZSI6IlMgViBKQUkgR0FORVNIIFJFRERZIiwib3duZXJFbWFpbCI6InN2amFpZ2FuZXNocmVkZHkyMDAzQGdtYWlsLmNvbSIsInJvbGxObyI6IjIxSjQxQTY2NTcifQ.rcOY2_eldIoIAOCe3AkjtqiLCvSZ9xuuIg2SeofF9hY';

async function fetchNumbers(type) {
    let url;
    switch (type) {
        case 'p':
            url = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            url = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            url = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            url = 'http://20.244.56.144/test/random';
            break;
        default:
            throw new Error('Invalid type');
    }

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': Bearer ${BEARER_TOKEN} },
            timeout: 500
        });
        if (!response.data || !Array.isArray(response.data.numbers)) {
            throw new Error('Invalid response format');
        }
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return [];
    }
}

function storeNumbers(newNumbers) {
    const uniqueNumbers = newNumbers.filter(num => !numberWindow.includes(num));
    numberWindow = [...numberWindow, ...uniqueNumbers];
    if (numberWindow.length > windowSize) {
        numberWindow = numberWindow.slice(numberWindow.length - windowSize);
    }
}

function calculateAverage() {
    if (numberWindow.length === 0) return 0;
    const sum = numberWindow.reduce((acc, num) => acc + num, 0);
    return (sum / numberWindow.length).toFixed(2);
}

app.get('/numbers/:type', async (req, res) => {
    const type = req.params.type;

    if (!['p', 'f', 'e', 'r'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type parameter' });
    }

    try {
        const previousState = [...numberWindow];
        const newNumbers = await fetchNumbers(type);
        storeNumbers(newNumbers);

        const response = {
            windowPrevState: previousState,
            windowCurrState: numberWindow,
            numbers: newNumbers,
            avg: calculateAverage(),
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process request' });
    }
});

app.listen(port, () => {
    console.log(Server running on http://localhost:${port});
});
