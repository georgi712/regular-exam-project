import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
// Replace these values with your actual Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyCcP4_6VGVDrMtos9WThcYNsuhoz2RqqIs",
  authDomain: "final-exam-softuni.firebaseapp.com",
  projectId: "final-exam-softuni",
  storageBucket: "final-exam-softuni.firebasestorage.app",
  messagingSenderId: "423244814966",
  appId: "1:423244814966:web:bac7ee20e06ebfd8b0dd57",
  measurementId: "G-QE27JVW24L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export default app; 