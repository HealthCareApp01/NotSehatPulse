const { CohereClient } = require('cohere-ai');
require('dotenv').config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || 'YOUR_MOCK_KEY',
});

async function testSymptomChecker() {
  console.log('--- Testing Cohere LLM Symptom Checker ---');
  
  if (!process.env.COHERE_API_KEY) {
    console.warn('⚠️ No COHERE_API_KEY found in .env. Using mock response.');
    return;
  }

  try {
    const response = await cohere.chat({
      message: "I have a severe headache and sensitivity to light. What specialty should I consult?",
      preamble: "You are a medical assistant. Categorize the user's symptoms into a specialty and explain why. Always add a disclaimer."
    });

    console.log('AI Response:', response.text);
  } catch (error) {
    console.error('❌ Error during LLM test:', error.message);
  }
}

testSymptomChecker();
