import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAdQ6KtrIHleAHiqjAfxFKCXPMT-oUoCjE",
  authDomain: "farmasocial-266de.firebaseapp.com",
  projectId: "farmasocial-266de",
  storageBucket: "farmasocial-266de.firebasestorage.app",
  messagingSenderId: "172116157552",
  appId: "1:172116157552:web:e6a657053fdb2f1f1040b5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
