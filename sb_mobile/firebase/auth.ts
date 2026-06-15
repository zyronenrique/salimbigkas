// firebaseAuth.tsx
import { GoogleSignin, isCancelledResponse, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { 
  auth,
  firestore, 
  storage, 
  database, 
  GoogleAuthProvider,
  FirebaseAuthTypes, 
  FirebaseFirestoreTypes,
  getDoc, 
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  dbRef,
  get,
  set,
  update,
  storageRef,
  uploadBytes,
  getDownloadURL,
} from "./firebase";
import { doCheckUserProfileDuplicates, doSetUserClaims } from "@/api/functions";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  updateEmail,
  updateProfile,
  verifyBeforeUpdateEmail,
  signInWithCredential,
} from "@react-native-firebase/auth";
import { useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';
import { checkUserStatus } from '@/utils/helpers';
// Additional types
interface AdditionalUserData {
  [key: string]: any;
}

interface ProfileUpdate {
  displayName?: string | null;
  photoURL?: string | null;
}

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const emailKey = email.replace(/\./g, ',');
    const userEmailRef = dbRef(database, `userEmails/${emailKey}`);
    const snapshot = await get(userEmailRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error;
  }
};

// Create a new user
export const doCreateUserWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string,
  role: string,
  gradeLevels: string[] | null = null,
  gradeLevel: string | null = null,
): Promise<{ success: boolean }> => {
  const userCredential: FirebaseAuthTypes.UserCredential = await createUserWithEmailAndPassword(
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
): Promise<{ success: boolean }> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;
  if (!user.emailVerified) {
    await doSendEmailVerification();
    return { success: false };
  }
  await createUserDocumentfromAuth(user);
  return { success: true };
};

export const doGoogleSignIn = async (): Promise<{ success: boolean }> => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      const idToken = response.data.idToken;
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      const tokenResult = await user.getIdTokenResult();
      const currentRole = typeof tokenResult.claims.role === "string" ? tokenResult.claims.role : null;
      const currentGradeLevel = typeof tokenResult.claims.gradeLevel === "string" ? tokenResult.claims.gradeLevel : null;
      const currentGradeLevels = Array.isArray(tokenResult.claims.gradeLevels) ? tokenResult.claims.gradeLevels : null;
      const currentClassId = typeof tokenResult.claims.classId === "string" ? tokenResult.claims.classId : null;
      let responseClaims;
      if (!currentRole) {
        responseClaims = await doSetUserClaims(user.uid, "Student", null, null, null) as any;
      } else {
        responseClaims = await doSetUserClaims(
          user.uid,
          currentRole,
          currentRole === "Admin" || currentRole === "Teacher"
            ? currentGradeLevels
            : null,
          currentRole === "Student"
            ? currentGradeLevel
            : null,
          currentClassId
        ) as any;
      }
      if (responseClaims?.success) {
        try {
          await createUserDocumentfromAuth(user);
          await checkUserStatus();
        } catch (error) {
          Toast.show({
            type: ('custom' as any),
            text1: "Google Sign-In Error",
            text2: "An error occurred while creating user document.",
            autoHide: false,
            progressBarColor: '#8a3903',
          })
        }
      }
    } else if (isCancelledResponse(response)) {
      Toast.show({
        type: ('custom' as any),
        text1: "Google Sign-In Error",
        text2: response.type === 'cancelled' ? "Sign-in was cancelled." : "Sign-in is already in progress.",
        autoHide: false,
        progressBarColor: '#8a3903',
      })
      return { success: false };
    }
    return { success: true };
  } catch (error: any) {
    GoogleSignin.revokeAccess();
    GoogleSignin.signOut();
    const code = (error as any).code;
    let errorMsg = "";
    const router = useRouter();
    if (code === "auth/user-disabled") {
      router.replace('/signInWithEmailPassword/restrictedPage');
      return { success: false };
    } else if (code === "auth/too-many-requests") {
      errorMsg = "Too many unsuccessful login attempts. Please try again later.";
    } else if (isErrorWithCode(error)) {
      switch (code) {
        case statusCodes.IN_PROGRESS:
          errorMsg = "Sign-in is already in progress.";
          break;
        case statusCodes.SIGN_IN_CANCELLED:
          errorMsg = "Sign-in was cancelled.";
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          errorMsg = "Play services are not available.";
          break;
        case statusCodes.SIGN_IN_REQUIRED:
          errorMsg = "Sign-in is required.";
          break;
        default:
          errorMsg = "An unknown error occurred during Google Sign-In.";
          break;
      }
    } else {
      errorMsg = `An error occurred during Google Sign-In. Please try again.`;
    }
    Toast.show({
      type: ('custom' as any),
      text1: "Google Sign-In Error",
      text2: errorMsg,
      autoHide: false,
      progressBarColor: '#8a3903',
    })
    return { success: false };
  }
};

// Auth state listener
export const onAuthStateChange = (
  callback: (user: FirebaseAuthTypes.User | null) => void
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
  userAuth: FirebaseAuthTypes.User | null,
  additionalData: AdditionalUserData = {},
): Promise<FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> | void> => {
  if (!userAuth) return;
  const realtimeUserRef = dbRef(database, `users/${userAuth.uid}`);
  const snapshot = await get(realtimeUserRef);
  const userRef = doc(firestore, "users", userAuth.uid);
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
    delete defaultData.gradeLevel;
  } else {
    delete defaultData.gradeLevels;
    defaultData.gradeLevel = tokenResult.claims.gradeLevel || null;
  }
  if (!userDoc.exists() || !snapshot.exists()) {
    await setDoc(userRef, defaultData, { merge: true });
    await set(realtimeUserRef, { ...defaultData, lastActiveAt: serverTimestamp() });
    const emailKey = userAuth.email ? userAuth.email.replace(/\./g, ',') : null;
    if (emailKey) {
      const userEmailRef = dbRef(database, `userEmails/${emailKey}`);
      await set(userEmailRef, { uid: userAuth.uid });
    }
  } else {
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

const requireCurrentUser = (): FirebaseAuthTypes.User => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user.");
  return user;
};

// Send email verification
export const doSendEmailVerification = (): Promise<void> => {
  const user = requireCurrentUser();
  return sendEmailVerification(user, {
    url: `https://salimbigkas.web.app/home`,
  });
};

export const isEmailVerifiedInRealtimeDB = async (): Promise<boolean> => {
  const user = requireCurrentUser();
  const userRef = dbRef(database, `users/${user.uid}/emailVerified`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() === true : false;
};

// Sign out
export const doSignOut = (): Promise<void> => {
  return auth.signOut();
};

// Password reset
export const doPasswordReset = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
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
    await deleteDoc(doc(`users/${user.uid}`));
    await dbRef(database, `users/${user.uid}`).remove();
    const emailKey = user.email ? user.email.replace(/\./g, ',') : null;
    if (emailKey) {
      const userEmailRef = dbRef(database, `userEmails/${emailKey}`);
      await userEmailRef.remove();
    }
    await deleteUser(user);
  } catch (error) {
    console.error("Error during account deletion:", error);
    throw error;
  }
};

// Update email
export const doUpdateEmail = async (newEmail: string): Promise<void> => {
  const user = requireCurrentUser();
  await updateEmail(user, newEmail);
};

// Update profile
export const doVerifyBeforeUpdateEmail = async (newEmail: string) => {
  const user = requireCurrentUser();
  try {
    await verifyBeforeUpdateEmail(user, newEmail, {
      url: `https://salimbigkas.web.app/home`,
      handleCodeInApp: true,
    });
    const userRef = doc(firestore, "users", user.uid);
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

  const userRef = doc(firestore, "users", user.uid);
  await setDoc(userRef, {
    displayName,
    email,
    phoneNumber,
    photoURL,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const syncEmailVerifiedToRealtimeDB = async (user: FirebaseAuthTypes.User) => {
  const userRef = dbRef(database, `users/${user.uid}/emailVerified`);
  await set(userRef, user.emailVerified);
  await createUserDocumentfromAuth(user, {});
};


