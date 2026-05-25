import Medicine from '../models/Medicine.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const count = await Medicine.countDocuments({});
    console.log("Total Medicines in DB:", count);
    if (count > 0) {
      const medicines = await Medicine.find({}).limit(5);
      console.log("Sample medicines in DB:", JSON.stringify(medicines, null, 2));
    }
  } catch (error) {
    console.error("DB error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
