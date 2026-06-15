// firebaseAuth.tsx
import { auth, db, get, update, storageRef, uploadBytes, getDownloadURL, storage, database, dbRef, set } from "./firebase";
import { doSetUserClaims, doCheckUserProfileDuplicates } from "../api/functions";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithRedirect,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  // updateEmail,
  verifyBeforeUpdateEmail,
  updateProfile,
  // updatePhoneNumber,
  // PhoneAuthProvider,
  // PhoneAuthCredential,
  // RecaptchaVerifier,
  User,
  AuthProvider,
  UserCredential,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  // UserProfile
} from "firebase/auth";
import {
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  DocumentReference,
  DocumentData,
} from "firebase/firestore";
interface AdditionalUserData {
  [key: string]: any;
}

// Initialize Firebase Authentication and Firestore
const applyPersistence = async (rememberMe: boolean = true): Promise<void> => {
  const persistence = rememberMe
    ? browserLocalPersistence
    : browserSessionPersistence;
  await setPersistence(auth, persistence);
};

// Create a new user
export const doCreateUserWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string,
  rememberMe: boolean,
  role: string,
  gradeLevels: string[] | null = null,
  gradeLevel: string | null = null,
): Promise<{ success: boolean }> => {
  await applyPersistence(rememberMe);
  const userCredential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;
  await updateProfile(user, { displayName: name });
  await createUserDocumentfromAuth(user, { 
    displayName: name,
    [role === "Admin" || role === "Teacher" ? 'gradeLevels' : 'gradeLevel']: role === "Admin" || role === "Teacher" ? gradeLevels : gradeLevel,
    role: role,
  });
  const response = await doSetUserClaims(user.uid, role, gradeLevels, gradeLevel) as any;
  if (response?.success) {
    try {
      await doSendEmailVerification();
    } catch (error) {
      console.error("Error sending email verification:", error);
    }
  }
  return {success: true};
};

// Sign in user
export const doSignInWithEmailAndPassword = async (
  email: string,
  password: string,
  rememberMe: boolean = true,
): Promise<{ success: boolean }> => {
  await applyPersistence(rememberMe);
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;
  if (!user.emailVerified) {
    await doSendEmailVerification();
  }
  await createUserDocumentfromAuth(user);
  return {success: true};
};

// Sign in with provider
const doSignInWithProvider = async (
  provider: AuthProvider,
  rememberMe: boolean = true,
): Promise<void> => {
  await applyPersistence(rememberMe);
  await signInWithRedirect(auth, provider);
};

// Google popup
export const doSignInWithGoogle = async (
  rememberMe: boolean = true,
): Promise<{success: boolean}> => {
  const provider = new GoogleAuthProvider();
  await doSignInWithProvider(provider, rememberMe)
  return {success: true};
};

// Facebook sign-in
export const doSignInWithFacebook = async (
  rememberMe: boolean = true,
): Promise<{success: boolean}> => {
  const provider = new FacebookAuthProvider();
  await doSignInWithProvider(provider, rememberMe);
  return {success: true};
};

// Apple sign-in
export const doSignInWithApple = async (
  rememberMe: boolean = true,
): Promise<void> => {
  const provider = new OAuthProvider("apple.com");
  await doSignInWithProvider(provider, rememberMe);
};

// Microsoft sign-in
export const doSignInWithMicrosoft = async (
  rememberMe: boolean = true,
): Promise<void> => {
  const provider = new OAuthProvider("microsoft.com");
  provider.setCustomParameters({ prompt: "consent" });
  await doSignInWithProvider(provider, rememberMe);
};

// Auth state listener
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await createUserDocumentfromAuth(user);
        callback(user);
      } catch (error) {
        console.error('Error updating user document on auth state change:', error);
        callback(user);
      }
    } else {
      callback(null);
    }
  });
};

// Create or update Firestore document
export const createUserDocumentfromAuth = async (
  userAuth: User | null,
  additionalData: AdditionalUserData = {},
): Promise<DocumentReference<DocumentData> | void> => {
  if (!userAuth) return;
  const realtimeUserRef = dbRef(database, `users/${userAuth.uid}`);
  const snapshot = await get(realtimeUserRef);
  const userRef = doc(db, "users", userAuth.uid);
  const userDoc = await getDoc(userRef);
  const tokenResult = await userAuth.getIdTokenResult();
  const role = tokenResult.claims.role || "Student";
  let defaultData: Record<string, any> = {
    disabled: true,
    role,
    displayName: userAuth.displayName,
    email: userAuth.email,
    emailVerified: userAuth.emailVerified || false,
    photoURL: userAuth.photoURL || null,
    phoneNumber: userAuth.phoneNumber || null,
    metadata: {
      creationTime: userAuth.metadata.creationTime,
      lastSignInTime: userAuth.metadata.lastSignInTime,
    },
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    ...additionalData,
  };
  if (role === "Admin" || role === "Teacher") {
    defaultData.gradeLevels = tokenResult.claims.gradeLevels || null;
    delete defaultData.gradeLevel; // Admins and Teachers do not have a specific grade level
  } else {
    delete defaultData.gradeLevels;
    defaultData.gradeLevel = tokenResult.claims.gradeLevel || null;
  }
  if (!userDoc.exists() && !snapshot.exists()) {
    await setDoc(userRef, defaultData, { merge: true });
    await set(realtimeUserRef, { ...defaultData, lastActiveAt: serverTimestamp() });
    const emailKey = userAuth.email ? userAuth.email.replace(/\./g, ',') : null;
    if (emailKey) {
      const userEmailRef = dbRef(database, `userEmails/${emailKey}`);
      await set(userEmailRef, { uid: userAuth.uid });
    }
  } else {
    // Only update fields that should be refreshed, but DO NOT overwrite gradeLevel/gradeLevels, role, etc.
    const updates: Record<string, any> = {
      displayName: userAuth.displayName || null,
      emailVerified: userAuth.emailVerified || false,
      photoURL: userAuth.photoURL || null,
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    };
    await setDoc(userRef, updates, { merge: true });
    await update(realtimeUserRef, updates);
  }
  return userRef;
};

const requireCurrentUser = (): User => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user.");
  return user;
};

// Send email verification
export const doSendEmailVerification = (): Promise<void> => {
  const user = requireCurrentUser();
  return sendEmailVerification(user, {
    url: `${window.location.origin}/home`,
  });
};

// Sign out
export const doSignOut = (): Promise<void> => {
  return auth.signOut();
};

// Password reset
export const doPasswordReset = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
  // const userRef = doc(db, 'users', email);
  // const snapshot = await getDoc(userRef);

  // if (snapshot.exists()) {
  //   const userData = snapshot.data();
  //   if (!userData.emailVerified) {
  //     await doSendEmailVerification();
  //   } else {
  //     return sendPasswordResetEmail(auth, email);
  //   }
  // } else {
  //   throw new Error('User does not exist.');
  // }
};

// Change password
export const doPasswordChange = (password: string): Promise<void> => {
  const user = requireCurrentUser();
  return updatePassword(user, password);
};

// Reauthenticate with email
export const doReauthenticateWithEmail = async (
  email: string,
  password: string,
): Promise<void> => {
  const credential = EmailAuthProvider.credential(email, password);
  const user = requireCurrentUser();
  await reauthenticateWithCredential(user, credential);
};

// Delete user
export const doDeleteUser = async (
  email: string,
  password: string,
): Promise<void> => {
  const user = requireCurrentUser();
  try {
    await doReauthenticateWithEmail(email, password);
    await setDoc(doc(db, "users", user.uid), {}, { merge: false });
    await deleteUser(user);
  } catch (error) {
    console.error("Error during account deletion:", error);
    throw error;
  }
};

export const doVerifyBeforeUpdateEmail = async (newEmail: string) => {
  const user = requireCurrentUser();
  try {
    await verifyBeforeUpdateEmail(user, newEmail, {
      url: `${window.location.origin}/home`,
      handleCodeInApp: true,
    });
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { email: newEmail }, { merge: true });
    const newEmailKey = newEmail.replace(/\./g, ',');
    const newUserEmailRef = dbRef(database, `userEmails/${newEmailKey}`);
    await set(newUserEmailRef, { uid: user.uid });
  } catch (error) {
    console.error("Error updating email:", error);
    throw error;
  }
};

export const doUpdateUserProfile = async (
  {
    displayName,
    email,
    phoneNumber,
    photoFile,
  }: {
    displayName: string;
    email: string;
    phoneNumber: string;
    photoFile?: File | null;
  }
): Promise<void> => {
  const user = requireCurrentUser();

  try {
    await doCheckUserProfileDuplicates(user.uid, displayName, phoneNumber);
  } catch (err: any) {
    throw err;
  }
  let photoURL = user.photoURL || null;
  if (photoFile) {
    const photoRef = storageRef(storage, `profilePhotos/${user.uid}/${photoFile.name}`);
    await uploadBytes(photoRef, photoFile);
    photoURL = await getDownloadURL(photoRef);
  }

  // if (phoneNumber && phoneNumber !== user.phoneNumber) {
  //   const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
  //   const provider = new PhoneAuthProvider(auth);
  //   const verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
  //   const verificationCode = window.prompt("Enter the verification code sent to your phone:");
  //   if (!verificationCode) throw new Error("Verification code is required.");
  //   const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
  //   await updatePhoneNumber(user, credential);
  // }

  // Update Firestore document
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    displayName,
    email,
    phoneNumber,
    photoURL,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const syncEmailVerifiedToRealtimeDB = async (user: User) => {
  const userRef = dbRef(database, `users/${user.uid}/emailVerified`);
  await set(userRef, user.emailVerified);
};

