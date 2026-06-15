import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { auth, FirebaseAuthTypes, GoogleAuthProvider } from '@/firebase/firebase';
import { createUserDocumentfromAuth, onAuthStateChange } from '@/firebase/auth';
import { loadingDot } from "@/Icons/icons";

// Define the shape of the context value
interface AuthContextType {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  isGoogleUser: boolean;
  isAppleUser: boolean;
  currentUser: FirebaseAuthTypes.User | null;
  setCurrentUser: Dispatch<SetStateAction<FirebaseAuthTypes.User | null>>;
  role: string | null;
  gradeLevels: string[] | null;
  gradeLevel: string | null;
  classId: string | null;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  refreshUser: () => Promise<void>;
}

// Create a context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider=({ children }: { children: ReactNode }) => {
  // State variables to manage user authentication and roles
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [gradeLevels, setGradeLevels] = useState<string[] | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isAppleUser, setIsAppleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(initializeUser);
    return unsubscribe;
  }, []);

  // Function to initialize user state and fetch additional data
  async function initializeUser(user: FirebaseAuthTypes.User | null) {
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
        setUserLoggedIn(user.emailVerified === true);
      } else {
        // Reset state if no user is logged in
        setCurrentUser(null);
        setUserLoggedIn(false);
        setRole(null);
        setGradeLevel(null);
        setClassId(null);
        setIsEmailUser(false);
        setIsGoogleUser(false);
        setIsAppleUser(false);
      }
    } catch (error) {
      console.error("Error initializing user:", error);
      throw error;
    } finally {
      setLoading(false); // Ensure loading state is updated
    }
  }

  // refreshUser function to refresh the user's authentication state and role
  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload(); // Reload the user to get updated claims
        const updatedUser = auth.currentUser;
        await initializeUser(updatedUser);
        await createUserDocumentfromAuth(updatedUser, {}); // Update user document in Firestore
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    }
  };

  const value: AuthContextType = {
    userLoggedIn,
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
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        loadingDot()
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};