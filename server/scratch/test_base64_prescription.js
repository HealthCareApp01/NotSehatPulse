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
      name: "rx_image.png",
      type: "image/png",
      content: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
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
    console.log("Final State extractedMedicines:", JSON.stringify(finalState.extractedMedicines, null, 2));
    console.log("Final State messages length:", finalState.messages.length);
    console.log("Last message content:", finalState.messages[finalState.messages.length - 1].content);

  } catch (error) {
    console.error("❌ Error during test run:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
