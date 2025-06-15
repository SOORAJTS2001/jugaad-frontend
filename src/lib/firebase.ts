
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration - you'll need to replace these with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyA7lczSx2d-Fodb-fjAW9pv86JrDzE_j2Y",
  authDomain: "draco-b8a74.firebaseapp.com",
  projectId: "draco-b8a74",
  storageBucket: "draco-b8a74.firebasestorage.app",
  messagingSenderId: "699397004908",
  appId: "1:699397004908:web:65ceb943770134a76ac249",
  measurementId: "G-Z7QN2HTKER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
