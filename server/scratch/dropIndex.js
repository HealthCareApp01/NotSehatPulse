import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function dropPhoneIndex() {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const hasUsers = collections.some(c => c.name === 'users');

    if (!hasUsers) {
      console.log('ℹ️ Users collection does not exist yet.');
    } else {
      const indexes = await db.collection('users').indexes();
      const hasPhoneIndex = indexes.some(idx => idx.name === 'phone_1');

      if (hasPhoneIndex) {
        await db.collection('users').dropIndex('phone_1');
        console.log('✅ Dropped unique index: phone_1');
      } else {
        console.log('ℹ️ Index "phone_1" not found. It might have been dropped already.');
      }
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping index:', error);
    process.exit(1);
  }
}

dropPhoneIndex();
