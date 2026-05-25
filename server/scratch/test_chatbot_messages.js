import ChatbotMessage from '../models/ChatbotMessage.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const count = await ChatbotMessage.countDocuments({});
    console.log("Total Chatbot Messages in DB:", count);
    if (count > 0) {
      const messages = await ChatbotMessage.find({}).limit(10);
      console.log("Sample messages in DB:", JSON.stringify(messages, null, 2));
    }
  } catch (error) {
    console.error("DB error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
