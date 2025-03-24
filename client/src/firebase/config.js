import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "final-exam-softuni-c972c.firebaseapp.com",
  projectId: "final-exam-softuni-c972c",
  storageBucket: "final-exam-softuni-c972c.firebasestorage.app",
  messagingSenderId: "740362102127",
  appId: "1:740362102127:web:27f7958a8580e02f7db49a",
  measurementId: "G-NEYHNM93JL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
export default app; 