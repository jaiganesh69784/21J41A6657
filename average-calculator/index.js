const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

let windowSize = 10; // Configurable window size
let numberWindow = []; // Array to store the numbers

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
            return [];
    }

    try {
        const response = await axios.get(url, { timeout: 500 });
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return [];
    }
}

function storeNumbers(newNumbers) {
    const uniqueNumbers = newNumbers.filter((num) => !numberWindow.includes(num));
    numberWindow = [...numberWindow, ...uniqueNumbers];
    if (numberWindow.length > windowSize) {
        numberWindow = numberWindow.slice(numberWindow.length - windowSize);
    }
}

// Function to calculate the average of the numbers in the window
function calculateAverage() {
    if (numberWindow.length === 0) return 0;
    const sum = numberWindow.reduce((acc, num) => acc + num, 0);
    return (sum / numberWindow.length).toFixed(2);
}

// API endpoint to handle requests for fetching and storing numbers
app.get('/numbers/:type', async(req, res) => {
    const type = req.params.type;

    // Validate the type parameter
    if (!['p', 'f', 'e', 'r'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type parameter' });
    }

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
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});