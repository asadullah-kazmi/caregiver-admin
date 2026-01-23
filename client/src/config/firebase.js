import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig =  {
  apiKey: "AIzaSyBGa8wHn9ytYwdlpEinqP4Z5pJYoMi8Qu0",
  authDomain: "je-dag-in-beeld.firebaseapp.com",
  projectId: "je-dag-in-beeld",
  storageBucket: "je-dag-in-beeld.firebasestorage.app",
  messagingSenderId: "47836047261",
  appId: "1:47836047261:web:cb03650275f023b1aaf174",
  measurementId: "G-STG8LLLMSN"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
