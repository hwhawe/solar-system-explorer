// solar-system-explorer/api/index.js

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Konfigurasi dotenv untuk mencari .env di root proyek
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env') });

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.post('/predict', async (req, res) => {
    const { prompt } = req.body;
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    console.log("Received prompt from frontend:", prompt);

    if (!prompt) {
        console.error('Error: Prompt is missing in request body.');
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!REPLICATE_API_TOKEN) {
        console.error('Error: REPLICATE_API_TOKEN is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error: AI API token is missing.' });
    }

    const system_prompt = "You are an expert in astronomy, planetary science, and the solar system. You can answer questions eloquently and provide factual information about planets, stars, and celestial phenomena.";

    try {
        console.log("Attempting to call Replicate API to create prediction...");
        const createPredictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            },
            body: JSON.stringify({
                version: "ibm-granite/granite-3.3-8b-instruct",
                input: {
                    prompt: prompt,
                    system_prompt: system_prompt
                },
            }),
        });

        const createPredictionData = await createPredictionResponse.json();
        console.log("Replicate API create prediction response:", createPredictionData);

        if (!createPredictionResponse.ok) {
            console.error(`Replicate API failed to create prediction: Status ${createPredictionResponse.status}, Details: ${JSON.stringify(createPredictionData)}`);
            return res.status(createPredictionResponse.status).json({
                error: `Replicate API error: ${createPredictionResponse.status}`,
                details: createPredictionData,
            });
        }

        const predictionId = createPredictionData.id;
        if (!predictionId) {
            console.error("Replicate API did not return a prediction ID:", createPredictionData);
            return res.status(500).json({ error: "Replicate API did not return a prediction ID." });
        }

        // --- POLLING FOR PREDICTION RESULT ---
        let predictionResult = createPredictionData; // Mulai dengan respons awal
        let pollingAttempts = 0;
        const maxPollingAttempts = 60; // Maksimal 60 detik polling (1 detik per percobaan)

        while (predictionResult.status !== 'succeeded' && predictionResult.status !== 'failed' && pollingAttempts < maxPollingAttempts) {
            pollingAttempts++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tunggu 1 detik
            const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                headers: {
                    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                },
            });
            predictionResult = await pollResponse.json();
            console.log(`Polling attempt ${pollingAttempts}: Prediction status is ${predictionResult.status}`);
        }

        if (predictionResult.status === 'succeeded') {
            if (predictionResult.output) {
                const aiOutput = Array.isArray(predictionResult.output) ? predictionResult.output.join('') : predictionResult.output;
                console.log("Final AI Output (Success):", aiOutput);
                res.json({ output: aiOutput });
            } else {
                console.error("Prediction succeeded but 'output' field is missing:", predictionResult);
                res.status(500).json({ error: "Replicate API response missing valid 'output' field after success.", details: predictionResult });
            }
        } else if (predictionResult.status === 'failed') {
            console.error("Prediction failed:", predictionResult);
            res.status(500).json({ error: "AI prediction failed.", details: predictionResult.error || "Unknown error" });
        } else {
            console.error("Prediction timed out or unknown status:", predictionResult);
            res.status(504).json({ error: "AI prediction timed out.", details: predictionResult });
        }

    } catch (error) {
        console.error('Error in /predict endpoint:', error);
        res.status(500).json({ error: 'Failed to communicate with Replicate AI API.', details: error.message });
    }
});

app.get('/', (req, res) => {
    res.status(200).send('API is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;