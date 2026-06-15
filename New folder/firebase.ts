// Import the functions you need from the SDKs you need
import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase} from 'firebase/database';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// import { getAuth, connectAuthEmulator } from 'firebase/auth';
// import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
// import { getStorage, connectStorageEmulator } from 'firebase/storage';
// import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const { 
  FIREBASE_API_KEY, 
  FIREBASE_AUTH_DOMAIN, 
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = Constants.expoConfig?.extra || {};

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);
const functions = getFunctions(app);

// Connect to emulators in development mode
if (__DEV__) {
  // Firestore Emulator
  // connectFirestoreEmulator(db, "127.0.0.1", 8080);

  // // Authentication Emulator
  // connectAuthEmulator(auth, "http://127.0.0.1:9099");

  // // Realtime Database Emulator
  // connectDatabaseEmulator(database, "127.0.0.1", 9000);

  // // Storage Emulator
  // connectStorageEmulator(storage, "127.0.0.1", 9199);

  // Functions Emulator
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  
  console.log("Connected to Firebase emulators");
}

export { app, auth, db, storage, database, functions };