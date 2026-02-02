import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "navai-151f5",
  appId: "1:47292512558:web:3be70819759764e7c322bf",
  storageBucket: "navai-151f5.firebasestorage.app",
  apiKey: "AIzaSyAqmJbqwTSND0ElBoT-y7Qea1lg0Adcbio",
  authDomain: "navai-151f5.firebaseapp.com",
  messagingSenderId: "47292512558",
  measurementId: "G-MJQ47SVWET",
};

// Initialize Firebase for SSR compatibility
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
