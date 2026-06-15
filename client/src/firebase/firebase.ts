// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { HarmBlockThreshold, HarmCategory, getAI, getGenerativeModel, GoogleAIBackend, Schema } from "firebase/ai";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase, set, get, ref as dbRef, update, onValue, off } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];
// const generationConfig = {
//   temperature: 0.3,
//   topK: 40,
//   topP: 0.95,
//   maxOutputTokens: 1024
// };
const jsonSchema = Schema.object({
  properties: {
    title: Schema.string(),
    summary: Schema.string(),
    objectives: Schema.array({ items: Schema.string() }),
    quizzes: Schema.array({
      items: Schema.object({
        properties: {
          id: Schema.string(),
          type: Schema.string(),
          question: Schema.string(),
          options: Schema.array({ items: Schema.string() }),
          answer: Schema.string(),
          numAnswer: Schema.number(),
          leftItems: Schema.array({ items: Schema.string() }),
          rightItems: Schema.array({ items: Schema.string() }),
          matches: Schema.array({ items: Schema.number() }),
          targetWord: Schema.string(),
          syllableParts: Schema.array({ items: Schema.string() }),
          categories: Schema.array({ items: Schema.string() }),
          categoryItems: Schema.array({ items: Schema.array({ items: Schema.string() }) }),
          isCopied: Schema.boolean(),
        },
        required: ["type"],
      }),
    }),
    percentage: Schema.number(),
    phrases: Schema.array({ items: Schema.string() }),
  },
});
const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  safetySettings,
  systemInstruction:
    "Ikaw ay isang Filipino educational assistant na dalubhasa sa paglikha ng mga pamagat ng aralin, buod, layunin, pagsusulit, at parirala para sa mga mag-aaral. " +
    "Kapag binigyan ng lesson PDF, bumuo ng malinaw at angkop na pamagat ng aralin (title) sa Filipino, isang buod (summary) na madaling maintindihan ng mga mag-aaral, at 2-4 layunin ng aralin (objectives) na naaangkop sa antas ng mag-aaral. " +
    "Ibalik ang sagot bilang JSON object na may 'title' (string), 'summary' (string), at 'objectives' (array ng mga pangungusap). " +
    "Kapag gumagawa ng quizzes, lumikha ng mga tanong na sumusubok sa pag-unawa, bokabularyo, at kasanayan sa wika. Sundin ang mga patakaran sa punctuation at difficulty level. " +
    "Kapag gumagawa ng phrases, bumuo ng mga orihinal na parirala para sa pagsasanay sa pagbigkas, na may wastong bantas ayon sa difficulty: " +
    "Easy mode: Gumamit ng basic punctuation (. , ?). " +
    "Normal mode: Magdagdag ng exclamation marks (!), hyphens (-), at apostrophes ('). " +
    "Hard mode: Isama ang advanced punctuation (:;\"\"()). " +
    "Lahat ng sagot ay dapat orihinal, edukasyonal, angkop sa edad, at nakasulat sa Filipino. " +
    "Iwasan ang direktang pagkopya mula sa PDF—gumawa ng bagong nilalaman na may kaugnayan sa tema ng aralin. " +
    "Ibalik ang sagot bilang JSON object na tumutugma sa hinihiling ng prompt: maaaring may 'title', 'summary', 'objectives', 'quizzes', o 'phrases'.",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: jsonSchema
  },
});
const analytics = getAnalytics(app);
const auth = getAuth(app);
auth.useDeviceLanguage();
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);
const functions = getFunctions(app, "us-central1");

// Connect to emulators in development mode
if (import.meta.env.MODE === "development") {
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

export {
  app,
  model,
  analytics,
  auth,
  db,
  storage,
  database,
  functions,
  set,
  get,
  dbRef,
  onValue,
  off,
  update,
  storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
};
