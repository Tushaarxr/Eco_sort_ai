// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';


const firebaseConfig = {
  apiKey: "AIzaSyDqcMSjzlkCXz8nJwJANZ_gfoow290dO1c",
  authDomain: "ecosortai-e4d10.firebaseapp.com",
  projectId: "ecosortai-e4d10",
  storageBucket: "ecosortai-e4d10.firebasestorage.app",
  messagingSenderId: "905908465133",
  appId: "1:905908465133:web:106abb68ae84d69147cbe4",
  measurementId: "G-V1XL5ZCSRG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
