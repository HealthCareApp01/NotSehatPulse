import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// IMPORTANT: Replace this config with YOUR config from the Firebase Console!
// 1. Go to Firebase Console -> Project Settings (gear icon)
// 2. Scroll down to "Your apps"
// 3. Select the Web icon (</>) and register your app
// 4. Copy the firebaseConfig object here:
const firebaseConfig = {
  apiKey: "AIzaSyB27aYAIHtAcLkJesBRSR6QEm4IiGJjg4k",
  authDomain: "auth-a0793.firebaseapp.com",
  projectId: "auth-a0793",
  storageBucket: "auth-a0793.firebasestorage.app",
  messagingSenderId: "39712931457",
  appId: "1:39712931457:web:8bc33671e36b4dffcd1780"
  // measurementId: "G-MDB1C68L0W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
