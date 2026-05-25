import chatbotAgent from '../utils/chatbotAgent.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const file = {
      name: "prescription.txt",
      type: "text/plain",
      content: "Please take 2 tablets of Amoxicillin 500mg daily for 5 days. Also take Paracetamol 650mg if you have a fever (max 3 tablets daily)."
    };

    const initialState = {
      messages: [{ role: 'user', content: 'Extract medicines' }],
      fileData: file,
      extractedMedicines: [],
      summary: "",
      isHealthTopic: true,
      retryFeedback: ""
    };

    console.log("Invoking chatbotAgent...");
    const finalState = await chatbotAgent.invoke(initialState);
    console.log("Final State matches:", JSON.stringify(finalState.extractedMedicines, null, 2));

  } catch (error) {
    console.error("Error during extraction run:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
