import chatbotAgent from '../utils/chatbotAgent.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CohereClient } from 'cohere-ai';

dotenv.config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || 'YOUR_MOCK_KEY',
});

async function run() {
  const file = {
    name: "prescription.txt",
    type: "text/plain",
    content: "Please take 2 tablets of Amoxicillin 500mg daily for 5 days. Also take Paracetamol 650mg if you have a fever (max 3 tablets daily)."
  };

  let extractionPrompt = `
You are a precise medical data extraction system. Extract all prescription medicines listed in this document or text.
File Name: ${file.name}
Prescription content:
---
${file.content || "Prescription text (Simulated Paracetamol/Amoxicillin)"}
---

Extract the medicines and return them ONLY as a valid JSON array of objects.
Do not write any preamble, explanation, or notes outside the JSON array.
Each object in the array MUST have:
1. "name": The exact name of the medicine (e.g., "Paracetamol", "Amoxicillin")
2. "dosage": Dosage instruction (e.g., "500mg, twice a day")
3. "quantity": Total quantity or tablets to be ordered (e.g., 10, 20)

Format:
[
  { "name": "Medicine Name", "dosage": "Dosage", "quantity": 10 }
]`;

  try {
    console.log("Calling Cohere with extractionPrompt...");
    const response = await cohere.chat({
      message: extractionPrompt,
      preamble: "You are a JSON-only extractor. Respond ONLY with a valid JSON array."
    });
    console.log("Cohere raw response:", response.text);

    let rawText = response.text.trim();
    const startIdx = rawText.indexOf('[');
    const endIdx = rawText.lastIndexOf(']');
    
    let parsedMeds = [];
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = rawText.substring(startIdx, endIdx + 1);
      try {
        parsedMeds = JSON.parse(jsonStr);
        console.log("Parsed Medicines:", parsedMeds);
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    } else {
      console.log("No JSON array found in response!");
    }

  } catch (error) {
    console.error("Cohere error:", error);
  }
}

run();
