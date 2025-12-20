// Firebase configuration
// Replace these values with your own Firebase project config
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Get this from Firebase Console > Project Settings > General > Your apps
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.projectId && 
         firebaseConfig.apiKey !== "YOUR_API_KEY";
};

if (!isFirebaseConfigured()) {
  console.warn(
    '⚠️ Firebase is not configured!\n\n' +
    'To set up Firebase:\n' +
    '1. Create a project at https://console.firebase.google.com\n' +
    '2. Create a .env file in the project root with:\n' +
    '   VITE_FIREBASE_API_KEY=your_api_key\n' +
    '   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com\n' +
    '   VITE_FIREBASE_PROJECT_ID=your_project_id\n' +
    '   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com\n' +
    '   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id\n' +
    '   VITE_FIREBASE_APP_ID=your_app_id\n'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable offline persistence (optional but recommended for family hub)
if (isFirebaseConfigured()) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence unavailable: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence unavailable: Browser not supported');
    }
  });
}

export const firebaseConfigured = isFirebaseConfigured();
export default app;
