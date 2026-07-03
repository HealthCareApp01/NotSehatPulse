import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from current directory
dotenv.config();

// Also try loading from project root directory (two levels up from server/utils)
const rootEnvPath = join(__dirname, '..', '..', '.env');
if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

// Construct path to the service account key
const serviceAccountPath = join(__dirname, '..', 'firebaseServiceAccountKey.json');

let firebaseAdminInstance;

// 1. Try initializing via Environment Variables first (recommended for production/GitHub security)
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
    firebaseAdminInstance = admin;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin with environment variables:", error.message);
  }
} 
// 2. Fall back to local service account JSON file if it exists (ignored by git)
else if (existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseAdminInstance = admin;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin with service account key JSON:", error.message);
  }
}

if (!firebaseAdminInstance) {
  console.warn("WARNING: Firebase service account key not found at", serviceAccountPath);
  console.warn("Google Sign-In will not be functional. Starting server in development fallback mode.");
  
  // Create a minimal mock of firebase-admin
  firebaseAdminInstance = {
    auth: () => ({
      verifyIdToken: async (idToken) => {
        console.warn("Mock verifyIdToken called with token:", idToken);
        if (idToken === 'mock_google_token') {
          return {
            email: 'mockuser@example.com',
            name: 'Mock User',
            picture: ''
          };
        }
        throw new Error("Firebase Admin not configured. Cannot verify ID token.");
      }
    })
  };
}

export default firebaseAdminInstance;
