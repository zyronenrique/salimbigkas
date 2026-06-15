import * as admin from "firebase-admin";
import {getDatabase} from "firebase-admin/database";

export const initAdmin = admin.initializeApp();
export const realtimeDb = getDatabase();

export const firestore = admin.firestore();
export const usersCollection = firestore.collection("users");
export const userClassesCollection = (uid: string) => {
  return usersCollection.doc(uid).collection("classes");
};
export const userOpenLessonsCollection = (uid: string) => {
  return usersCollection.doc(uid).collection("openLessons");
};
export const userAssignmentsCollection = (uid: string) => {
  return usersCollection.doc(uid).collection("assignments");
};
export const classesCollection = firestore.collection("classes");
export const membersCollection = (classId: string) => {
  return classesCollection.doc(classId).collection("members");
};
export const classPublishedLessonsCollection = (classId: string) => {
  return classesCollection.doc(classId).collection("publishedLessons");
};
export const assignmentsCollection = firestore.collection("assignments");
export const assignmentsSubmissionsCollection = (assignmentId: string) => {
  return assignmentsCollection.doc(assignmentId).collection("submissions");
};
export const yunitCollection = firestore.collection("yunits");
export const lessonsCollection = (yunitId: string, gradeLevel: string) => {
  return yunitCollection.doc(yunitId).collection(gradeLevel);
};
export const quizzesCollection = firestore.collection("quizzes");
export const quizResponsesCollection = (quizId: string) => {
  return quizzesCollection.doc(quizId).collection("responses");
};
export const seatworksCollection = firestore.collection("seatworks");
export const seatworkResponsesCollection = (seatworkId: string) => {
  return seatworksCollection.doc(seatworkId).collection("responses");
};
export const videosCollection = firestore.collection("videos");
export const videoResponsesCollection = (videoId: string) => {
  return videosCollection.doc(videoId).collection("responses");
};
export const bigkasExercisesCollection = firestore.collection("bigkasExercises");
export const bigkasSaveProgressCollection = (bigkasId: string) => {
  return bigkasExercisesCollection.doc(bigkasId).collection("responses");
};
