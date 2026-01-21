import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAOLnuJ736V3NU1VA1UId9K_0gg0JG1o54",
  authDomain: "caregiver-cba18.firebaseapp.com",
  projectId: "caregiver-cba18",
  storageBucket: "caregiver-cba18.firebasestorage.app",
  messagingSenderId: "929615381650",
  appId: "1:929615381650:web:2b8dd8de8bbf1689be124b",
  measurementId: "G-CJZ0BQKF3Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
