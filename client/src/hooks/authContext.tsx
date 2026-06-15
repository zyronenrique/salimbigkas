import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { auth, database, dbRef, get } from "../firebase/firebase";
import { GoogleAuthProvider, User } from "firebase/auth";
import { createUserDocumentfromAuth, onAuthStateChange } from "../firebase/auth";
import LoadingDots from "../components/Icons/LoadingDots";

// Define the shape of the context value
interface AuthContextType {
  userLoggedIn: boolean;
  setUserLoggedIn: Dispatch<SetStateAction<boolean>>;
  isEmailUser: boolean;
  isGoogleUser: boolean;
  isAppleUser: boolean;
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  role: string | null;
  gradeLevels: string[] | null;
  gradeLevel: string | null;
  classId: string | null;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  loadingDot: boolean;
  setLoadingDot: Dispatch<SetStateAction<boolean>>;
  refreshUser: () => Promise<void>;
}

// Create a context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State variables to manage user authentication and roles
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [gradeLevels, setGradeLevels] = useState<string[] | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isAppleUser, setIsAppleUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDot, setLoadingDot] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(initializeUser);
    return unsubscribe;
  }, []);

  // Function to initialize user state and fetch additional data
  async function initializeUser(user: User | null) {
    try {
      if (user) {
        setCurrentUser(user); // Set the current user
        await user.getIdToken(true);
        const idTokenResult = await user.getIdTokenResult();
        const roleFromClaims =
          typeof idTokenResult.claims.role === "string"
            ? idTokenResult.claims.role
            : null;
        const gradeLevelsFromClaims =
          Array.isArray(idTokenResult.claims.gradeLevels)
            ? idTokenResult.claims.gradeLevels
            : null;
        const gradeLevelFromClaims =
          typeof idTokenResult.claims.gradeLevel === "string"
            ? idTokenResult.claims.gradeLevel
            : null;
        const classIdFromClaims =
          typeof idTokenResult.claims.classId === "string"
            ? idTokenResult.claims.classId
            : null;
        // Check the authentication provider (email, Google, Apple)
        setIsEmailUser(
          user.providerData.some(
            (provider) => provider.providerId === "password",
          ),
        );
        setIsGoogleUser(
          user.providerData.some(
            (provider) =>
              provider.providerId === GoogleAuthProvider.PROVIDER_ID,
          ),
        );
        setIsAppleUser(
          user.providerData.some(
            (provider) => provider.providerId === "apple.com",
          ),
        );
        setRole(roleFromClaims);
        setGradeLevels(gradeLevelsFromClaims);
        setGradeLevel(gradeLevelFromClaims);
        setClassId(classIdFromClaims);
        if (user) {
          const realtimeUserRef = dbRef(database, `users/${user.uid}`);
          const snapshot = await get(realtimeUserRef);
          const userData = snapshot.exists() ? snapshot.val() : null;
          if (userData && userData.disabled) {
            // If the user is disabled, reset state and do not navigate
            setUserLoggedIn(false);
          } else {
            // If the user document exists and is not disabled, set the user as logged in
            setUserLoggedIn(true);
          }
        }
      } else {
        // Reset state if no user is logged in
        setCurrentUser(null);
        setUserLoggedIn(false);
        setRole(null);
        setGradeLevel(null);
        setGradeLevels(null);
        setClassId(null);
        setIsEmailUser(false);
        setIsGoogleUser(false);
        setIsAppleUser(false);
      }
    } catch (error) {
      console.error("Error initializing user:", error);
      throw error;
    } finally {
      setLoadingDot(false); // Ensure loading dot state is updated
    }
  }

  // refreshUser function to refresh the user's authentication state and role
  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload(); // Reload the user to get updated claims
        const updatedUser = auth.currentUser;
        await initializeUser(updatedUser);
        await createUserDocumentfromAuth(updatedUser, {});
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    }
  };

  const value: AuthContextType = {
    userLoggedIn,
    setUserLoggedIn,
    isEmailUser,
    isGoogleUser,
    isAppleUser,
    currentUser,
    setCurrentUser,
    role,
    gradeLevels,
    gradeLevel,
    classId,
    loading,
    setLoading,
    loadingDot,
    setLoadingDot,
    refreshUser,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {loadingDot ? (
        // Show a loading spinner while authentication state is being determined
        <LoadingDots />
      ) : (
        // Render children components once loading is complete
        children
      )}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};