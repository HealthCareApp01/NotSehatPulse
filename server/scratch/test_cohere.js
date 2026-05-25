import { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';

dotenv.config(); // defaults to .env in cwd (which is server)

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || 'YOUR_MOCK_KEY',
});

async function run() {
  console.log("Using API key:", process.env.COHERE_API_KEY ? "Found: " + process.env.COHERE_API_KEY.substring(0, 15) + "..." : "Missing");
  try {
    const response = await cohere.chat({
      message: "Hello, list 3 common medicines as JSON.",
      preamble: "You are a JSON-only extractor. Respond ONLY with a valid JSON array."
    });
    console.log("Response text:", response.text);
  } catch (error) {
    console.error("Error calling Cohere:", error);
  }
}

run();
