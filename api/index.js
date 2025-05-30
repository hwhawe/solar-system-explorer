import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; 


const projectRoot = path.resolve(fileURLToPath(import.meta.url), '../../'); 
dotenv.config({ path: path.join(projectRoot, '.env') });


export default async function handler(req, res) {
  // Konfigurasi CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }


  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }


  let requestBody;
  try {
      if (req.body) { 
          requestBody = req.body;
      } else { 
          requestBody = await new Promise((resolve, reject) => {
              let body = '';
              req.on('data', chunk => {
                  body += chunk.toString();
              });
              req.on('end', () => {
                  try {
                      resolve(JSON.parse(body));
                  } catch (e) {
                      reject(new Error('Failed to parse request body as JSON.'));
                  }
              });
              req.on('error', reject);
          });
      }
  } catch (e) {
      console.error("Error parsing request body:", e);
      return res.status(400).json({ error: "Invalid request body." });
  }
  const { prompt } = requestBody;


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

    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
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

 
    const responseBody = await replicateResponse.text();
    console.log(`Replicate API response status: ${replicateResponse.status}`);
    console.log("Replicate API raw response body:", responseBody);

    if (!replicateResponse.ok) {
      let errorJson = {};
      try {
        errorJson = JSON.parse(responseBody);
      } catch (e) {
      
      }
      console.error(`Replicate API returned non-OK status: ${replicateResponse.status}, Details: ${responseBody}`);
      return res.status(replicateResponse.status).json({
        error: `Replicate API error: ${replicateResponse.status}`,
        details: errorJson.detail || errorJson.error || responseBody,
      });
    }

    let data;
    try {
      data = JSON.parse(responseBody);
    } catch (parseError) {
      console.error("Failed to parse Replicate API response as JSON:", parseError);
      console.error("Non-parseable response body was:", responseBody);
      return res.status(500).json({ error: 'Failed to parse AI response as JSON.', details: responseBody });
    }

    const predictionId = data.id;
    if (!predictionId) {
      console.error("Replicate API did not return a prediction ID:", data);
      return res.status(500).json({ error: "Replicate API did not return a prediction ID." });
    }

    let predictionResult = data;
    let pollingAttempts = 0;
    const maxPollingAttempts = 60; 

    while (predictionResult.status !== 'succeeded' && predictionResult.status !== 'failed' && pollingAttempts < maxPollingAttempts) {
      pollingAttempts++;
      await new Promise(resolve => setTimeout(resolve, 1000)); 
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
        return res.json({ output: aiOutput });
      } else {
        console.error("Prediction succeeded but 'output' field is missing:", predictionResult);
        return res.status(500).json({ error: "Replicate API response missing valid 'output' field after success.", details: predictionResult });
      }
    } else if (predictionResult.status === 'failed') {
      console.error("AI prediction failed:", predictionResult);
      return res.status(500).json({ error: "AI prediction failed.", details: predictionResult.error || "Unknown error" });
    } else {
      console.error("AI prediction timed out or unknown status:", predictionResult);
      return res.status(504).json({ error: "AI prediction timed out.", details: predictionResult });
    }

  } catch (error) {
    console.error('Error in /predict endpoint (caught by try-catch):', error);
    return res.status(500).json({ error: 'Failed to communicate with Replicate AI API.', details: error.message });
  }
}