import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAWoDqDezHJWhJovfHGXcXU2wb2qdCtMD4",
  authDomain: "serene-strata-2pp0d.firebaseapp.com",
  projectId: "serene-strata-2pp0d",
  storageBucket: "serene-strata-2pp0d.firebasestorage.app",
  messagingSenderId: "1062217646305",
  appId: "1:1062217646305:web:b9177be47ebc8337eb37a0"
};

const databaseId = "ai-studio-travelbee-52bfb038-8248-4ce7-8379-f9a626ef37e5";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
