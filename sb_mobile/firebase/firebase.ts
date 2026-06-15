// @ts-ignore
import { getApp } from '@react-native-firebase/app';
import { HarmBlockThreshold, HarmCategory, getAI, getGenerativeModel, GoogleAIBackend, Schema } from "@react-native-firebase/ai";
import { getAuth, FirebaseAuthTypes, GoogleAuthProvider } from '@react-native-firebase/auth';
import { 
  getFirestore, 
  FirebaseFirestoreTypes, 
  getDoc,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
} from '@react-native-firebase/firestore';
import { 
  getDatabase, 
  FirebaseDatabaseTypes,
  ref as dbRef,
  get,
  set,
  onValue, 
  off, 
  runTransaction, 
  update,
} from "@react-native-firebase/database";
import { 
  getStorage, 
  FirebaseStorageTypes, 
  ref as storageRef, 
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "@react-native-firebase/storage";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from '@react-native-firebase/functions';
import { Platform } from 'react-native';

// Initialize Firebase
const app = getApp();
const auth = getAuth();
const firestore = getFirestore();
const storage = getStorage();
const database = getDatabase();
const functions = getFunctions();
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
        },
        required: ["type"],
      }),
    }),
    phrases: Schema.array({ items: Schema.string() }),
    recommendations: Schema.array({
      items: Schema.object({
        properties: {
          id: Schema.string(),
          title: Schema.string(),
          reason: Schema.string(),
        },
        required: ["id", "title", "reason"],
      }),
    }),
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
    "Kapag binigyan ng lesson data at analytics, bumuo ng recommendations array na may id, title, at reason para sa bawat aralin na pinaka-akmang irekomenda batay sa datos ng mag-aaral. " +
    "Ibalik ang sagot bilang JSON object na may 'recommendations' (array ng objects na may id, title, reason). " +
    "Lahat ng sagot ay dapat orihinal, edukasyonal, angkop sa edad, at nakasulat sa Filipino. " +
    "Iwasan ang direktang pagkopya mula sa PDF—gumawa ng bagong nilalaman na may kaugnayan sa tema ng aralin. " +
    "Ibalik ang sagot bilang JSON object na tumutugma sa hinihiling ng prompt: maaaring may 'title', 'summary', 'objectives', 'quizzes', o 'phrases'.",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: jsonSchema
  },
});

let host = "";

if (__DEV__) {
  if (Platform.OS === "android") {
    host = "10.0.2.2";
  }
  if (process.env.EXPO_PUBLIC_EMULATOR_HOST) {
    host = process.env.EXPO_PUBLIC_EMULATOR_HOST;
  }
  // Firestore Emulator
  // connectFirestoreEmulator(db, host, 8080);

  // Authentication Emulator
  // connectAuthEmulator(auth, `http://${host}:9099`);

  // Realtime Database Emulator
  // connectDatabaseEmulator(database, host, 9000);

  // Storage Emulator
  // connectStorageEmulator(storage, host, 9199);

  // Functions Emulator
  connectFunctionsEmulator(functions, host, 5001);

  console.log("Connected to Firebase emulators (React Native)");
}

export {
  app,
  model,
  auth,
  firestore,
  storage,
  database,
  functions,
  GoogleAuthProvider,
  FirebaseAuthTypes,
  FirebaseFirestoreTypes,
  FirebaseDatabaseTypes,
  FirebaseStorageTypes,
  getDoc,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  dbRef,
  get,
  set,
  onValue,
  off,
  runTransaction,
  update,
  storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  httpsCallable,
};