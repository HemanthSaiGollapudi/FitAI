import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Check if credentials are set and not placeholder values
export const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
  firebaseConfig.apiKey.trim() !== "";

let firebaseAuth: any = null;
let googleAuthProvider: any = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseAuth = getAuth(app);
    googleAuthProvider = new GoogleAuthProvider();
    // Force account picker to show up on Google OAuth logins
    googleAuthProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export const auth = firebaseAuth;
export const googleProvider = googleAuthProvider;
