// functions/src/index.ts
// import pdfParse from "pdf-parse";
import {defineSecret} from "firebase-functions/params";
import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {FieldValue} from "firebase-admin/firestore";
import {getDatabase} from "firebase-admin/database";
// import {onObjectFinalized} from "firebase-functions/v2/storage";
// import {logger} from "firebase-functions";
import * as admin from "firebase-admin";
import textToSpeech from "@google-cloud/text-to-speech";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {getDocument} from "pdfjs-dist/legacy/build/pdf.mjs";
import axios from "axios";
import {ElevenLabsClient} from "@elevenlabs/elevenlabs-js";
import * as dotenv from "dotenv";
import crypto from "crypto";
import tagalogDict from "./assets/dictionary/tagalog_dict_lines.json";

dotenv.config();

admin.initializeApp();
const realtimeDb = getDatabase();

const ELEVENLABS_API_KEY = defineSecret("ELEVENLABS_API_KEY");

export const generateElevenLabsSpeech = onCall({secrets: [ELEVENLABS_API_KEY]}, async (request: CallableRequest) => {
  const {text, speed = 1.0} = request.data;
  if (!text || typeof text !== "string" || text.length > 500) {
    throw new HttpsError("invalid-argument", "Text must be a non-empty string up to 500 characters.");
  }
  const elevenlabs = new ElevenLabsClient({apiKey: process.env.ELEVENLABS_API_KEY});
  const hash = crypto.createHash("sha256").update(`${text}_${speed}`).digest("hex");
  const filename = `elevenlabs-cache/${hash}.mp3`;
  const tempFilePath = path.join(os.tmpdir(), `elevenlabs-${Date.now()}.mp3`);
  const bucket = admin.storage().bucket();
  try {
    const [exists] = await bucket.file(filename).exists();
    if (exists) {
      const [url] = await bucket.file(filename).getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000,
      });
      return {url};
    }
    const audioStream = await elevenlabs.textToSpeech.convert(
      "RnW8EXHv9GqGMgyP0sXG",
      {
        text: text,
        modelId: "eleven_turbo_v2_5",
        outputFormat: "mp3_44100_128",
        voiceSettings: {
          stability: 1,
          similarityBoost: 0.75,
          style: 0.5,
          useSpeakerBoost: true,
          speed: speed,
        },
      }
    );
    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();
    try {
      let done = false;
      while (!done) {
        const {done: isDone, value} = await reader.read();
        done = isDone;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const audioBuffer = Buffer.concat(chunks);
    fs.writeFileSync(tempFilePath, audioBuffer);
    await bucket.upload(tempFilePath, {destination: filename});
    fs.unlinkSync(tempFilePath);
    const [url] = await bucket.file(filename).getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000,
    });
    return {url};
  } catch (error) {
    console.error("Error generating ElevenLabs speech:", error);
    throw new HttpsError("internal", "Error generating speech");
  } finally {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

const client = new textToSpeech.TextToSpeechClient();

export const setGenerateSpeech = onCall(async (request: CallableRequest) => {
  const {text, gradeLevel} = request.data;
  if (!text || typeof text !== "string" || text.length > 500) {
    throw new HttpsError("invalid-argument", "Text must be a non-empty string up to 200 characters.");
  }
  const speakingRate = 0.75;
  const filename = `tts-cache/${encodeURIComponent(text)}_${gradeLevel}_${speakingRate}.mp3`;
  const bucket = admin.storage().bucket();
  let tempFilePath;
  try {
    // Check if file already exists
    const [exists] = await bucket.file(filename).exists();
    if (exists) {
      const [url] = await bucket.file(filename).getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      return {url};
    }
    // Generate speech
    const [response] = await client.synthesizeSpeech({
      input: {text},
      voice: {languageCode: "fil-PH", name: "fil-PH-Standard-D", ssmlGender: "MALE"},
      audioConfig: {audioEncoding: "MP3", speakingRate},
    });
    tempFilePath = path.join(os.tmpdir(), `${Date.now()}.mp3`);
    fs.writeFileSync(tempFilePath, response.audioContent as Buffer);
    await bucket.upload(tempFilePath, {destination: filename});
    fs.unlinkSync(tempFilePath);
    const [url] = await bucket.file(filename).getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000,
    });
    return {url};
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new HttpsError("internal", "Failed to generate speech");
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

const tagalogWords = new Set((tagalogDict.data as { word: string }[]).map((w) => w.word));
const fixSmartSplitWords = (text: string) => {
  return text.replace(/\b([A-Za-z]+)\s+([A-Za-z]+)\b/g, (match, part1, part2) => { // Regex: match two words separated by a single space
    const lower1 = part1.toLowerCase();
    const lower2 = part2.toLowerCase();
    const joined = (part1 + part2).toLowerCase();
    if (tagalogWords.has(lower1) && tagalogWords.has(lower2)) { // Both parts are valid Tagalog words: keep the space
      return part1 + " " + part2;
    }
    if (tagalogWords.has(joined)) { // Joined is a valid Tagalog word: join them
      return part1 + part2;
    }
    return match; // Otherwise, leave as is
  });
};
const fixWordsWithDictionary = (text: string) => {
  return text.split(/\b/).map((word) => {
    const trimmed = word.trim();
    if (!trimmed) return word;
    if (tagalogWords.has(trimmed)) return word;
    const joined = trimmed.replace(/\s+/g, "");
    if (tagalogWords.has(joined)) return word.replace(trimmed, joined);
    return word;
  }).join("");
};

export const setExtractTextFromPDF = onCall(async (request: CallableRequest) => {
  const {fileUrl} = request.data;
  if (!fileUrl) {
    throw new HttpsError("invalid-argument", "Missing fileUrl");
  }
  let tempFilePath = "";
  try {
    // Download PDF to temp file
    const response = await axios.get(fileUrl, {responseType: "arraybuffer"});
    tempFilePath = path.join(os.tmpdir(), `${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, response.data);
    const loadingTask = getDocument(tempFilePath); // Load PDF with pdfjs
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pagePromises = [];
    for (let i = 1; i <= numPages; i++) {
      pagePromises.push(pdf.getPage(i));
    }
    const pages = await Promise.all(pagePromises);
    const textPromises = pages.map(async (page) => {
      const content = await page.getTextContent();
      const items = content.items.map((item: any) => item.str);
      let text = items.join(" ").replace(/\s+/g, " ").trim(); // Merge items into a line, remove extra spaces
      let lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0); // Remove duplicate lines (if any)
      lines = Array.from(new Set(lines));
      text = lines.join("\n")
        .replace(/(?:^|\n)(.+)(?:\n\1)+/g, "$1") // Remove consecutive duplicate lines
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove invisible characters
        .normalize("NFC"); // Normalize Unicode
      text = fixSmartSplitWords(text); // Fix split words
      text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
      text = fixWordsWithDictionary(text); // Fix using dictionary
      text = text.trim();
      if (text && !text.endsWith(".")) text += "."; // Trim and ensure period at end
      return text;
    });
    const pageTexts = await Promise.all(textPromises);
    return {pageTexts};
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new HttpsError("internal", "Failed to extract PDF text");
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

// firestore
const firestore = admin.firestore();
const usersCollection = firestore.collection("users");
const userClassesCollection = (uid: string) => {
  return usersCollection.doc(uid).collection("classes");
};
const userOpenLessonsCollection = (uid: string) => {
  return usersCollection.doc(uid).collection("openLessons");
};
// const userAssignmentsCollection = (uid: string) => {
//   return usersCollection.doc(uid).collection("assignments");
// };
const classesCollection = firestore.collection("classes");
const membersCollection = (classId: string) => {
  return classesCollection.doc(classId).collection("members");
};
const classPublishedLessonsCollection = (classId: string) => {
  return classesCollection.doc(classId).collection("publishedLessons");
};
const assignmentsCollection = firestore.collection("assignments");
const assignmentsSubmissionsCollection = (assignmentId: string) => {
  return assignmentsCollection.doc(assignmentId).collection("submissions");
};
const yunitCollection = firestore.collection("yunits");
const lessonsCollection = (yunitId: string, gradeLevel: string) => {
  return yunitCollection.doc(yunitId).collection(gradeLevel);
};
const quizzesCollection = firestore.collection("quizzes");
const quizResponsesCollection = (quizId: string) => {
  return quizzesCollection.doc(quizId).collection("responses");
};
const seatworksCollection = firestore.collection("seatworks");
const seatworkResponsesCollection = (seatworkId: string) => {
  return seatworksCollection.doc(seatworkId).collection("responses");
};
const videosCollection = firestore.collection("videos");
// const analyticsCollection = firestore.collection("analytics");
const bigkasExercisesCollection = firestore.collection("bigkasExercises");
const bigkasSaveProgressCollection = (bigkasId: string) => {
  return bigkasExercisesCollection.doc(bigkasId).collection("responses");
};
// logactivity with action, user name, user role, and timestamp
const logActivity = async (uid: string, activity: string, userName: string, userRole: string) => {
  try {
    const activityRef = usersCollection.doc(uid).collection("activities").doc();
    await activityRef.set({
      activity,
      userName,
      userRole,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    throw new HttpsError("internal", "Failed to log activity");
  }
};

const logUserActivity = async (uid: string, activity: string) => {
  const user = await admin.auth().getUser(uid);
  const userName = user.displayName || user.email || "Unknown User";
  const userRole = user.customClaims?.role || "User";
  await logActivity(uid, activity, userName, userRole);
};

const deleteDocumentWithSubcollections = async (docRef: FirebaseFirestore.DocumentReference) => {
  const subcollections = await docRef.listCollections();
  await Promise.all(subcollections.map(async (subcollection) => {
    const subDocs = await subcollection.listDocuments();
    await Promise.all(subDocs.map(async (subDoc) => {
      await deleteDocumentWithSubcollections(subDoc);
    }));
  }));
  await docRef.delete();
};

export const checkUserProfileDuplicates = onCall(async (request: CallableRequest) => {
  const {uid, displayName, phoneNumber} = request.data;
  if (!uid) {
    throw new HttpsError("invalid-argument", "Missing uid");
  }
  if (displayName) {
    const nameSnap = await usersCollection
      .where("displayName", "==", displayName)
      .get();
    const isDuplicate = nameSnap.docs.some((doc) => doc.id !== uid);
    if (isDuplicate) {
      throw new HttpsError("already-exists", "Display name already in use.");
    }
  }
  if (phoneNumber) {
    const phoneSnap = await usersCollection
      .where("phoneNumber", "==", phoneNumber)
      .get();
    const isDuplicate = phoneSnap.docs.some((doc) => doc.id !== uid);
    if (isDuplicate) {
      throw new HttpsError("already-exists", "Phone number already in use.");
    }
  }
  return {success: true};
});

// getAllUsers function onCall from auth and firestore consist of Users, counts, and custom claims
export const getAllUsers = onCall(async (request: CallableRequest) => {
  try {
    const {signInUser, role, classId} = request.data;
    if (!role || (role === "Teacher" && !classId)) {
      console.error("Invalid arguments:", {role});
      throw new HttpsError("invalid-argument", "Missing role or classId");
    }
    // get Users from auth
    // listUsers() returns a maximum of 1000 users at a time
    // so we need to use a loop to get all users
    let nextPageToken: string | undefined;
    let allUsers: admin.auth.UserRecord[] = [];
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      allUsers = allUsers.concat(listUsersResult.users);
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    // map the users to the desired format
    let usersAuth;
    if (role === "Admin") {
      usersAuth = allUsers
        .filter((user) => !user.uid.match(signInUser))
        .map((user) => ({
          uid: user.uid,
          role: user.customClaims?.role || null,
          [user.customClaims?.role === "Teacher" || user.customClaims?.role === "Admin" ?
            "gradeLevels" : "gradeLevel"]: user.customClaims?.role === "Teacher" || user.customClaims?.role === "Admin" ?
            user.customClaims?.gradeLevels || null : user.customClaims?.gradeLevel || null,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          disabled: user.disabled,
          lastSignInTime: user.metadata.lastSignInTime,
          creationTime: user.metadata.creationTime,
        }));
    } else {
      const memberDocs = await membersCollection(classId).get();
      const memberUids = new Set(memberDocs.docs.map((doc) => doc.id));
      usersAuth = allUsers
        .filter((user) =>
          !user.disabled &&
          !user.uid.match(signInUser) &&
          !memberUids.has(user.uid)
        )
        .map((user) => ({
          uid: user.uid,
          role: user.customClaims?.role || null,
          [user.customClaims?.role === "Teacher" || user.customClaims?.role === "Admin" ?
            "gradeLevels" : "gradeLevel"]: user.customClaims?.role === "Teacher" || user.customClaims?.role === "Admin" ?
            user.customClaims?.gradeLevels || null : user.customClaims?.gradeLevel || null,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }));
    }
    return {users: usersAuth};
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new HttpsError("internal", "Error fetching users");
  }
});

export const setCreateUser = onCall(async (request: CallableRequest) => {
  const {signInUser, displayName, email, password, role, gradeLevels, gradeLevel} = request.data;
  // validate the input
  if (!email || !password || !displayName || !role || (role === "Student" && !gradeLevel) || (role === "Admin" || role === "Teacher") && !gradeLevels) {
    console.error("Invalid arguments:", {displayName, email, password, role, gradeLevels, gradeLevel});
    throw new HttpsError("invalid-argument", "Missing displayName, email, password, role, gradeLevels or gradeLevel");
  }
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    const customClaims: Record<string, any> = {role};
    const userData: Record<string, any> = {
      disabled: false,
      role,
      displayName,
      email,
      emailVerified: false,
      photoURL: null,
      phoneNumber: null,
      metadata: {
        creationTime: FieldValue.serverTimestamp(),
        lastSignInTime: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    };
    if (role === "Admin" || role === "Teacher") {
      userData.gradeLevels = gradeLevels || [];
      customClaims.gradeLevels = gradeLevels || [];
    } else {
      userData.gradeLevel = gradeLevel || null;
      customClaims.gradeLevel = gradeLevel || null;
    }
    await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
    await usersCollection.doc(userRecord.uid).set(userData);
    await realtimeDb.ref(`users/${userRecord.uid}`).set({
      ...userData,
      lastActiveAt: Date.now(),
    });
    const emailKey = email.replace(/\./g, ",");
    await realtimeDb.ref(`userEmails/${emailKey}`).set({uid: userRecord.uid});
    // log activity
    await logUserActivity(signInUser, "Create user");
    return {success: true};
  } catch (error) {
    console.error("Error creating user:", error);
    throw new HttpsError("internal", "Error creating user");
  }
});

// setUserRole function
export const setUserClaims = onCall(async (request: CallableRequest) => {
  const {uid, role, gradeLevel, gradeLevels, classId} = request.data;
  // validate the input
  if (!uid || !role) {
    console.error("Invalid arguments:", {uid, role});
    throw new HttpsError("invalid-argument", "Missing uid or role");
  }
  try {
    const user = await admin.auth().getUser(uid);
    const currentClaims = user.customClaims || {};
    const updatePayload: Record<string, any> = {};

    if (role !== undefined) {
      currentClaims.role = role;
      updatePayload.role = role;
    }
    if (role === "Admin" || role === "Teacher") {
      currentClaims.gradeLevels = gradeLevels;
      updatePayload.gradeLevels = gradeLevels;
      delete currentClaims.gradeLevel;
      updatePayload.gradeLevel = FieldValue.delete();
    } else if (role === "Student" && gradeLevel !== undefined) {
      delete currentClaims.gradeLevels;
      updatePayload.gradeLevels = FieldValue.delete();
      currentClaims.gradeLevel = gradeLevel;
      updatePayload.gradeLevel = gradeLevel;
    }
    if (classId !== undefined) {
      currentClaims.classId = classId;
      updatePayload.classId = classId;
    }
    await admin.auth().setCustomUserClaims(uid, currentClaims);
    if (Object.keys(updatePayload).length > 0) {
      await usersCollection.doc(uid).set(updatePayload, {merge: true});
    }
    await logUserActivity(uid, "Set user role");
    return {success: true};
  } catch (error) {
    console.error("Error setting user role:", error);
    throw new HttpsError("internal", "Error setting user role");
  }
});

export const setUserStatus = onCall(async (request: CallableRequest) => {
  const {signInUser, uid, status} = request.data;
  // validate the input
  if (typeof uid !== "string" || typeof status !== "boolean") {
    console.error("Invalid arguments:", {uid, status});
    throw new HttpsError("invalid-argument", "Missing uid or status");
  }
  try {
    await admin.auth().updateUser(uid, {disabled: status});
    await usersCollection.doc(uid).update({disabled: status});
    await realtimeDb.ref(`users/${uid}/disabled`).set(status);
    await logUserActivity(signInUser, status ? "Disable user" : "Enable user");
    return {success: true};
  } catch (error) {
    console.error("Error disabling user:", error);
    throw new HttpsError("internal", "Error disabling user");
  }
});

export const setUpdateUser = onCall(async (request: CallableRequest) => {
  const {signInUser, uid, displayName, email, password, role, gradeLevels, gradeLevel} = request.data;
  // validate the input
  if (!uid || !displayName || !email || !role || (role === "Student" && !gradeLevel) || (role === "Admin" || role === "Teacher") && !gradeLevels) {
    console.error("Invalid arguments:", {uid, displayName, email, role, gradeLevels, gradeLevel});
    throw new HttpsError("invalid-argument", "Missing uid, displayName, email, role, gradeLevels or gradeLevel");
  }
  try {
    // Check for duplicate displayName and email in Firestore (excluding current user)
    if (displayName) {
      const duplicateSnapshot = await usersCollection.where("displayName", "==", displayName).get();
      const isDisplayNameDuplicate = duplicateSnapshot.docs.some((doc) => doc.id !== uid);
      if (isDisplayNameDuplicate) {
        throw new HttpsError("already-exists", "Display name already exists");
      }
    }
    if (email) {
      const emailSnapshot = await usersCollection.where("email", "==", email).get();
      const isEmailDuplicate = emailSnapshot.docs.some((doc) => doc.id !== uid);
      if (isEmailDuplicate) {
        throw new HttpsError("already-exists", "Email already exists");
      }
    }
    // Update user in auth
    const user = await admin.auth().getUser(uid);
    const updatePayload: admin.auth.UpdateRequest = {};
    // Retrieve existing custom claims
    const existingClaims = user.customClaims || {};
    // Update Firestore document
    const firestoreUpdatePayload: Record<string, any> = {};
    if (displayName) {
      updatePayload.displayName = displayName;
      firestoreUpdatePayload.displayName = displayName;
    }
    if (email) {
      updatePayload.email = email;
      firestoreUpdatePayload.email = email;
    }
    if (password) updatePayload.password = password;
    if (role) {
      existingClaims.role = role;
      firestoreUpdatePayload.role = role;
    }
    if (role === "Admin" || role === "Teacher") {
      existingClaims.gradeLevels = gradeLevels;
      firestoreUpdatePayload.gradeLevels = gradeLevels;
      delete existingClaims.gradeLevel;
      firestoreUpdatePayload.gradeLevel = FieldValue.delete();
    } else {
      delete existingClaims.gradeLevels;
      firestoreUpdatePayload.gradeLevels = FieldValue.delete();
      existingClaims.gradeLevel = gradeLevel;
      firestoreUpdatePayload.gradeLevel = gradeLevel;
    }
    firestoreUpdatePayload.updatedAt = FieldValue.serverTimestamp();
    if (Object.keys(updatePayload).length > 0) {
      await admin.auth().updateUser(uid, updatePayload);
    }
    await admin.auth().setCustomUserClaims(uid, existingClaims);
    await usersCollection.doc(uid).update(firestoreUpdatePayload);
    await realtimeDb.ref(`users/${uid}`).update({
      ...firestoreUpdatePayload,
      lastActiveAt: Date.now(),
    });
    if (email) {
      const emailKey = email.replace(/\./g, ",");
      await realtimeDb.ref(`userEmails/${emailKey}`).set({uid});
    }
    // Log activity
    await logUserActivity(signInUser, "Update user");
    return {success: true};
  } catch (error) {
    console.error("Error updating user:", error);
    throw new HttpsError("internal", "Error updating user");
  }
});

// deleteUser function
export const setDeleteUser = onCall(async (request: CallableRequest) => {
  const {signInUser, uids} = request.data;
  // validate the input
  if (!uids || !Array.isArray(uids) || uids.length === 0) {
    console.error("Invalid arguments:", {uids});
    throw new HttpsError("invalid-argument", "Missing or invalid uids array");
  }
  await Promise.all(uids.map(async (uid) => {
    if (typeof uid !== "string" || uid.trim() === "" || uid.length > 128) {
      return;
    }
    try {
      // delete user email key from realtime db
      const userRecord = await admin.auth().getUser(uid);
      const email = userRecord?.email;
      const emailKey = email?.replace(/\./g, ",");
      // delete user from auth
      await admin.auth().deleteUser(uid);
      // Delete user document and its subcollections from Firestore
      const userDocRef = usersCollection.doc(uid);
      await deleteDocumentWithSubcollections(userDocRef);
      await realtimeDb.ref(`users/${uid}`).remove();
      if (emailKey) {
        await realtimeDb.ref(`userEmails/${emailKey}`).remove();
      }
      // Delete user from every membersCollection from classesCollection
      const classesSnapshot = await classesCollection.get();
      await Promise.all(
        classesSnapshot.docs.map(async (classDoc) => {
          const memberDocRef = membersCollection(classDoc.id).doc(uid);
          return memberDocRef.delete();
        })
      );
      // Log activity
      await logUserActivity(signInUser, "Delete user");
    } catch (error: any) {
      console.error(`Error deleting user with uid ${uid}:`, error);
      throw new HttpsError("internal", `Error deleting user with uid ${uid}`);
    }
  }));
  return {success: true};
});

// getAdminStats function based on user role from auth and firestore which consist of total users, active teachers, active students, and total courses
export const getAdminStats = onCall(async () => {
  try {
    // get Users from auth
    // listUsers() returns a maximum of 1000 users at a time
    // so we need to use a loop to get all users
    let nextPageToken: string | undefined;
    let allUsers: admin.auth.UserRecord[] = [];
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      allUsers = allUsers.concat(listUsersResult.users);
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Helper to check if date is in last month
    const isLastMonth = (dateStr?: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date >= firstDayLastMonth && date <= lastDayLastMonth;
    };

    // map the users to the desired format
    const usersAuth = allUsers.map((user) => ({
      uid: user.uid,
      role: user.customClaims?.role || null,
      disabled: user.disabled,
      lastSignInTime: user.metadata.lastSignInTime,
      creationTime: user.metadata.creationTime,
    }));

    const totalUsers = allUsers.length;
    const totalUsersLastMonth = allUsers.filter((u) => isLastMonth(u.metadata.creationTime)).length;

    const activeTeachersCount = usersAuth.filter((user) => user.role === "Teacher" && !user.disabled).length;
    const activeTeachersCountLastMonth = usersAuth.filter((user) => user.role === "Teacher" && !user.disabled && isLastMonth(user.creationTime)).length;

    const activeStudentsCount = usersAuth.filter((user) => user.role === "Student" && !user.disabled).length;
    const activeStudentsCountLastMonth = usersAuth.filter((user) => user.role === "Student" && !user.disabled && isLastMonth(user.creationTime)).length;

    const yunitSnapshot = await yunitCollection.get();
    let totalLessons = 0;
    let totalLessonsLastMonth = 0;
    const gradeLevels = Array.from({length: 6}, (_, i) => `Grade ${i + 1}`);
    const lessonQueries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
    yunitSnapshot.docs.forEach((yunitDoc) => {
      const yunitId = yunitDoc.id;
      gradeLevels.forEach((gradeLevel) => {
        lessonQueries.push(lessonsCollection(yunitId, gradeLevel).get());
      });
    });
    const lessonsSnapshots = await Promise.all(lessonQueries);
    lessonsSnapshots.forEach((lessonsSnap) => {
      totalLessons += lessonsSnap.size;
      totalLessonsLastMonth += lessonsSnap.docs.filter((doc) => {
        const createdAt = doc.data().createdAt?.toDate?.();
        return createdAt && createdAt >= firstDayLastMonth && createdAt <= lastDayLastMonth;
      }).length;
    });

    const stats = {
      totalUsers,
      totalUsersLastMonth,
      activeTeachersCount,
      activeTeachersCountLastMonth,
      activeStudentsCount,
      activeStudentsCountLastMonth,
      totalLessons,
      totalLessonsLastMonth,
    };
    return {stats};
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw new HttpsError("internal", "Error fetching admin stats");
  }
});

const aggregateActivityScores = (
  responsesSnap: FirebaseFirestore.QuerySnapshot,
  ids: Set<string>,
  studentIds: Set<string>,
  idField: "quizId" | "seatworkId",
  totalScoreField: "totalQuizScore" | "totalSeatworkScore"
) => {
  let totalScore = 0;
  let totalPossible = 0;
  let totalCount = 0;
  responsesSnap.forEach((doc) => {
    const data = doc.data();
    if (ids.has(data[idField]) && studentIds.has(doc.id)) {
      if (typeof data.score === "number" && typeof data[totalScoreField] === "number" && data[totalScoreField] > 0) {
        totalScore += data.score;
        totalPossible += data[totalScoreField];
        totalCount++;
      }
    }
  });
  return {totalScore, totalPossible, totalCount};
};

export const getTeacherStats = onCall(async (request: CallableRequest) => {
  const {uid} = request.data;
  if (!uid) {
    throw new HttpsError("invalid-argument", "Missing uid");
  }
  try {
    const classesSnap = await classesCollection.where("teacherId", "==", uid).get();
    const classIds = classesSnap.docs.map((doc) => doc.id);
    const classGradeLevels = classesSnap.docs.map((doc) => doc.data().gradeLevel);
    const membersSnaps = await Promise.all(classIds.map((classId) => membersCollection(classId).get()));
    const studentIds = new Set<string>();
    const lastMonthStudentIds = new Set<string>();
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    membersSnaps.forEach((membersSnap) => {
      membersSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.title === "Member") {
          studentIds.add(doc.id);
          const createdAt = data.createdAt?.toDate?.();
          if (createdAt && createdAt >= firstDayLastMonth && createdAt <= lastDayLastMonth) {
            lastMonthStudentIds.add(doc.id);
          }
        }
      });
    });
    const yunitSnap = await yunitCollection.get();
    const lessonQueries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
    for (const gradeLevel of classGradeLevels) {
      for (const yunitDoc of yunitSnap.docs) {
        const yunitId = yunitDoc.id;
        lessonQueries.push(lessonsCollection(yunitId, gradeLevel).get());
      }
    }
    const lessonsSnapshots = await Promise.all(lessonQueries);
    const publishedLessonsSnaps = await Promise.all(
      classIds.map((classId) => classPublishedLessonsCollection(classId).get())
    );
    const publishedLessonsMap: Record<string, any> = {};
    publishedLessonsSnaps.forEach((snap) => {
      snap.docs.forEach((doc) => {
        publishedLessonsMap[doc.id] = doc.data();
      });
    });
    let lessonsManaged = 0;
    let activeLessons = 0;
    let upcomingLessons = 0;
    lessonsSnapshots.forEach((lessonsSnap) => {
      lessonsManaged += lessonsSnap.size;
      lessonsSnap.docs.forEach((doc) => {
        const lessonId = doc.id;
        const published = publishedLessonsMap[lessonId];
        if (published && published.isDraft === false) activeLessons++;
        else upcomingLessons++;
      });
    });
    const responsesSnap = await firestore.collectionGroup("responses").get();
    const quizzesSnap = await quizzesCollection.where("classId", "in", classIds).get();
    const quizIds = new Set(quizzesSnap.docs.map((doc) => doc.id));
    const seatworksSnap = await seatworksCollection.where("classId", "in", classIds).get();
    const seatworkIds = new Set(seatworksSnap.docs.map((doc) => doc.id));
    const quizAgg = aggregateActivityScores(responsesSnap, quizIds, studentIds, "quizId", "totalQuizScore");
    const seatworkAgg = aggregateActivityScores(responsesSnap, seatworkIds, studentIds, "seatworkId", "totalSeatworkScore");
    const avgQuizScore = quizAgg.totalPossible > 0 ?
      Math.round((quizAgg.totalScore / quizAgg.totalPossible) * 100) : 0;
    const avgSeatworkScore = seatworkAgg.totalPossible > 0 ?
      Math.round((seatworkAgg.totalScore / seatworkAgg.totalPossible) * 100) : 0;
    const stats = {
      activeStudents: studentIds.size,
      activeStudentsLastMonth: lastMonthStudentIds.size,
      lessonsManaged,
      activeLessons,
      upcomingLessons,
      avgStudentQuizScore: avgQuizScore,
      totalQuizzes: quizAgg.totalCount,
      avgStudentSeatworkScore: avgSeatworkScore,
      totalSeatworks: seatworkAgg.totalCount,
    };
    return {stats};
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    throw new HttpsError("internal", "Error fetching teacher stats");
  }
});

const groupScoresByYunitLesson = async (
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
  responseCollection: (id: string) => FirebaseFirestore.CollectionReference,
  studentId: string,
  idField: string,
  totalScoreField: string
) => {
  const grouped: Record<string, Record<string, any[]>> = {};
  let totalAnswered = 0;
  await Promise.all(docs.map(async (doc) => {
    const data = doc.data();
    const itemId = doc.id;
    const responseDoc = await responseCollection(itemId).doc(studentId).get();
    if (responseDoc.exists) {
      const responseData = responseDoc.data();
      const yunitNumber = data.yunitNumber;
      const lessonNumber = data.lessonNumber;
      if (!grouped[yunitNumber]) grouped[yunitNumber] = {};
      if (!grouped[yunitNumber][lessonNumber]) grouped[yunitNumber][lessonNumber] = [];
      grouped[yunitNumber][lessonNumber].push({
        [idField]: itemId,
        score: responseData?.score || 0,
        [totalScoreField]: responseData?.[totalScoreField] || 0,
        lessonId: data.lessonId,
        lessonNumber: data.lessonNumber,
        yunitId: data.yunitId,
        yunitNumber: data.yunitNumber,
        category: data.category,
      });
      totalAnswered++;
    }
  }));
  return {grouped, totalAnswered};
};

export const getAllClassStudentStats = onCall(async (request: CallableRequest) => {
  const {uid} = request.data;
  if (!uid) {
    throw new HttpsError("invalid-argument", "Missing uid");
  }
  try {
    const classesSnap = await classesCollection.where("teacherId", "==", uid).get();
    const classIds = classesSnap.docs.map((doc) => doc.id);
    const membersSnaps = await Promise.all(classIds.map((classId) => membersCollection(classId).where("title", "==", "Member").get()));
    const studentIds = new Set<string>();
    membersSnaps.forEach((membersSnap) => {
      membersSnap.docs.forEach((doc) => {
        studentIds.add(doc.id);
      });
    });
    const studentStatsPromises = Array.from(studentIds).map(async (studentId) => {
      const userDoc = await usersCollection.doc(studentId).get();
      if (!userDoc.exists) return null;
      const userData = userDoc.data();
      if (!userData) return null;
      const gradeLevel = userData.gradeLevel;
      if (!gradeLevel) return null;
      try {
        // Get totalLessons for this gradeLevel
        const yunitsSnap = await yunitCollection.get();
        let totalLessons = 0;
        const lessonQueries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
        yunitsSnap.docs.forEach((yunitDoc) => {
          const yunitId = yunitDoc.id;
          lessonQueries.push(lessonsCollection(yunitId, gradeLevel).get());
        });
        const lessonsSnapshots = await Promise.all(lessonQueries);
        lessonsSnapshots.forEach((snap) => {
          totalLessons += snap.size;
        });
        // Get totalQuizzes and totalSeatworks Available for this gradeLevel
        const quizzesSnapAll = await quizzesCollection.where("gradeLevel", "==", gradeLevel).get();
        const totalQuizzesAvailable = quizzesSnapAll.size;
        const seatworksSnapAll = await seatworksCollection.where("gradeLevel", "==", gradeLevel).get();
        const totalSeatworksAvailable = seatworksSnapAll.size;
        // Enrollment check
        const classesSnap = await classesCollection.where("gradeLevel", "==", gradeLevel).get();
        const classIds = classesSnap.docs.map((doc) => doc.id);
        const membersSnaps = await Promise.all(classIds.map((classId) => membersCollection(classId).where("title", "==", "Member").where("id", "==", studentId).get()));
        let isEnrolled = false;
        membersSnaps.forEach((membersSnap) => {
          if (!isEnrolled && !membersSnap.empty) {
            isEnrolled = true;
          }
        });
        // Get time spent per lesson from userOpenLessonsCollection and lesson name
        const openLessonsSnap = await userOpenLessonsCollection(studentId).get();
        const lessonTimeSpent: Array<{
          lessonId: string,
          lessonNumber: number,
          lessonName: string,
          timeSpent: number}> = [];
        await Promise.all(openLessonsSnap.docs.map(async (doc) => {
          const data = doc.data();
          const lessonId = doc.id;
          const timeSpent = typeof data.totalTimeSpent === "number" ? data.totalTimeSpent : 0;
          let lessonName = "";
          let lessonNumber = 0;
          if (data.yunitId && data.gradeLevel) {
            const lessonDoc = await lessonsCollection(data.yunitId, data.gradeLevel).doc(lessonId).get();
            lessonName = lessonDoc.exists ? lessonDoc.data()?.aralinPamagat || "" : "";
            lessonNumber = lessonDoc.exists ? lessonDoc.data()?.aralinNumero || 0 : 0;
          }
          lessonTimeSpent.push({lessonId, lessonName, lessonNumber, timeSpent});
        }));
        // Quiz stats: group by yunitNumber > lessonNumber > quizzes[]
        const {grouped: groupedQuizScores, totalAnswered: totalQuizzesAnswered} =
          await groupScoresByYunitLesson(
            quizzesSnapAll.docs,
            quizResponsesCollection,
            studentId,
            "quizId",
            "totalQuizScore"
          );
        // Seatwork stats: group by yunitNumber > lessonNumber > seatworks[]
        const {grouped: groupedSeatworkScores, totalAnswered: totalSeatworksAnswered} =
          await groupScoresByYunitLesson(
            seatworksSnapAll.docs,
            seatworkResponsesCollection,
            studentId,
            "seatworkId",
            "totalSeatworkScore"
          );
        // Calculate progress
        const lessonProgress = totalLessons > 0 ? (lessonTimeSpent.length / totalLessons) * 100 : 0;
        const quizProgress = totalQuizzesAvailable > 0 ?
          (totalQuizzesAnswered / totalQuizzesAvailable) * 100 : 0;
        const seatworkProgress = totalSeatworksAvailable > 0 ?
          (totalSeatworksAnswered / totalSeatworksAvailable) * 100 : 0;
        const overallProgress = Math.round((lessonProgress + quizProgress + seatworkProgress) / 3);
        const stats = {
          isEnrolled,
          lessonTimeSpent,
          totalLessons,
          quizScoresGrouped: groupedQuizScores,
          totalQuizzesAnswered,
          totalQuizzesAvailable,
          seatworkScoresGrouped: groupedSeatworkScores,
          totalSeatworksAnswered,
          totalSeatworksAvailable,
          lessonProgress: Math.round(lessonProgress),
          quizProgress: Math.round(quizProgress),
          seatworkProgress: Math.round(seatworkProgress),
          overallProgress,
        };
        return {
          uid: studentId,
          displayName: userData.displayName || "",
          [userData?.role === "Teacher" || userData?.role === "Admin" ? "gradeLevels" : "gradeLevel"]: userData.role === "Teacher" || userData.role === "Admin" ? userData.gradeLevels || [] : userData.gradeLevel || "",
          email: userData.email || "",
          photoURL: userData.photoURL || "",
          stats,
        };
      } catch (error) {
        console.error(`Error fetching stats for student ${studentId}:`, error);
        return null;
      }
    });
    const studentStats = await Promise.all(studentStatsPromises);
    const filteredStats = studentStats.filter((stat) => stat !== null);
    return {studentStats: filteredStats};
  } catch (error) {
    console.error("Error fetching all class student stats:", error);
    throw new HttpsError("internal", "Error fetching all class student stats");
  }
});

// getStudentStats function based on user role from auth and firestore which consist of isEnrolled, lessonTimeSpent, quizScoresGrouped, and totalQuizzes
export const getStudentStats = onCall(async (request: CallableRequest) => {
  const {uid, gradeLevel} = request.data;
  if (!uid) {
    throw new HttpsError("invalid-argument", "Missing uid");
  }
  try {
    const classesSnap = await classesCollection.where("gradeLevel", "==", gradeLevel).get();
    const classIds = classesSnap.docs.map((doc) => doc.id);
    const membersSnaps = await Promise.all(classIds.map((classId) => membersCollection(classId).where("title", "==", "Member").where("id", "==", uid).get()));
    let isEnrolled = false;
    membersSnaps.forEach((membersSnap) => {
      if (!isEnrolled && !membersSnap.empty) {
        isEnrolled = true;
      }
    });
    // Get time spent per lesson from userOpenLessonsCollection and lesson name
    const openLessonsSnap = await userOpenLessonsCollection(uid).get();
    const lessonTimeSpent: Array<{lessonId: string, lessonNumber: number, lessonName: string, timeSpent: number}> = [];
    await Promise.all(openLessonsSnap.docs.map(async (doc) => {
      const data = doc.data();
      const lessonId = doc.id;
      const timeSpent = typeof data.totalTimeSpent === "number" ? data.totalTimeSpent : 0;
      let lessonName = "";
      let lessonNumber = 0;
      if (data.yunitId && data.gradeLevel) {
        const lessonDoc = await lessonsCollection(data.yunitId, data.gradeLevel).doc(lessonId).get();
        lessonName = lessonDoc.exists ? lessonDoc.data()?.aralinPamagat || "" : "";
        lessonNumber = lessonDoc.exists ? lessonDoc.data()?.aralinNumero || 0 : 0;
      }
      lessonTimeSpent.push({lessonId, lessonName, lessonNumber, timeSpent});
    }));
    // Quiz stats: group by yunitNumber > lessonNumber > quizzes[]
    const quizzesSnap = await quizzesCollection.where("gradeLevel", "==", gradeLevel).get();
    const {grouped: groupedQuizScores, totalAnswered: totalQuizzesAnswered} =
      await groupScoresByYunitLesson(
        quizzesSnap.docs,
        quizResponsesCollection,
        uid,
        "quizId",
        "totalQuizScore"
      );
    const seatworksSnap = await seatworksCollection.where("gradeLevel", "==", gradeLevel).get();
    const {grouped: groupedSeatworkScores, totalAnswered: totalSeatworksAnswered} =
      await groupScoresByYunitLesson(
        seatworksSnap.docs,
        seatworkResponsesCollection,
        uid,
        "seatworkId",
        "totalSeatworkScore"
      );
    const stats = {
      isEnrolled,
      lessonTimeSpent,
      quizScoresGrouped: groupedQuizScores,
      totalQuizzes: totalQuizzesAnswered,
      seatworkScoresGrouped: groupedSeatworkScores,
      totalSeatworks: totalSeatworksAnswered,
    };
    return {stats};
  } catch (error) {
    console.error("Error fetching student stats:", error);
    throw new HttpsError("internal", "Error fetching student stats");
  }
});

// get all users current month activities
export const getAllUsersCurrentMonthActivities = onCall(async (request: CallableRequest) => {
  const {startDate, endDate} = request.data;
  if (!startDate || !endDate) {
    throw new HttpsError("invalid-argument", "Missing startDate or endDate");
  }
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const usersSnapshot = await usersCollection.get();
    const activityPromises = usersSnapshot.docs.map(async (userDoc) => {
      const uid = userDoc.id;
      const activitiesSnapshot = await userDoc.ref.collection("activities")
        .where("timestamp", ">=", start)
        .where("timestamp", "<=", end)
        .orderBy("timestamp", "desc")
        .get();
      return {
        uid,
        activities: activitiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.().toISOString?.(),
        })),
      };
    });
    const activitiesResults = await Promise.all(activityPromises);
    const allActivities: Record<string, any[]> = {};
    activitiesResults.forEach(({uid, activities}) => {
      allActivities[uid] = activities;
    });
    return {activities: allActivities};
  } catch (error) {
    console.error("Error fetching all users' current month activities:", error);
    throw new HttpsError("internal", "Error fetching all users' current month activities");
  }
});

// get latest recent activity function across users and system from one of their recent activity inside of an array
export const getCurrentMonthActivities = onCall(async (request: CallableRequest) => {
  try {
    const {uid} = request.data;
    if (!uid) {
      throw new HttpsError("invalid-argument", "Missing uid");
    }
    const userDocRef = usersCollection.doc(uid);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const activitiesSnapshot = await userDocRef.collection("activities")
      .where("timestamp", ">=", firstDay)
      .where("timestamp", "<=", lastDay)
      .orderBy("timestamp", "desc")
      .get();
    const allact = activitiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.().toISOString?.(),
      };
    });
    const fiveact = allact.slice(0, 5);
    const activities = {
      five: fiveact,
      all: allact,
    };
    return {activities};
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new HttpsError("internal", "Error fetching recent activity");
  }
});

export const getClassNameById = onCall(async (request: CallableRequest) => {
  const {classId} = request.data;
  if (!classId) {
    throw new HttpsError("invalid-argument", "Missing classId");
  }
  try {
    const classDoc = await classesCollection.doc(classId).get();
    const classData = classDoc.data();
    return {className: classData?.className || ""};
  } catch (error) {
    console.error("Error fetching class name by ID:", error);
    throw new HttpsError("internal", "Error fetching class name by ID");
  }
});

// getAllClasses functions for admin
export const getAllClasses = onCall(async () => {
  try {
    const classesSnapshot = await classesCollection.get();
    const classes = await Promise.all(classesSnapshot.docs.map(async (doc) => {
      const membersSnap = await membersCollection(doc.id).get();
      return {
        id: doc.id,
        ...doc.data(),
        totalMembers: membersSnap.size,
      };
    }));
    return {classes};
  } catch (error) {
    console.error("Error fetching all classes:", error);
    throw new HttpsError("internal", "Error fetching all classes");
  }
});

// getAllClasses function
export const getAllTeacherClasses = onCall(async (request: CallableRequest) => {
  const {uid} = request.data;
  try {
    const classesSnapshot = await userClassesCollection(uid).get();
    const classes = await Promise.all(classesSnapshot.docs.map(async (doc) => {
      const classDoc = await classesCollection.doc(doc.id).get();
      const membersSnap = await membersCollection(doc.id).get();
      return {
        id: classDoc.id,
        ...classDoc.data(),
        totalMembers: membersSnap.size,
      };
    }));
    return {classes};
  } catch (error) {
    console.error("Error fetching user classes:", error);
    throw new HttpsError("internal", "Error fetching user classes");
  }
});

const generateClassCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const setClassIdClaim=async (uid: string, classId: string)=> {
  const user = await admin.auth().getUser(uid);
  const currentClaims = user.customClaims || {};
  await admin.auth().setCustomUserClaims(uid, {
    ...currentClaims,
    classId,
  });
};

// create Teacher Class function
export const setCreateClass = onCall(async (request: CallableRequest) => {
  const {signInUser, className, classDescription, gradeLevel, days, time} = request.data;
  // validate the input
  if (!signInUser ) {
    console.error("Invalid arguments:", {signInUser});
    throw new HttpsError("invalid-argument", "Missing uid");
  }
  try {
    const classNameSnapshot = await classesCollection
      .where("teacherId", "==", signInUser)
      .where("className", "==", className)
      .get();
    if (!classNameSnapshot.empty) {
      console.error("Class name already exists for this teacher:", {className});
      throw new HttpsError("already-exists", "Class name already exists for this teacher");
    }
    const gradeLevelsSnapshot = await classesCollection
      .where("teacherId", "==", signInUser)
      .where("gradeLevel", "==", gradeLevel)
      .get();
    if (!gradeLevelsSnapshot.empty) {
      console.error("Grade level already exists for this teacher:", {gradeLevel});
      throw new HttpsError("already-exists", "Grade level already exists for this teacher");
    }
    let classCode: string;
    let isUnique = false;
    do {
      classCode = generateClassCode();
      const codeSnapshot = await classesCollection.where("code", "==", classCode).get();
      isUnique = codeSnapshot.empty;
    } while (!isUnique);
    const classDocRef = classesCollection.doc();
    await classDocRef.set({
      teacherId: signInUser,
      gradeLevel,
      className,
      classDescription,
      days,
      time,
      code: classCode,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await userClassesCollection(signInUser).doc(classDocRef.id).set({
      title: "Owner",
      gradeLevel,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const memberDocRef = membersCollection(classDocRef.id).doc(signInUser);
    await memberDocRef.set({
      title: "Owner",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const usersSnapshot = await usersCollection.where("gradeLevel", "==", gradeLevel).get();
    await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const memberDoc = await membersCollection(classDocRef.id).doc(userId).get();
        if (memberDoc.exists) {
          return;
        }
        await userClassesCollection(userId).doc(classDocRef.id).set({
          title: "Member",
          gradeLevel,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        const memberDocRef = membersCollection(classDocRef.id).doc(userId);
        await memberDocRef.set({
          title: "Member",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        await setClassIdClaim(userId, classDocRef.id);
        await usersCollection.doc(userId).update({classId: classDocRef.id});
      })
    );
    // log activity
    await logUserActivity(signInUser, "Create class");
    return {success: true};
  } catch (error) {
    console.error("Error creating teacher class:", error);
    throw new HttpsError("internal", "Error creating teacher class");
  }
});

export const setDeleteClass = onCall(async (request: CallableRequest) => {
  const {signInUser, id} = request.data;
  // validate the input
  if ( !id ) {
    console.error("Invalid arguments:", {id});
    throw new HttpsError("invalid-argument", "Missing id");
  }
  try {
    // delete class in firestore
    const classDocRef = classesCollection.doc(id);
    await deleteDocumentWithSubcollections(classDocRef);
    // remove class from user's classes subcollection
    await userClassesCollection(signInUser).doc(id).delete();
    // log activity
    await logUserActivity(signInUser, "Delete class");
    return {success: true};
  } catch (error) {
    console.error("Error deleting teacher class:", error);
    throw new HttpsError("internal", "Error deleting teacher class");
  }
});

export const setUpdateClass = onCall(async (request: CallableRequest) => {
  const {signInUser, id, className, classDescription, gradeLevel, days, time} = request.data;
  // validate the input
  if (!signInUser || !id) {
    console.error("Invalid arguments:", {signInUser, id});
    throw new HttpsError("invalid-argument", "Missing uid or id");
  }
  try {
    // Check for duplicate class name (if className is being changed)
    if (className) {
      const duplicateSnapshot = await classesCollection
        .where("teacherId", "==", signInUser)
        .where("className", "==", className)
        .get();
      const isDuplicate = duplicateSnapshot.docs.some((doc) => doc.id !== id);
      if (isDuplicate) {
        throw new HttpsError("already-exists", "Class name already exists for this teacher");
      }
    }
    const gradeLevelsSnapshot = await classesCollection
      .where("teacherId", "==", signInUser)
      .where("gradeLevel", "==", gradeLevel)
      .get();
    if (!gradeLevelsSnapshot.empty) {
      console.error("Grade level already exists for this teacher:", {gradeLevel});
      throw new HttpsError("already-exists", "Grade level already exists for this teacher");
    }
    // update class in firestore;
    const firestoreUpdatePayload: Record<string, any> = {};
    if (className) firestoreUpdatePayload.className = className;
    if (classDescription) firestoreUpdatePayload.classDescription = classDescription;
    if (gradeLevel) firestoreUpdatePayload.gradeLevel = gradeLevel;
    if (days) firestoreUpdatePayload.days = days;
    if (time) firestoreUpdatePayload.time = time;
    // Update the updatedAt field to the current server timestamp
    firestoreUpdatePayload.updatedAt = FieldValue.serverTimestamp();
    await classesCollection.doc(id).update(firestoreUpdatePayload);
    // log activity
    await logUserActivity(signInUser, "Update class");
    return {success: true};
  } catch (error) {
    console.error("Error updating teacher class:", error);
    throw new HttpsError("internal", "Error updating teacher class");
  }
});

export const getClassMembers = onCall(async (request: CallableRequest) => {
  const {classId} = request.data;
  // validate the input
  if (!classId) {
    console.error("Invalid arguments:", {classId});
    throw new HttpsError("invalid-argument", "Missing classId");
  }
  try {
    // get class members from firestore
    const membersSnapshot = await membersCollection(classId).get();
    const members = await Promise.all(
      membersSnapshot.docs.map(async (doc) => {
        const userData = doc.data();
        const userDoc = await usersCollection.doc(doc.id).get();
        return {
          id: doc.id,
          ...userData,
          createdAt: userData.createdAt?.toDate?.().toISOString?.(),
          updatedAt: userData.updatedAt?.toDate?.().toISOString?.(),
          ...(userDoc.exists ? {
            displayName: userDoc.data()?.displayName,
            photoURL: userDoc.data()?.photoURL,
            role: userDoc.data()?.role,
          } : {}),
        };
      })
    );
    return {members};
  } catch (error) {
    console.error("Error fetching class members:", error);
    throw new HttpsError("internal", "Error fetching class members");
  }
});

export const setJoinClassByCode = onCall(async (request: CallableRequest) => {
  const {signInUser, classCode} = request.data;
  if (!signInUser || !classCode) {
    throw new HttpsError("invalid-argument", "Missing signInUser or classCode");
  }
  try {
    // Find the class by code
    const classSnap = await classesCollection.where("code", "==", classCode).limit(1).get();
    if (classSnap.empty) {
      throw new HttpsError("not-found", "Class not found");
    }
    const classDoc = classSnap.docs[0];
    const classId = classDoc.id;
    const classData = classDoc.data();
    // Check if already a member
    const memberDoc = await membersCollection(classId).doc(signInUser).get();
    if (memberDoc.exists) {
      throw new HttpsError("already-exists", "Already a member of this class");
    }
    await userClassesCollection(signInUser).doc(classId).set({
      title: "Member",
      gradeLevel: classData.gradeLevel,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // Add member to class
    await membersCollection(classId).doc(signInUser).set({
      title: "Member",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // Set classId claim
    const user = await admin.auth().getUser(signInUser);
    const role = user.customClaims?.role;
    if (role === "Student") {
      await setClassIdClaim(signInUser, classId);
      await usersCollection.doc(signInUser).update({classId});
    }
    // Log activity
    await logUserActivity(signInUser, "Join class by code");
    return {success: true};
  } catch (error) {
    console.error("Error joining class by code:", error);
    throw new HttpsError("internal", "Error joining class by code");
  }
});

export const setAddClassMember = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, gradeLevel, memberIds, title} = request.data;
  // validate the input
  if (!signInUser || !classId || !memberIds || !title) {
    console.error("Invalid arguments:", {signInUser, classId, memberIds, title});
    throw new HttpsError("invalid-argument", "Missing uid or classId or memberId or title");
  }
  const errors: any[] = [];
  await Promise.all(memberIds.map(async (uid: string) => {
    try {
      const userDoc = await usersCollection.doc(uid).get();
      const role = userDoc.data()?.role;
      const userGradeLevel = userDoc.data()?.gradeLevel;
      const displayName = userDoc.data()?.displayName;
      if (role === "Student" && userGradeLevel !== gradeLevel) {
        errors.push({error: "User grade level does not match class grade level", displayName});
        return;
      }
      const memberDocRef = membersCollection(classId).doc(uid);
      const memberDoc = await memberDocRef.get();
      if (memberDoc.exists) {
        errors.push({error: "Member already exists in class", displayName});
        return;
      }
      await userClassesCollection(uid).doc(classId).set({
        title: title,
        gradeLevel,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      await memberDocRef.set({
        title,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      if (role === "Student") {
        await setClassIdClaim(uid, classId);
        await usersCollection.doc(uid).update({classId});
      }
      await logUserActivity(signInUser, "Add member to class");
    } catch (error) {
      console.error("Error adding member to class:", error);
      errors.push({error: "Error adding member to class", uid});
    }
  }));

  return {success: true, errors};
});

export const setUpdateClassMember = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, memberId, title} = request.data;
  // validate the input
  if (!signInUser || !classId || !memberId || !title) {
    console.error("Invalid arguments:", {signInUser, classId, memberId, title});
    throw new HttpsError("invalid-argument", "Missing uid or classId or memberId or title");
  }
  try {
    // update member title in firestore
    const memberDocRef = membersCollection(classId).doc(memberId);
    await memberDocRef.update({
      title,
      updatedAt: FieldValue.serverTimestamp(),
    });
    await userClassesCollection(memberId).doc(classId).update({
      title,
      updatedAt: FieldValue.serverTimestamp(),
    });
    // log activity
    await logUserActivity(signInUser, "Update member title");
    return {success: true};
  } catch (error) {
    console.error("Error updating member title:", error);
    throw new HttpsError("internal", "Error updating member title");
  }
});

export const setDeleteClassMember = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, memberIds} = request.data;
  if (!signInUser || !classId || !memberIds) {
    console.error("Invalid arguments:", {signInUser, classId, memberIds});
    throw new HttpsError("invalid-argument", "Missing uid or classId or memberId");
  }
  await Promise.all(memberIds.map(async (uid: string) => {
    try {
      const memberDocRef = membersCollection(classId).doc(uid);
      await memberDocRef.delete();
      await userClassesCollection(uid).doc(classId).delete();
      const userClassesSnapshot = await userClassesCollection(uid).get();
      const user = await admin.auth().getUser(uid);
      const currentClaims = user.customClaims || {};
      if (userClassesSnapshot.empty) {
        delete currentClaims.classId;
      }
      await admin.auth().setCustomUserClaims(uid, currentClaims);
      await usersCollection.doc(uid).update({classId: FieldValue.delete()});
      await logUserActivity(signInUser, "Delete member from class");
    } catch (error) {
      console.error("Error deleting member from class:", error);
      throw new HttpsError("internal", "Error deleting member from class");
    }
  }));
  return {success: true};
});

export const getAllEvents = onCall(async (request: CallableRequest) => {
  const {signInUser} = request.data;
  if (!signInUser) {
    console.error("Invalid arguments:", {signInUser});
    throw new HttpsError("invalid-argument", "Missing uid");
  }
  try {
    // get events from firestore
    const eventsSnapshot = await usersCollection.doc(signInUser).collection("events").orderBy("createdAt", "desc").get();
    const events = eventsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.().toISOString?.(),
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString?.(),
    }));
    return {events};
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new HttpsError("internal", "Error fetching events");
  }
});

export const setCreateNewEvent = onCall(async (request: CallableRequest) => {
  const {signInUser, selectedDate, time, eventname, eventdescription} = request.data;
  // validate the input
  if (!signInUser || !time || !eventname || !eventdescription) {
    console.error("Invalid arguments:", {signInUser, time, eventname, eventdescription});
    throw new HttpsError("invalid-argument", "Missing uid, time, eventname or eventdescription");
  }
  try {
    // create event in firestore
    const eventDocRef = usersCollection.doc(signInUser).collection("events").doc();
    await eventDocRef.set({
      selectedDate, // Assuming the event is created for today
      time,
      eventname,
      eventdescription,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // log activity
    await logUserActivity(signInUser, "Create new event");
    return {success: true};
  } catch (error) {
    console.error("Error creating new event:", error);
    throw new HttpsError("internal", "Error creating new event");
  }
});

export const setUpdateEvent = onCall(async (request: CallableRequest) => {
  const {signInUser, eventId, selectedDate, time, eventname, eventdescription} = request.data;
  // validate the input
  if (!signInUser || !eventId || !time || !eventname || !eventdescription) {
    console.error("Invalid arguments:", {signInUser, eventId, time, eventname, eventdescription});
    throw new HttpsError("invalid-argument", "Missing uid, eventId, time, eventname or eventdescription");
  }
  try {
    // update event in firestore
    const firestoreUpdatePayload: Record<string, any> = {};
    if (selectedDate) firestoreUpdatePayload.selectedDate = selectedDate;
    if (time) firestoreUpdatePayload.time = time;
    if (eventname) firestoreUpdatePayload.eventname = eventname;
    if (eventdescription) firestoreUpdatePayload.eventdescription = eventdescription;
    // Update the updatedAt field to the current server timestamp
    firestoreUpdatePayload.updatedAt = FieldValue.serverTimestamp();
    await usersCollection.doc(signInUser).collection("events").doc(eventId).update(firestoreUpdatePayload);
    // log activity
    await logUserActivity(signInUser, "Update event");
    return {success: true};
  } catch (error) {
    console.error("Error updating event:", error);
    throw new HttpsError("internal", "Error updating event");
  }
});

export const setDeleteEvent = onCall(async (request: CallableRequest) => {
  const {signInUser, eventId} = request.data;
  // validate the input
  if (!signInUser || !eventId) {
    console.error("Invalid arguments:", {signInUser, eventId});
    throw new HttpsError("invalid-argument", "Missing uid or eventId");
  }
  try {
    // delete event in firestore
    const eventDocRef = usersCollection.doc(signInUser).collection("events").doc(eventId);
    await eventDocRef.delete();
    // log activity
    await logUserActivity(signInUser, "Delete event");
    return {success: true};
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new HttpsError("internal", "Error deleting event");
  }
});

export const getAllYunits = onCall(async (request: CallableRequest) => {
  try {
    const {classId} = request.data;
    const yunitsSnapshot = await yunitCollection.orderBy("yunitnumber").get();
    let unlockedYunitsMap: Record<string, boolean> = {};
    if (classId) {
      const unlockedSnap = await classesCollection.doc(classId).collection("unlockedYunits").get();
      unlockedYunitsMap = unlockedSnap.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().unlocked === true;
        return acc;
      }, {} as Record<string, boolean>);
    }
    const yunits = yunitsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      yunitnumber: doc.data().yunitnumber,
      createdAt: doc.data().createdAt?.toDate?.().toISOString?.(),
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString?.(),
      unlocked: classId ? unlockedYunitsMap[doc.id] === true : false,
    }));
    return {yunits};
  } catch (error) {
    console.error("Error fetching yunits:", error);
    throw new HttpsError("internal", "Error fetching yunits");
  }
});

export const setCreateYunit = onCall(async (request: CallableRequest) => {
  const {signInUser, status, yunitnumber, yunitname, imagepath, imageurl} = request.data;
  // validate the input
  if (!signInUser) {
    console.error("Invalid arguments:", {signInUser});
    throw new HttpsError("invalid-argument", "Missing signInUser");
  }
  try {
    // Check for duplicate yunit name and number
    const duplicateSnapshot = await yunitCollection.where("yunitname", "==", yunitname).get();
    if (!duplicateSnapshot.empty) {
      console.error("Yunit name already exists:", {yunitname});
      throw new HttpsError("already-exists", "Yunit name already exists");
    }
    const duplicateNumberSnapshot = await yunitCollection.where("yunitnumber", "==", yunitnumber).get();
    if (!duplicateNumberSnapshot.empty) {
      console.error("Yunit number already exists:", {yunitnumber});
      throw new HttpsError("already-exists", "Yunit number already exists");
    }
    // create yunit in firestore
    const yunitDocRef = yunitCollection.doc();
    await yunitDocRef.set({
      status,
      imagepath,
      imageurl,
      yunitnumber,
      yunitname,
      createdBy: signInUser,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // log activity
    await logUserActivity(signInUser, "Create yunit");
    return {success: true};
  } catch (error) {
    console.error("Error creating yunit:", error);
    throw new HttpsError("internal", "Error creating yunit");
  }
});

export const setUnlockorLockYunitForClass = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, yunitId, status} = request.data;
  if (!signInUser || !classId || !yunitId) {
    throw new HttpsError("invalid-argument", "Missing signInUser, classId, or yunitId");
  }
  try {
    await classesCollection.doc(classId)
      .collection("unlockedYunits")
      .doc(yunitId)
      .set({
        unlocked: status,
        unlockedBy: signInUser,
        unlockedAt: FieldValue.serverTimestamp(),
      }, {merge: true});
    await logUserActivity(signInUser, status ? "Unlock class yunit" : "Lock class yunit");
    return {success: true};
  } catch (error) {
    console.error("Error unlocking yunit for class:", error);
    throw new HttpsError("internal", "Error unlocking yunit for class");
  }
});

export const setLockAllYunitsForClass = onCall(async (request: CallableRequest) => {
  const {signInUser, classId} = request.data;
  if (!signInUser || !classId) {
    throw new HttpsError("invalid-argument", "Missing signInUser or classId");
  }
  try {
    const unlockedYunitsSnap = await classesCollection.doc(classId).collection("unlockedYunits").get();
    await Promise.all(unlockedYunitsSnap.docs.map(async (doc) => {
      await doc.ref.delete();
    }));
    await logUserActivity(signInUser, "Lock all class yunits");
    return {success: true};
  } catch (error) {
    console.error("Error locking all yunits for class:", error);
    throw new HttpsError("internal", "Error locking all yunits for class");
  }
});

export const setUpdateYunit = onCall(async (request: CallableRequest) => {
  const {signInUser, id, yunitnumber, yunitname, imagepath, imageurl} = request.data;
  // validate the input
  if (!signInUser || !id) {
    console.error("Invalid arguments:", {signInUser, id});
    throw new HttpsError("invalid-argument", "Missing signInUser or id");
  }
  try {
    const duplicateNameSnapshot = await yunitCollection.where("yunitname", "==", yunitname).get();
    const isNameDuplicate = duplicateNameSnapshot.docs.some((doc) => doc.id !== id);
    if (isNameDuplicate) {
      console.error("Yunit name already exists:", {yunitname});
      throw new HttpsError("already-exists", "Yunit name already exists");
    }
    const duplicateNumberSnapshot = await yunitCollection.where("yunitnumber", "==", yunitnumber).get();
    const isNumberDuplicate = duplicateNumberSnapshot.docs.some((doc) => doc.id !== id);
    if (isNumberDuplicate) {
      console.error("Yunit number already exists:", {yunitnumber});
      throw new HttpsError("already-exists", "Yunit number already exists");
    }
    const firestoreUpdatePayload: Record<string, any> = {};
    if (imagepath) firestoreUpdatePayload.imagepath = imagepath;
    if (imageurl) firestoreUpdatePayload.imageurl = imageurl;
    if (yunitnumber) firestoreUpdatePayload.yunitnumber = yunitnumber;
    if (yunitname) firestoreUpdatePayload.yunitname = yunitname;
    firestoreUpdatePayload.updatedAt = FieldValue.serverTimestamp();
    await yunitCollection.doc(id).update(firestoreUpdatePayload);
    await logUserActivity(signInUser, "Update yunit");
    return {success: true};
  } catch (error) {
    console.error("Error updating yunit:", error);
    throw new HttpsError("internal", "Error updating yunit");
  }
});

export const setDeleteYunit = onCall(async (request: CallableRequest) => {
  const {signInUser, id} = request.data;
  // validate the input
  if (!signInUser || !id) {
    console.error("Invalid arguments:", {signInUser, id});
    throw new HttpsError("invalid-argument", "Missing signInUser or id");
  }
  try {
    const doc = await yunitCollection.doc(id).get();
    const data = doc.data();
    if (data?.imagepath) {
      const bucket = admin.storage().bucket();
      await bucket.file(data.imagepath).delete();
    }
    const yunitDocRef = yunitCollection.doc(id);
    await deleteDocumentWithSubcollections(yunitDocRef);
    const classesSnap = await classesCollection.get();
    await Promise.all(classesSnap.docs.map(async (classDoc) => {
      const unlockedYunitRef = classDoc.ref.collection("unlockedYunits").doc(id);
      const unlockedDoc = await unlockedYunitRef.get();
      if (unlockedDoc.exists) {
        await unlockedYunitRef.delete();
      }
    }));
    await logUserActivity(signInUser, "Delete yunit");
    return {success: true};
  } catch (error) {
    console.error("Error deleting yunit:", error);
    throw new HttpsError("internal", "Error deleting yunit");
  }
});

export const getUserOpenLessons = onCall(async (request: CallableRequest) => {
  const {signInUser} = request.data;
  if (!signInUser) {
    throw new HttpsError("invalid-argument", "Missing signInUser");
  }
  try {
    const userLessonsSnapshot = await userOpenLessonsCollection(signInUser).get();
    let userLessons = await Promise.all(
      userLessonsSnapshot.docs.map(async (doc) => {
        const openLesson = {
          id: doc.id, ...doc.data(),
        } as {
          id: string;
          yunitId?: string;
          gradeLevel?: string;
          [key: string]: any
        };
        if (openLesson.yunitId && openLesson.gradeLevel) {
          const lessonDoc = await lessonsCollection(openLesson.yunitId, openLesson.gradeLevel).doc(doc.id).get();
          const lessonData = lessonDoc.data();
          return {
            ...openLesson,
            classId: lessonData?.classId,
            yunitNumber: lessonData?.yunitNumber,
            aralinNumero: lessonData?.aralinNumero,
            aralinPamagat: lessonData?.aralinPamagat,
            aralinPaglalarawan: lessonData?.aralinPaglalarawan,
            aralinLayunin: lessonData?.aralinLayunin,
            fileUrls: lessonData?.fileUrls,
            updatedAt: openLesson.updatedAt?.toDate?.().toISOString?.(),
            createdAt: openLesson.createdAt?.toDate?.().toISOString?.(),
          };
        }
        return openLesson;
      })
    );
    userLessons = userLessons.sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return bTime - aTime;
    }).slice(0, 10);
    return {lessons: userLessons};
  } catch (error) {
    throw new HttpsError("internal", "Error fetching user open lessons");
  }
});

export const getAllGradeLevelLessons = onCall(async (request: CallableRequest) => {
  const {gradeLevel} = request.data;
  if (!gradeLevel) {
    console.error("Invalid arguments:", {gradeLevel});
    throw new HttpsError("invalid-argument", "Missing gradeLevel");
  }
  try {
    const yunitsSnapshot = await yunitCollection.orderBy("yunitnumber").get();
    const yunitData = yunitsSnapshot.docs.map((doc) => ({
      id: doc.id,
      yunitnumber: doc.data().yunitnumber,
    }));
    const lessonsPromises = yunitData.map(({id: yunitId}) =>
      lessonsCollection(yunitId, gradeLevel).orderBy("aralinNumero").get()
    );
    const lessonsSnapshots = await Promise.all(lessonsPromises);
    const lessons = lessonsSnapshots.flatMap((snapshot, idx) =>
      snapshot.docs.map((doc) => ({
        id: doc.id,
        aralinNumero: doc.data().aralinNumero,
        fileUrls: doc.data().fileUrls,
        yunitId: yunitData[idx].id,
        yunitnumber: yunitData[idx].yunitnumber,
      }))
    );
    return {lessons};
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw new HttpsError("internal", "Error fetching lessons");
  }
});

export const getAllDraftLessons = onCall(async () => {
  try {
    const yunitsSnapshot = await yunitCollection.orderBy("yunitnumber").get();
    const gradeLevels = Array.from({length: 6}, (_, i) => `Grade ${i + 1}`);
    const lessonsPromises: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
    yunitsSnapshot.docs.forEach((yunitDoc) => {
      const yunitId = yunitDoc.id;
      gradeLevels.forEach((gradeLevel) => {
        lessonsPromises.push(
          lessonsCollection(yunitId, gradeLevel)
            .orderBy("aralinNumero")
            .get()
        );
      });
    });
    const lessonsSnapshots = await Promise.all(lessonsPromises);
    const lessons = lessonsSnapshots.flatMap((snapshot) =>
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isDraft: doc.data().isDraft,
        createdAt: doc.data().createdAt?.toDate?.().toISOString?.(),
        updatedAt: doc.data().updatedAt?.toDate?.().toISOString?.(),
      }))
    );
    const classesSnap = await classesCollection.get();
    const publishedLessonsSnaps = await Promise.all(
      classesSnap.docs.map((classDoc) => classPublishedLessonsCollection(classDoc.id).get())
    );
    const publishedLessonsMap: Record<string, any> = {};
    publishedLessonsSnaps.forEach((snap) => {
      snap.docs.forEach((doc) => {
        publishedLessonsMap[doc.id] = doc.data();
      });
    });
    const mergedLessons = lessons.map((lesson) => {
      const published = publishedLessonsMap[lesson.id];
      return {
        ...lesson,
        isDraft: published ? published.isDraft : lesson.isDraft,
        publishedAt: published?.publishedAt?.toDate?.().toISOString?.() || null,
      };
    });
    return {lessons: mergedLessons};
  } catch (error) {
    console.error("Error fetching draft lessons:", error);
    throw new HttpsError("internal", "Error fetching draft lessons");
  }
});

export const getAllYunitLessons = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, yunitId, gradeLevel} = request.data;
  // validate the input
  if (!signInUser || !classId || !yunitId || !gradeLevel) {
    console.error("Invalid arguments:", {signInUser, classId, yunitId, gradeLevel});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    const lessonsSnapshot = await lessonsCollection(yunitId, gradeLevel).orderBy("aralinNumero").get();
    const lessons = lessonsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      isDraft: doc.data().isDraft,
      createdAt: doc.data().createdAt?.toDate?.().toISOString?.(),
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString?.(),
    }));
    const quizCountPromises = lessons.map(async (lesson) => {
      const quizzesSnap = await quizzesCollection
        .where("lessonId", "==", lesson.id)
        .where("classId", "==", classId)
        .get();
      return quizzesSnap.size;
    });
    const seatworkCountPromises = lessons.map(async (lesson) => {
      const seatworksSnap = await seatworksCollection
        .where("lessonId", "==", lesson.id)
        .where("classId", "==", classId)
        .get();
      return seatworksSnap.size;
    });
    const [quizCounts, seatworkCounts] = await Promise.all([
      Promise.all(quizCountPromises),
      Promise.all(seatworkCountPromises),
    ]);
    const lessonsWithCounts = lessons.map((lesson, idx) => ({
      ...lesson,
      quizCount: quizCounts[idx],
      seatworkCount: seatworkCounts[idx],
    }));
    const publishedLessonsSnap = await classPublishedLessonsCollection(classId).get();
    const publishedLessonsMap: Record<string, any> = {};
    publishedLessonsSnap.docs.forEach((doc) => {
      publishedLessonsMap[doc.id] = doc.data();
    });
    const mergedLessons = lessonsWithCounts.map((lesson) => {
      const published = publishedLessonsMap[lesson.id];
      return {
        ...lesson,
        isDraft: published ? published.isDraft : lesson.isDraft,
        publishedAt: published?.publishedAt?.toDate?.().toISOString?.() || null,
      };
    });
    return {lessons: mergedLessons};
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw new HttpsError("internal", "Error fetching lessons");
  }
});

export const setCreateLesson = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, yunitId, yunitNumber, gradeLevel, isDraft, aralinNumero,
    aralinPamagat, aralinPaglalarawan, aralinLayunin, fileUrls} = request.data;
  // validate the input
  if (!signInUser || !yunitId || !gradeLevel || !aralinNumero || !aralinPamagat) {
    console.error("Invalid arguments:", {signInUser, yunitId, gradeLevel, aralinNumero, aralinPamagat});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    const numeroSnapshot = await lessonsCollection(yunitId, gradeLevel).where("aralinNumero", "==", aralinNumero).get();
    if (!numeroSnapshot.empty) {
      throw new HttpsError("already-exists", "aralinNumero already exists");
    }
    const pamagatSnapshot = await lessonsCollection(yunitId, gradeLevel).where("aralinPamagat", "==", aralinPamagat).get();
    if (!pamagatSnapshot.empty) {
      throw new HttpsError("already-exists", "aralinPamagat already exists");
    }
    const lessonDocRef = lessonsCollection(yunitId, gradeLevel).doc();
    await lessonDocRef.set({
      classId,
      yunitId,
      yunitNumber,
      gradeLevel,
      aralinNumero,
      aralinPamagat,
      aralinPaglalarawan,
      aralinLayunin,
      isDraft: isDraft,
      createdBy: signInUser,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      fileUrls,
    });
    const statusLessonDocRef = classPublishedLessonsCollection(classId).doc(lessonDocRef.id);
    await statusLessonDocRef.set({
      yunitId,
      gradeLevel,
      isDraft: isDraft,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const createdLessonDoc = await lessonDocRef.get();
    // log activity
    await logUserActivity(signInUser, "Create lesson");
    return {
      success: true,
      lesson: {
        id: lessonDocRef.id,
        ...createdLessonDoc.data(),
        createdAt: createdLessonDoc.data()?.createdAt?.toDate?.().toISOString?.(),
        updatedAt: createdLessonDoc.data()?.updatedAt?.toDate?.().toISOString?.(),
      }};
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw new HttpsError("internal", "Error creating lesson");
  }
});

export const setUpdateLesson = onCall({memory: "1GiB"}, async (request: CallableRequest) => {
  const {signInUser, yunitId, lessonId, gradeLevel, aralinNumero,
    aralinPamagat, aralinPaglalarawan, aralinLayunin, fileUrls} = request.data;
  if (!signInUser || !yunitId || !lessonId || !aralinNumero || !aralinPamagat) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    if (aralinNumero) {
      const duplicateSnapshot = await lessonsCollection(yunitId, gradeLevel)
        .where("aralinNumero", "==", aralinNumero)
        .get();
      const isDuplicate = duplicateSnapshot.docs.some((doc) => doc.id !== lessonId);
      if (isDuplicate) {
        throw new HttpsError("already-exists", "This lesson number already exists for this yunit");
      }
    }
    if (aralinPamagat) {
      const duplicateSnapshot = await lessonsCollection(yunitId, gradeLevel)
        .where("aralinPamagat", "==", aralinPamagat)
        .get();
      const isDuplicate = duplicateSnapshot.docs.some((doc) => doc.id !== lessonId);
      if (isDuplicate) {
        throw new HttpsError("already-exists", "This lesson title already exists for this yunit");
      }
    }
    const firestoreUpdatePayload: Record<string, any> = {};
    if (aralinNumero) firestoreUpdatePayload.aralinNumero = aralinNumero;
    if (aralinPamagat) firestoreUpdatePayload.aralinPamagat = aralinPamagat;
    if (aralinPaglalarawan) firestoreUpdatePayload.aralinPaglalarawan = aralinPaglalarawan;
    if (aralinLayunin) firestoreUpdatePayload.aralinLayunin = aralinLayunin;
    if (fileUrls) firestoreUpdatePayload.fileUrls = fileUrls;
    firestoreUpdatePayload.updatedAt = FieldValue.serverTimestamp();
    await lessonsCollection(yunitId, gradeLevel).doc(lessonId).update(firestoreUpdatePayload);
    await logUserActivity(signInUser, "Update lesson");
    return {success: true};
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw new HttpsError("internal", "Error updating lesson");
  }
});

export const setDeleteLesson = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, yunitId, lessonId, gradeLevel} = request.data;
  if (!signInUser || !classId || !yunitId || !lessonId || !gradeLevel) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    const lessonDocRef = lessonsCollection(yunitId, gradeLevel).doc(lessonId);
    const lessonDoc = await lessonDocRef.get();
    const lessonData = lessonDoc.data();
    if (lessonData?.fileUrls && Array.isArray(lessonData.fileUrls)) {
      const bucket = admin.storage().bucket();
      await Promise.all(
        lessonData.fileUrls.map(async (url) => {
          try {
            const storagePath = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
            await bucket.file(storagePath).delete();
          } catch (err) {
            throw new HttpsError("internal", "Error deleting file from storage");
          }
        })
      );
    }
    await lessonDocRef.delete();
    await classPublishedLessonsCollection(classId).doc(lessonId).delete();
    const usersSnapshot = await usersCollection.get();
    await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const openLessonDocRef = userOpenLessonsCollection(userDoc.id).doc(lessonId);
        const openLessonDoc = await openLessonDocRef.get();
        if (openLessonDoc.exists) {
          await openLessonDocRef.delete();
        }
      })
    );
    await logUserActivity(signInUser, "Delete lesson");
    return {success: true};
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw new HttpsError("internal", "Error deleting lesson");
  }
});

export const setArchiveorUnarchiveLesson = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, yunitId, lessonId, gradeLevel, isArchived} = request.data;
  if (!signInUser || !classId || !yunitId || !lessonId) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    await lessonsCollection(yunitId, gradeLevel).doc(lessonId).update({
      isArchived: isArchived,
      updatedAt: FieldValue.serverTimestamp(),
    });
    await logUserActivity(signInUser, "Archive lesson");
    return {success: true};
  } catch (error) {
    console.error("Error archiving/unarchiving lesson:", error);
    throw new HttpsError("internal", "Error archiving/unarchiving lesson");
  }
});

export const setSaveLessonTimeSpent = onCall({memory: "1GiB"}, async (request: CallableRequest) => {
  const {signInUser, yunitId, lessonId, gradeLevel, timeSpent} = request.data;
  if (!signInUser || !yunitId || !lessonId || typeof timeSpent !== "number") {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    await lessonsCollection(yunitId, gradeLevel).doc(lessonId).set({
      totalTimeSpent: FieldValue.increment(timeSpent),
      timeSpentCount: FieldValue.increment(1),
    }, {merge: true});
    await userOpenLessonsCollection(signInUser).doc(lessonId).set({
      isOpen: true,
      yunitId,
      gradeLevel,
      totalTimeSpent: FieldValue.increment(timeSpent),
      timeSpentCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    return {success: true};
  } catch (error) {
    console.error("Error saving lesson time:", error);
    throw new HttpsError("internal", "Error saving lesson time");
  }
});

export const getAllQuizzes = onCall(async (request: CallableRequest) => {
  const {signInUser, classId} = request.data;
  if (!classId) {
    console.error("Invalid arguments:", {classId});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    // Get unlocked yunits for this class
    const unlockedSnap = await classesCollection.doc(classId).collection("unlockedYunits").get();
    const unlockedYunitIds = new Set(
      unlockedSnap.docs.filter((doc) => doc.data().unlocked === true).map((doc) => doc.id)
    );// Get all quizzes for this classId
    const quizzesSnapshot = await quizzesCollection.where("classId", "==", classId).get();
    // Filter quizzes to only those whose yunitId is unlocked for this class
    const filteredQuizzes = quizzesSnapshot.docs.filter((doc) => {
      const data = doc.data();
      // Only include quizzes for unlocked yunits
      return unlockedYunitIds.has(data.yunitId);
    });
    // Get all responses for this user for these quizzes
    const quizIds = filteredQuizzes.map((doc) => doc.id);
    const userResponses: Record<string, any> = {};
    if (signInUser) {
      const responseSnaps = await Promise.all(
        quizIds.map((quizId) => quizResponsesCollection(quizId).doc(signInUser).get())
      );
      responseSnaps.forEach((doc) => {
        const data = doc.data();
        if (doc.exists) {
          userResponses[doc.ref.parent.parent?.id || ""] = {
            ...data,
            submittedAt: data?.submittedAt?.toDate?.().toISOString?.(),
          };
        }
      });
    }
    // Group quizzes by yunitNumber and lessonNumber
    const grouped: Record<string, Record<string, any[]>> = {};
    for (const doc of filteredQuizzes) {
      const data = doc.data();
      const yunitNumber = data.yunitNumber;
      const lessonNumber = data.lessonNumber;
      if (!grouped[yunitNumber]) grouped[yunitNumber] = {};
      if (!grouped[yunitNumber][lessonNumber]) grouped[yunitNumber][lessonNumber] = [];
      grouped[yunitNumber][lessonNumber].push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString?.(),
        updatedAt: data.updatedAt?.toDate?.().toISOString?.(),
        response: userResponses[doc.id] || null,
      });
    }
    // Sort yunitNumbers and lessonNumbers
    const sortedYunitNumbers = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));
    const quizzesByYunit: any[] = [];
    for (const yunitNumber of sortedYunitNumbers) {
      const lessons = grouped[yunitNumber];
      const sortedLessonNumbers = Object.keys(lessons).sort((a, b) => Number(a) - Number(b));
      let previousCompleted = true;
      const lessonsArr = sortedLessonNumbers.map((lessonNumber, idx) => {
        let quizzes = lessons[lessonNumber];
        quizzes = quizzes.slice().sort((a, b) => {
          if (a.quizNumber !== undefined && b.quizNumber !== undefined) {
            return a.quizNumber - b.quizNumber;
          }
          const getQuizNum = (quiz: any) => {
            const match = quiz.category?.match(/Quiz\s*(\d+)/i);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getQuizNum(a) - getQuizNum(b);
        });
        const completedCount = quizzes.filter((q) => q.response).length;
        const isCompleted = completedCount === quizzes.length && quizzes.length > 0;
        const isUnlocked = idx === 0 || previousCompleted;
        previousCompleted = isCompleted;

        return {
          lessonNumber,
          quizzes,
          isCompleted,
          isUnlocked,
          progress: quizzes.length > 0 ? Math.round((completedCount / quizzes.length) * 100) : 0,
        };
      });
      quizzesByYunit.push({
        yunitNumber,
        lessons: lessonsArr,
      });
    }
    return {quizzesByYunit};
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw new HttpsError("internal", "Error fetching quizzes");
  }
});

export const getAllSeatworks = onCall(async (request: CallableRequest) => {
  const {signInUser, classId} = request.data;
  if (!classId) {
    console.error("Invalid arguments:", {classId});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    // Get unlocked yunits for this class
    const unlockedSnap = await classesCollection.doc(classId).collection("unlockedYunits").get();
    const unlockedYunitIds = new Set(
      unlockedSnap.docs.filter((doc) => doc.data().unlocked === true).map((doc) => doc.id)
    );// Get all seatworks for this classId
    const seatworksSnapshot = await seatworksCollection.where("classId", "==", classId).get();
    // Filter seatworks to only those whose yunitId is unlocked for this class
    const filteredSeatworks = seatworksSnapshot.docs.filter((doc) => {
      const data = doc.data();
      // Only include seatworks for unlocked yunits
      return unlockedYunitIds.has(data.yunitId);
    });
    // Get all responses for this user for these seatworks
    const seatworkIds = filteredSeatworks.map((doc) => doc.id);
    const userResponses: Record<string, any> = {};
    if (signInUser) {
      const responseSnaps = await Promise.all(
        seatworkIds.map((seatworkId) => seatworkResponsesCollection(seatworkId).doc(signInUser).get())
      );
      responseSnaps.forEach((doc) => {
        const data = doc.data();
        if (doc.exists) {
          userResponses[doc.ref.parent.parent?.id || ""] = {
            ...data,
            submittedAt: data?.submittedAt?.toDate?.().toISOString?.(),
          };
        }
      });
    }
    // Group seatworks by yunitNumber and lessonNumber
    const grouped: Record<string, Record<string, any[]>> = {};
    for (const doc of filteredSeatworks) {
      const data = doc.data();
      const yunitNumber = data.yunitNumber;
      const lessonNumber = data.lessonNumber;
      if (!grouped[yunitNumber]) grouped[yunitNumber] = {};
      if (!grouped[yunitNumber][lessonNumber]) grouped[yunitNumber][lessonNumber] = [];
      grouped[yunitNumber][lessonNumber].push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString?.(),
        updatedAt: data.updatedAt?.toDate?.().toISOString?.(),
        response: userResponses[doc.id] || null,
      });
    }
    // Sort yunitNumbers and lessonNumbers
    const sortedYunitNumbers = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));
    const seatworksByYunit: any[] = [];
    for (const yunitNumber of sortedYunitNumbers) {
      const lessons = grouped[yunitNumber];
      const sortedLessonNumbers = Object.keys(lessons).sort((a, b) => Number(a) - Number(b));
      let previousCompleted = true;
      const lessonsArr = sortedLessonNumbers.map((lessonNumber, idx) => {
        let seatworks = lessons[lessonNumber];
        seatworks = seatworks.slice().sort((a, b) => {
          if (a.seatworkNumber !== undefined && b.seatworkNumber !== undefined) {
            return a.seatworkNumber - b.seatworkNumber;
          }
          const getSeatworkNum = (seatwork: any) => {
            const match = seatwork.category?.match(/Seatwork\s*(\d+)/i);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getSeatworkNum(a) - getSeatworkNum(b);
        });
        const completedCount = seatworks.filter((s) => s.response).length;
        const isCompleted = completedCount === seatworks.length && seatworks.length > 0;
        const isUnlocked = idx === 0 || previousCompleted;
        previousCompleted = isCompleted;

        return {
          lessonNumber,
          seatworks,
          isCompleted,
          isUnlocked,
          progress: seatworks.length > 0 ? Math.round((completedCount / seatworks.length) * 100) : 0,
        };
      });
      seatworksByYunit.push({
        yunitNumber,
        lessons: lessonsArr,
      });
    }
    return {seatworksByYunit};
  } catch (error) {
    console.error("Error fetching seatworks:", error);
    throw new HttpsError("internal", "Error fetching seatworks");
  }
});

export const setCreateSeatworkorQuiz = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, yunitId, yunitNumber,
    lessonNumber, lessonId, gradeLevel, questions, category, type} = request.data;
  // validate the input
  if (!signInUser || !classId || !yunitId || !yunitNumber || !lessonId || !gradeLevel || !questions || !type) {
    console.error("Invalid arguments:", {signInUser, classId, yunitId, yunitNumber, lessonId, gradeLevel, questions, type});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    // Create a new quiz or seatwork document in Firestore
    if (type === "quiz") {
      const quizDocRef = quizzesCollection.doc();
      await quizDocRef.set({
        classId,
        yunitId,
        lessonId,
        yunitNumber,
        lessonNumber,
        gradeLevel,
        createdBy: signInUser,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        questions,
        category,
      });
    } else if (type === "seatwork") {
      const seatworkDocRef = seatworksCollection.doc();
      await seatworkDocRef.set({
        classId,
        yunitId,
        lessonId,
        yunitNumber,
        lessonNumber,
        gradeLevel,
        createdBy: signInUser,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        questions,
        category,
      });
    } else {
      throw new HttpsError("invalid-argument", "Invalid quiz type");
    }
    await classPublishedLessonsCollection(classId).doc(lessonId).update({
      isDraft: false,
      publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // log activity
    await logUserActivity(signInUser, "Create quiz");
    return {success: true};
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw new HttpsError("internal", "Error creating quiz");
  }
});

const awardBadge = async (uid: string, badgeId: string) => {
  const now = Date.now();
  await firestore.collection("users").doc(uid).collection("badges").doc(badgeId).set({
    awardedAt: FieldValue.serverTimestamp(),
  }, {merge: true});
  await realtimeDb.ref(`users/${uid}/badges/${badgeId}`).set({
    awardedAt: now,
  });
};

export const submitQuizAnswers = onCall(async (request: CallableRequest) => {
  const {signInUser, category, classId, quizId, answers,
    score, totalQuizScore, totalQuestions, gradeLevel} = request.data;
  // validate the input
  if (!signInUser || !quizId || !answers) {
    console.error("Invalid arguments:", {signInUser, quizId, answers});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    let progress = 0;
    if (typeof score === "number" && typeof totalQuizScore === "number" && totalQuizScore > 0) {
      progress = score / totalQuizScore;
    }
    await quizResponsesCollection(quizId)
      .doc(signInUser)
      .set({
        category,
        quizId,
        score,
        totalQuizScore,
        totalQuestions,
        answers,
        submittedAt: FieldValue.serverTimestamp(),
        progress,
        classId,
      });
    // if (Array.isArray(earnedBadges)) {
    //   for (const badgeId of earnedBadges) {
    //     await awardBadge(signInUser, badgeId);
    //   }
    // }
    const userDoc = await usersCollection.doc(signInUser).get();
    const userData = userDoc.data();
    const leaderboardRef = realtimeDb.ref(`leaderboard/quiz/${gradeLevel}/${signInUser}`);
    const snapshot = await leaderboardRef.once("value");
    const currentData = snapshot.val() || {};
    await leaderboardRef.update({
      uid: signInUser,
      displayName: userData?.displayName || null,
      photoURL: userData?.photoURL || null,
      gradeLevel: userData?.gradeLevel || null,
      quizTaken: (currentData.quizTaken || 0) + 1,
      totalScore: (currentData.totalScore || 0) + (typeof score === "number" ? score : 0),
      updatedAt: Date.now(),
    });
    // Log the activity
    await logUserActivity(signInUser, "Submit quiz answers");
    // Return success response
    return {success: true};
  } catch (error) {
    console.error("Error submitting quiz answers:", error);
    throw new HttpsError("internal", "Error submitting quiz answers");
  }
});

export const submitSeatworkAnswers = onCall(async (request: CallableRequest) => {
  const {signInUser, category, classId, seatworkId, answers,
    score, totalSeatworkScore, totalQuestions, gradeLevel} = request.data;
  // validate the input
  if (!signInUser || !seatworkId || !answers) {
    console.error("Invalid arguments:", {signInUser, seatworkId, answers});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    let progress = 0;
    if (typeof score === "number" && typeof totalSeatworkScore === "number" && totalSeatworkScore > 0) {
      progress = score / totalSeatworkScore;
    }
    await seatworkResponsesCollection(seatworkId)
      .doc(signInUser)
      .set({
        category,
        seatworkId,
        score,
        totalSeatworkScore,
        totalQuestions,
        answers,
        submittedAt: FieldValue.serverTimestamp(),
        progress,
        classId,
      });
    const userDoc = await usersCollection.doc(signInUser).get();
    const userData = userDoc.data();
    const leaderboardRef = realtimeDb.ref(`leaderboard/seatwork/${gradeLevel}/${signInUser}`);
    const snapshot = await leaderboardRef.once("value");
    const currentData = snapshot.val() || {};
    await leaderboardRef.update({
      uid: signInUser,
      displayName: userData?.displayName || null,
      photoURL: userData?.photoURL || null,
      gradeLevel: userData?.gradeLevel || null,
      seatworkTaken: (currentData.seatworkTaken || 0) + 1,
      totalScore: (currentData.totalScore || 0) + (typeof score === "number" ? score : 0),
      updatedAt: Date.now(),
    });
    // Log the activity
    await logUserActivity(signInUser, "Submit seatwork answers");
    // Return success response
    return {success: true};
  } catch (error) {
    console.error("Error submitting seatwork answers:", error);
    throw new HttpsError("internal", "Error submitting seatwork answers");
  }
});

const mapItemsByLesson = (snapshot: FirebaseFirestore.QuerySnapshot, idField = "lessonId") => {
  const byLesson: Record<string, string[]> = {};
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const lessonId = data[idField];
    if (!lessonId) return;
    if (!byLesson[lessonId]) byLesson[lessonId] = [];
    byLesson[lessonId].push(doc.id);
  });
  return byLesson;
};

const aggregateUserResponses = (
  responsesSnapshot: FirebaseFirestore.QuerySnapshot,
  idField: "quizId" | "seatworkId",
  scoreField: "totalQuizScore" | "totalSeatworkScore"
) => {
  const userResponses: Record<string, Set<string>> = {};
  let totalScore = 0;
  let totalPossible = 0;
  let totalCount = 0;
  responsesSnapshot.forEach((doc) => {
    const data = doc.data();
    const studentId = doc.id;
    if (data[idField] && typeof data.score === "number" && typeof data[scoreField] === "number") {
      if (!userResponses[studentId]) userResponses[studentId] = new Set();
      userResponses[studentId].add(data[idField]);
      totalScore += data.score;
      totalPossible += data[scoreField];
      totalCount++;
    }
  });
  return {userResponses, totalScore, totalPossible, totalCount};
};

export const getDescriptiveAnalytics = onCall(async () => {
  try {
    const responsesSnapshot = await firestore.collectionGroup("responses")
      .select("score", "submittedAt", "quizId", "seatworkId", "totalQuizScore", "totalSeatworkScore")
      .get();
    const quizzesSnapshot = await quizzesCollection.get();
    const seatworksSnapshot = await seatworksCollection.get();
    const quizzesByLesson = mapItemsByLesson(quizzesSnapshot);
    const seatworksByLesson = mapItemsByLesson(seatworksSnapshot);
    const {
      userResponses: userQuizResponses,
      totalScore: totalQuizScore,
      totalPossible: totalQuizPossible,
      totalCount: totalQuizzes,
    } = aggregateUserResponses(responsesSnapshot, "quizId", "totalQuizScore");
    const {
      userResponses: userSeatworkResponses,
      totalScore: totalSeatworkScore,
      totalPossible: totalSeatworkPossible,
      totalCount: totalSeatworks,
    } = aggregateUserResponses(responsesSnapshot, "seatworkId", "totalSeatworkScore");
    const lessonsCompleted: Record<string, Set<string>> = {};
    const allLessonIds = new Set([
      ...Object.keys(quizzesByLesson),
      ...Object.keys(seatworksByLesson),
    ]);
    const allStudentIds = Array.from(new Set([
      ...Object.keys(userQuizResponses),
      ...Object.keys(userSeatworkResponses),
    ]));
    const allLessonIdsArr = Array.from(allLessonIds);
    allStudentIds.forEach((studentId) => {
      const completedLessons = allLessonIdsArr.filter((lessonId) => {
        const quizIds = quizzesByLesson[lessonId] || [];
        const seatworkIds = seatworksByLesson[lessonId] || [];
        const hasAllQuizzes =
          quizIds.length === 0 ||
          (userQuizResponses[studentId] && quizIds.every((qid) => userQuizResponses[studentId].has(qid)));
        const hasAllSeatworks =
          seatworkIds.length === 0 ||
          (userSeatworkResponses[studentId] && seatworkIds.every((sid) => userSeatworkResponses[studentId].has(sid)));
        return hasAllQuizzes && hasAllSeatworks && (quizIds.length > 0 || seatworkIds.length > 0);
      });
      if (completedLessons.length > 0) {
        lessonsCompleted[studentId] = new Set(completedLessons);
      }
    });
    const daysToShow = 30;
    const now = new Date();
    const dailyActive: Record<string, number> = {};
    const usersSnap = await usersCollection.get();
    const dateCounts: Record<string, number> = {};
    usersSnap.docs.forEach((doc) => {
      const lastActiveAt = doc.data().lastActiveAt?.toDate?.();
      if (lastActiveAt) {
        const dateStr = lastActiveAt.toISOString().slice(0, 10);
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    });
    for (let i = 0; i < daysToShow; i++) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dateStr = day.toISOString().slice(0, 10);
      dailyActive[dateStr] = dateCounts[dateStr] || 0;
    }
    const yunitsSnap = await yunitCollection.get();
    const gradeLevels = Array.from({length: 6}, (_, i) => `Grade ${i + 1}`);
    const lessonQueries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
    yunitsSnap.docs.forEach((yunitDoc) => {
      const yunitId = yunitDoc.id;
      gradeLevels.forEach((gradeLevel) => {
        lessonQueries.push(
          lessonsCollection(yunitId, gradeLevel)
            .select("totalTimeSpent", "timeSpentCount", "aralinPamagat")
            .get()
        );
      });
    });
    const lessonsSnapshots = await Promise.all(lessonQueries);
    const avgTimeSpentPerLesson: Record<string, { avg: number; title: string }> = {};
    lessonsSnapshots.forEach((lessonsSnap) => {
      lessonsSnap.docs.forEach((lessonDoc) => {
        const lessonId = lessonDoc.id;
        const data = lessonDoc.data();
        const lessonTitle = data.aralinPamagat;
        const totalTimeSpent = data.totalTimeSpent || 0;
        const timeSpentCount = data.timeSpentCount || 0;
        avgTimeSpentPerLesson[lessonId] = {
          avg: timeSpentCount > 0 ? totalTimeSpent / timeSpentCount : 0,
          title: lessonTitle,
        };
      });
    });
    const lessonsCompletedPerStudent = Object.fromEntries(
      Object.entries(lessonsCompleted).map(([uid, lessons]) => [uid, lessons.size]),
    );
    const avgQuizScore = totalQuizPossible > 0 ? totalQuizScore / totalQuizPossible : 0;
    const avgSeatworkScore = totalSeatworkPossible > 0 ? totalSeatworkScore / totalSeatworkPossible : 0;
    const data = {
      dailyActive,
      lessonsCompletedPerStudent,
      avgQuizScore,
      avgSeatworkScore,
      totalQuizzes,
      totalSeatworks,
      avgTimeSpentPerLesson,
    };
    return {data};
  } catch (error) {
    console.error("Error fetching descriptive analytics:", error);
    throw new HttpsError("internal", "Error fetching descriptive analytics");
  }
});

const aggregateUserScores = (
  responsesSnap: FirebaseFirestore.QuerySnapshot,
  idField: "quizId" | "seatworkId",
  totalScoreField: "totalQuizScore" | "totalSeatworkScore"
) => {
  let totalScore = 0;
  let totalPossible = 0;
  let totalCount = 0;
  const scores: Record<string, { score: number; total: number }> = {};
  responsesSnap.forEach((doc) => {
    const data = doc.data();
    if (data[idField] && typeof data.score === "number" && typeof data[totalScoreField] === "number") {
      totalScore += data.score;
      totalPossible += data[totalScoreField];
      totalCount += 1;
      scores[doc.ref.parent.parent?.id || ""] = {
        score: data.score,
        total: data[totalScoreField],
      };
    }
  });
  return {totalScore, totalPossible, totalCount, scores};
};

export const getUserAnalytics = onCall(async (request: CallableRequest) => {
  const {signInUser} = request.data;
  if (!signInUser) {
    throw new HttpsError("invalid-argument", "Missing signInUser");
  }
  try {
    const responsesSnap = await firestore.collectionGroup("responses")
      .where("signInUser", "==", signInUser)
      .get();
    // Use helper for quizzes
    const {
      totalScore: totalQuizScore,
      totalPossible: totalQuizPossible,
      totalCount: totalQuizzes,
      scores: quizScores,
    } = aggregateUserScores(responsesSnap, "quizId", "totalQuizScore");
    // Use helper for seatworks
    const {
      totalScore: totalSeatworkScore,
      totalPossible: totalSeatworkPossible,
      totalCount: totalSeatworks,
      scores: seatworkScores,
    } = aggregateUserScores(responsesSnap, "seatworkId", "totalSeatworkScore");
    const avgQuizScore = totalQuizPossible > 0 ? totalQuizScore / totalQuizPossible : 0;
    const avgSeatworkScore = totalSeatworkPossible > 0 ? totalSeatworkScore / totalSeatworkPossible : 0;
    const userLessonsSnap = await userOpenLessonsCollection(signInUser).get();
    let totalTimeSpent = 0;
    userLessonsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (typeof data.totalTimeSpent === "number") {
        totalTimeSpent += data.totalTimeSpent;
      }
    });
    const data = {
      totalQuizzes,
      avgQuizScore,
      quizScores,
      totalSeatworks,
      avgSeatworkScore,
      seatworkScores,
      totalTimeSpent,
    };
    return {data};
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    throw new HttpsError("internal", "Error fetching user analytics");
  }
});

export const getAllAssignments = onCall(async (request: CallableRequest) => {
  const {signInUser, classId} = request.data;
  // validate the input
  if (!signInUser || !classId) {
    console.error("Invalid arguments:", {signInUser, classId});
    throw new HttpsError("invalid-argument", "Missing signInUser or classId");
  }
  try {
    const membersSnap = await membersCollection(classId).get();
    const memberIds = membersSnap.docs.map((doc) => doc.id);
    const totalMembers = memberIds.length;
    // get assignments from firestore
    const assignmentsSnapshot = await assignmentsCollection.orderBy("createdAt", "asc").get();
    const assignments = await Promise.all(assignmentsSnapshot.docs.map(async (doc) => {
      const assignmentId = doc.id;
      const submissionsSnap = await assignmentsSubmissionsCollection(assignmentId).get();
      const submittedIds = new Set(submissionsSnap.docs.map((d) => d.id));
      const submittedCount = memberIds.filter((id) => submittedIds.has(id)).length;
      // Get current user's submission (if any)
      const userSubmissionDoc = submissionsSnap.docs.find((d) => d.id === signInUser);
      const response = userSubmissionDoc ?
        {
          id: userSubmissionDoc.id,
          ...userSubmissionDoc.data(),
          submittedAt: userSubmissionDoc.data()?.submittedAt?.toDate?.().toISOString?.(),
        } : null;
      return {
        id: assignmentId,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.().toISOString?.(),
        updatedAt: doc.data().updatedAt?.toDate?.().toISOString?.(),
        response,
        submittedCount,
        totalMembers,
      };
    }));
    return {assignments};
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw new HttpsError("internal", "Error fetching assignments");
  }
});

export const getAllAssignmentSubmissions = onCall(async (request: CallableRequest) => {
  const {assignmentId, classId} = request.data;
  if (!assignmentId || !classId) {
    throw new HttpsError("invalid-argument", "Missing assignmentId or classId");
  }
  try {
    // Get all class members
    const membersSnap = await membersCollection(classId).get();
    const memberIds = membersSnap.docs.map((doc) => doc.id);
    // Get all submissions for the assignment
    const submissionsSnap = await assignmentsSubmissionsCollection(assignmentId).get();
    const submissionsMap = new Map(submissionsSnap.docs.map((doc) => [doc.id, doc]));

    // For each member, get their info and submission (if any)
    const submissions = await Promise.all(memberIds.map(async (uid) => {
      const userDoc = await usersCollection.doc(uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const submissionDoc = submissionsMap.get(uid);
      const submission = submissionDoc ?
        {
          id: submissionDoc.id,
          ...submissionDoc.data(),
          submittedAt: submissionDoc.data()?.submittedAt?.toDate?.().toISOString?.(),
        } : null;
      return {
        uid,
        displayName: userData?.displayName || "",
        photoURL: userData?.photoURL || "",
        submission,
      };
    }));
    return {submissions};
  } catch (error) {
    console.error("Error fetching assignment submissions:", error);
    throw new HttpsError("internal", "Error fetching assignment submissions");
  }
});

export const setCreateAssignment = onCall(async (request: CallableRequest) => {
  const {signInUser, classId, title, instructions, dueDate, totalPoints, attachments} = request.data;
  // validate the input
  if (!signInUser || !classId || !title || !instructions || !dueDate || !totalPoints) {
    console.error("Invalid arguments:", {signInUser, classId, title, instructions, dueDate, totalPoints});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    // Check if the assignment already exists
    const assignmentSnapshot = await assignmentsCollection
      .where("classId", "==", classId)
      .where("title", "==", title)
      .get();
    if (!assignmentSnapshot.empty) {
      console.error("Assignment already exists:", {title, classId});
      throw new HttpsError("already-exists", "Assignment already exists");
    }
    // Create a new assignment document in Firestore
    const assignmentDocRef = assignmentsCollection.doc();
    await assignmentDocRef.set({
      classId,
      title,
      instructions,
      dueDate,
      totalPoints,
      attachments,
      createdBy: signInUser,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // Log activity
    await logUserActivity(signInUser, "Create assignment");
    return {success: true};
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw new HttpsError("internal", "Error creating assignment");
  }
});

export const setSubmitAssignment = onCall(async (request: CallableRequest) => {
  const {signInUser, assignmentId, classId, attachments} = request.data;
  // validate the input
  if (!signInUser || !assignmentId || !classId) {
    console.error("Invalid arguments:", {signInUser, assignmentId, classId});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    // Check if the user has already submitted this assignment
    const responseDoc = await assignmentsSubmissionsCollection(assignmentId)
      .doc(signInUser)
      .get();
    if (responseDoc.exists) {
      console.error("User has already submitted this assignment:", {assignmentId, signInUser});
      throw new HttpsError("already-exists", "User has already submitted this assignment");
    }
    // Create a new submission document in Firestore
    const submissionDocRef = assignmentsSubmissionsCollection(assignmentId).doc(signInUser);
    await submissionDocRef.set({
      classId,
      attachments,
      submittedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // Log activity
    await logUserActivity(signInUser, "Submit assignment");
    return {success: true};
  } catch (error) {
    console.error("Error submitting assignment:", error);
    throw new HttpsError("internal", "Error submitting assignment");
  }
});

const extractScores = (
  userResponses: FirebaseFirestore.QueryDocumentSnapshot[],
  idField: "quizId" | "seatworkId",
  scoreField: "totalQuizScore" | "totalSeatworkScore"
) => {
  const scores: Array<{ id: string; score: number; total: number; category: string }> = [];
  let taken = 0;
  userResponses.forEach((doc) => {
    const data = doc.data();
    if (data[idField] && typeof data.score === "number" && typeof data[scoreField] === "number") {
      scores.push({
        id: data[idField],
        score: data.score,
        total: data[scoreField],
        category: data.category || "",
      });
      taken += 1;
    }
  });
  return {scores, taken};
};

// merge membersCollection with their responsesCollection to get all class members grade
export const getAllClassMembersGrade = onCall(async (request: CallableRequest) => {
  const {classId} = request.data;
  if (!classId) {
    console.error("Invalid arguments:", {classId});
    throw new HttpsError("invalid-argument", "Missing classId");
  }
  // Get all class members
  const membersSnap = await membersCollection(classId).get();
  const memberIds = membersSnap.docs.map((doc) => doc.id);
  // Get all responses
  const responsesSnap = await firestore.collectionGroup("responses")
    .where("classId", "==", classId)
    .get();
  // Prepare result for all members (even those without grades)
  const result = await Promise.all(
    memberIds.map(async (uid) => {
      const userDoc = await usersCollection.doc(uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const userResponses = responsesSnap.docs.filter((doc) => doc.id === uid);
      const {scores: quizScores, taken: quizzesTaken} = extractScores(userResponses, "quizId", "totalQuizScore");
      const {scores: seatworkScores, taken: seatworksTaken} = extractScores(userResponses, "seatworkId", "totalSeatworkScore");
      return {
        uid,
        displayName: userData?.displayName || "",
        photoURL: userData?.photoURL || "",
        quizzesTaken,
        quizScores,
        seatworksTaken,
        seatworkScores,
      };
    })
  );
  return {members: result};
});

export const getAllVideos = onCall(async (request: CallableRequest) => {
  const {lessonId, gradeLevel} = request.data;
  // validate the input
  if (!lessonId || !gradeLevel) {
    console.error("Invalid arguments:", {lessonId, gradeLevel});
    throw new HttpsError("invalid-argument", "Missing lessonId or gradeLevel");
  }
  try {
    // get videos from firestore
    const videosSnapshot = await videosCollection
      .where("gradeLevel", "==", gradeLevel)
      .where("lessonId", "==", lessonId)
      .orderBy("createdAt", "desc").get();
    const videos = videosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.().toISOString?.(),
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString?.(),
    }));
    return {videos};
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw new HttpsError("internal", "Error fetching videos");
  }
});

export const setUploadVideo = onCall(async (request: CallableRequest) => {
  const {signInUser, lessonId, gradeLevel, videoUrl, videoTitle, videoSize} = request.data;
  // validate the input
  if (!signInUser || !lessonId || !gradeLevel || !videoUrl || !videoTitle) {
    console.error("Invalid arguments:", {signInUser, lessonId, gradeLevel, videoUrl, videoTitle});
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    // Create a new video document in Firestore
    const videoDocRef = videosCollection.doc();
    await videoDocRef.set({
      gradeLevel,
      lessonId,
      videoUrl,
      videoTitle,
      videoSize,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    // log activity
    await logUserActivity(signInUser, "Upload video");
    return {success: true};
  } catch (error) {
    console.error("Error creating video:", error);
    throw new HttpsError("internal", "Error creating video");
  }
});

export const setDeleteVideo = onCall(async (request: CallableRequest) => {
  const {signInUser, videoId} = request.data;
  // validate the input
  if (!signInUser || !videoId) {
    console.error("Invalid arguments:", {signInUser, videoId});
    throw new HttpsError("invalid-argument", "Missing signInUser or videoId");
  }
  try {
    // delete video in firestore
    await videosCollection.doc(videoId).delete();
    // log activity
    await logUserActivity(signInUser, "Delete video");
    return {success: true};
  } catch (error) {
    console.error("Error deleting video:", error);
    throw new HttpsError("internal", "Error deleting video");
  }
});

const calculateCompletionStatus = (phrases: any[]) => {
  const totalPhrases = phrases.length;
  const completedPhrases = phrases.filter((p) => p.isContinue).length;
  return {
    isCompleted: completedPhrases === totalPhrases && totalPhrases > 0,
    progress: totalPhrases > 0 ? (completedPhrases / totalPhrases) * 100 : 0,
    completedPhrases,
    totalPhrases,
  };
};

export const getAllBigkasLevels = onCall(async (request: CallableRequest) => {
  const {signInUser, gradeLevel} = request.data;
  if (!signInUser || !gradeLevel) {
    throw new HttpsError("invalid-argument", "Missing signInUser or gradeLevel");
  }
  try {
    // Run all queries in parallel instead of sequentially
    const [yunitsSnapshot, bigkasSnapshot, userResponsesSnap] = await Promise.all([
      yunitCollection.get(),
      bigkasExercisesCollection.where("gradeLevel", "==", gradeLevel).get(),
      firestore.collectionGroup("responses").where("signInUser", "==", signInUser).get(),
    ]);
    if (yunitsSnapshot.empty) {
      throw new HttpsError("not-found", "No active yunits found");
    }
    const yunitNumbersSet = new Set(yunitsSnapshot.docs.map((doc) => doc.data().yunitnumber));
    // Filter by yunitNumbers and sort by levelNumber in memory
    const bigkasDocsByYunit: Record<string, any[]> = {};
    bigkasSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const yunitNumber = data.yunitNumber;
      if (yunitNumbersSet.has(yunitNumber)) {
        if (!bigkasDocsByYunit[yunitNumber]) {
          bigkasDocsByYunit[yunitNumber] = [];
        }
        bigkasDocsByYunit[yunitNumber].push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.().toISOString?.(),
          updatedAt: data.updatedAt?.toDate?.().toISOString?.(),
        });
      }
    });
    // Sort each yunit's levels by levelNumber
    Object.keys(bigkasDocsByYunit).forEach((yunitNumber) => {
      bigkasDocsByYunit[yunitNumber].sort((a, b) => a.levelNumber - b.levelNumber);
    });
    // Map: {parentId: responseData}
    const userResponsesMap: Record<string, any> = {};
    userResponsesSnap.docs.forEach((doc) => {
      const parentId = doc.ref.parent.parent?.id;
      if (!parentId) return;
      const data = doc.data();
      if (
        !userResponsesMap[parentId] ||
        (data.createdAt?.toDate?.() > userResponsesMap[parentId].createdAt?.toDate?.())
      ) {
        userResponsesMap[parentId] = {
          ...data,
          id: doc.id,
        };
      }
    });
    const levelsByYunit: Record<string, any[]> = {};
    Object.keys(bigkasDocsByYunit).forEach((yunitNumber) => {
      levelsByYunit[yunitNumber] = bigkasDocsByYunit[yunitNumber].map((doc, levelIndex) => {
        if (userResponsesMap[doc.id]) {
          const userResponse = userResponsesMap[doc.id];
          const mergedDoc = {...doc};
          // Calculate completion for each mode
          const modeCompletions: Record<string, any> = {};
          ["easy", "normal", "hard"].forEach((mode) => {
            if (userResponse[mode]) {
              const parentPhrases = mergedDoc[mode]?.phrases || [];
              const responsePhrases = userResponse[mode] || [];
              const responsePhrasesMap = new Map();
              responsePhrases.forEach((phrase: any) => {
                if (phrase.text) {
                  responsePhrasesMap.set(phrase.text.toLowerCase().trim(), phrase);
                }
              });
              const mergedPhrases = parentPhrases.map((parentPhrase: any) => {
                const responsePhrase = responsePhrasesMap.get(parentPhrase.text?.toLowerCase().trim());
                if (responsePhrase) {
                  return {
                    ...parentPhrase,
                    ...responsePhrase,
                  };
                }
                return parentPhrase;
              });
              mergedDoc[mode] = {
                ...mergedDoc[mode],
                phrases: mergedPhrases,
              };
              modeCompletions[mode] = calculateCompletionStatus(mergedPhrases);
            } else if (mergedDoc[mode]) {
              modeCompletions[mode] = calculateCompletionStatus(mergedDoc[mode].phrases || []);
            }
          });
          // Calculate overall level completion
          const allModesCompleted = ["easy", "normal", "hard"].every((mode) =>
            modeCompletions[mode]?.isCompleted || false
          );
          // Check if level should be unlocked
          const isUnlocked = levelIndex === 0; // First level always unlocked

          return {
            ...mergedDoc,
            id: doc.id,
            progressId: userResponse.id,
            modeCompletions,
            isCompleted: allModesCompleted,
            isUnlocked: isUnlocked,
          };
        }
        // No user response - calculate from parent data only
        const modeCompletions: Record<string, any> = {};
        ["easy", "normal", "hard"].forEach((mode) => {
          if (doc[mode]) {
            modeCompletions[mode] = calculateCompletionStatus(doc[mode].phrases || []);
          }
        });
        const isUnlocked = levelIndex === 0; // Only first level unlocked if no progress

        return {
          ...doc,
          modeCompletions,
          isCompleted: false,
          isUnlocked: isUnlocked,
        };
      });
      levelsByYunit[yunitNumber].forEach((level, index, arr) => {
        if (index > 0) {
          const previousLevel = arr[index - 1];
          level.isUnlocked = !!(previousLevel && previousLevel.isCompleted);
        }
      });
    });
    return {levelsByYunit};
  } catch (error) {
    console.error("Error fetching bigkas levels:", error);
    throw new HttpsError("internal", "Error fetching bigkas levels");
  }
});

const processedModeData = (mode: any, phrases: any[]) => ({
  mode: mode.mode,
  basePoints: mode.basePoints,
  phrases,
  phraseCount: phrases.length,
  totalWords: phrases.reduce((sum: number, p: any) => sum + (p.wordCount || 0), 0),
  totalPoints: phrases.reduce((sum: number, p: any) => sum + (p.points || 0), 0),
});

export const setAddNewPhrases = onCall(async (request: CallableRequest) => {
  const {signInUser, phrases} = request.data;
  if (!signInUser || !phrases) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    const modes = ["easy", "normal", "hard"];
    // 1. Build query conditions for batch retrieval
    const queryConditions = phrases.map((level: any) => ({
      yunitNumber: level.yunitNumber,
      levelNumber: level.levelNumber,
      gradeLevel: level.gradeLevel,
    }));
    // 2. Get all existing documents in parallel
    const existingDocsMap = new Map();
    if (queryConditions.length <= 10) {
      const uniqueGradeLevels = [...new Set(phrases.map((p: any) => p.gradeLevel))];
      const existingDocsPromises = uniqueGradeLevels.map((gradeLevel) =>
        bigkasExercisesCollection.where("gradeLevel", "==", gradeLevel).get()
      );
      const existingDocsSnapshots = await Promise.all(existingDocsPromises);
      existingDocsSnapshots.forEach((snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const key = `${data.yunitNumber}-${data.levelNumber}-${data.gradeLevel}`;
          existingDocsMap.set(key, {ref: doc.ref, data});
        });
      });
    }
    // 3. Process all operations in a single batch
    const batch = firestore.batch();
    for (const level of phrases) {
      const {yunitNumber, levelNumber, gradeLevel} = level;
      const key = `${yunitNumber}-${levelNumber}-${gradeLevel}`;
      const existingDoc = existingDocsMap.get(key);
      if (existingDoc) {
        const updateData: any = {updatedAt: FieldValue.serverTimestamp()};
        modes.forEach((mode) => {
          if (level[mode]) {
            const newPhrases = level[mode].phrases.filter((phrase: any) => phrase.text.trim().length > 0);
            if (existingDoc.data[mode]) {
              const existingPhrases = existingDoc.data[mode].phrases || [];
              const existingTexts = new Set(existingPhrases.map((p: any) => p.text.toLowerCase()));
              const uniqueNewPhrases = newPhrases.filter((p: any) => !existingTexts.has(p.text.toLowerCase()));
              if (uniqueNewPhrases.length > 0) {
                const mergedPhrases = [...existingPhrases, ...uniqueNewPhrases];
                updateData[mode] = processedModeData(level[mode], mergedPhrases);
              }
            } else {
              updateData[mode] = processedModeData(level[mode], newPhrases);
            }
          }
        });
        if (Object.keys(updateData).length > 1) {
          batch.update(existingDoc.ref, updateData);
        }
      } else {
        // Create new document
        const newDocRef = bigkasExercisesCollection.doc();
        const newDocData: any = {
          yunitNumber,
          levelNumber,
          gradeLevel,
          createdBy: signInUser,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        modes.forEach((mode) => {
          if (level[mode]) {
            const phrases = level[mode].phrases.filter((phrase: any) => phrase.text.trim().length > 0);
            newDocData[mode] = processedModeData(level[mode], phrases);
          }
        });
        batch.set(newDocRef, newDocData);
      }
    }
    await batch.commit();
    await logUserActivity(signInUser, "Add new phrases to bigkas");
    return {success: true};
  } catch (error) {
    console.error("Error adding new phrases to bigkas:", error);
    throw new HttpsError("internal", "Error adding new phrases to bigkas");
  }
});

export const setStartPlayingBigkas = onCall(async (request: CallableRequest) => {
  const {signInUser, bigkasId, levelNumber, mode} = request.data;
  // validate the input
  if (!signInUser || !bigkasId || !levelNumber || !mode) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    const bigkasDocRef = bigkasSaveProgressCollection(bigkasId).doc();
    await bigkasDocRef.set({
      signInUser,
      startedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await logUserActivity(signInUser, `Started playing Bigkas Level ${levelNumber} - ${mode}`);
    return {id: bigkasDocRef.id};
  } catch (error) {
    console.error("Error starting bigkas:", error);
    throw new HttpsError("internal", "Error starting bigkas");
  }
});

export const setSaveProgressBigkas = onCall(async (request: CallableRequest) => {
  const {signInUser, bigkasId, progressId, levelNumber, mode, phrases,
    userTotalPoints, userTotalWords, totalWords} = request.data;
  // validate the input
  if (!signInUser || !bigkasId || !progressId || !levelNumber || !mode || !phrases) {
    throw new HttpsError("invalid-argument", "Missing required fields");
  }
  try {
    const bigkasDocRef = bigkasSaveProgressCollection(bigkasId).doc(progressId);
    await bigkasDocRef.set({
      signInUser,
      [mode]: phrases,
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    const userDoc = await usersCollection.doc(signInUser).get();
    const userData = userDoc.data();
    const leaderboardRef = realtimeDb.ref(`leaderboard/bigkas/${bigkasId}/${mode}/${signInUser}`);
    await leaderboardRef.set({
      uid: signInUser,
      displayName: userData?.displayName || null,
      photoURL: userData?.photoURL || null,
      gradeLevel: userData?.gradeLevel || null,
      levelNumber: parseInt(levelNumber),
      mode,
      totalScore: userTotalPoints || 0,
      totalWords,
      correctWords: userTotalWords || 0,
      accuracy: userTotalWords > 0 ? Math.round((userTotalWords / totalWords) * 100) : 0,
      completedAt: Date.now(),
      timestamp: Date.now(),
    });
    await logUserActivity(signInUser, `Saved progress for Bigkas Level ${levelNumber} - ${mode}`);
    return {success: true};
  } catch (error) {
    console.error("Error saving bigkas progress:", error);
    throw new HttpsError("internal", "Error saving bigkas progress");
  }
});
