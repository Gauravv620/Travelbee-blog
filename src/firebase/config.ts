import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB9RlR05PGwLi9FVgll03L92kvjztsD1_o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "travel-bee-af01e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "travel-bee-af01e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "travel-bee-af01e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "338606142701",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:338606142701:web:af5f4e51669143c34e08e4"
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
