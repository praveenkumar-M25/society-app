// Firebase initialization — central place for all Firebase services.
// Fill in your own project's config below (Firebase Console > Project Settings).
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCXIf23kwiqmBmnn0fA7a1C4FQzaL4CJ6Q",
  authDomain: "society-management-173e9.firebaseapp.com",
  projectId: "society-management-173e9",
  storageBucket: "society-management-173e9.firebasestorage.app",
  messagingSenderId: "1062309327615",
  appId: "1:1062309327615:web:a58dd16bd420739bb052ca",
  measurementId: "G-T04GBWEN5E"
};
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app  
