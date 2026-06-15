import "./App.css";
import { useEffect, lazy, Suspense } from "react";
import { getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase/firebase";
import { createUserDocumentfromAuth } from "./firebase/auth";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import { classRoutes, quizRoutes, bigkasRoutes, lessonRoutes, studentLessonRoutes, allRoutes, seatworkRoutes } from "./routes/Routes";
import TitleManager from "./routes/TitleManager";
const HomePage = lazy(() => import("./pages/HomePage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const StudentPage = lazy(() => import("./pages/StudentPage"));
const TeacherDashboardTab = lazy(() => import("./components/TeacherDashboard/TeacherDashboardTab"));
const TeacherStudentsTab = lazy(() => import("./components/TeacherDashboard/TeacherStudentsTab"));
const AdminDashboardTab = lazy(() => import("./components/AdminDashboard/AdminDashboardTab"));
const AdminUsersTab = lazy(() => import("./components/AdminDashboard/AdminUsersTab"));
const AdminAnalyticsTab = lazy(() => import("./components/AdminDashboard/AdminAnalyticsTab"));
const LogsTab = lazy(() => import("./components/AdminDashboard/Logs"));
const User = lazy(() => import("./components/AdminDashboard/User"));
const StudentHome = lazy(() => import("./components/StudentDashboard/StudentHome"));
const StudentLessons = lazy(() => import("./components/StudentDashboard/StudentLesssons"));
const MyCourses = lazy(() => import("./components/Class/MyCourses"));
const StudentProgressTab = lazy(() => import("./components/TeacherDashboard/StudentProgress"));
const TermsOfService = lazy(() => import("./components/HomePage/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./components/HomePage/PrivacyPolicy"));
const AboutUs = lazy(() => import("./components/HomePage/AboutUs"));
const EmailVerificationModal = lazy(() => import("./components/Modals/EmailVerificationModal"));
const AccountRestrictedModal = lazy(() => import("./components/Modals/AccountRestrictedModal"));
import { useAuth } from "./hooks/authContext";
import { doSetUserClaims } from "./api/functions";
import { checkUserStatus } from "./utils/helpers";
import { useLogReg } from "./components/Modals/LogRegProvider";
import LoadingDots from "./components/Icons/LoadingDots";

function App() {
  const { setLoading, userLoggedIn, role } = useAuth();
  const {
    showVerificationModal,
    showRestrictedModal,
    setShowVerificationModal, 
    setShowRestrictedModal, 
    setShouldNavigate,
    setIsSigningInWithGoogle,
    setIsSigningInWithFacebook,
    setErrorMessage,
    closeModal,
    resetState,
  } = useLogReg();

  useEffect(() => {
    if (userLoggedIn && role) {
      checkUserStatus(
        setShowVerificationModal,
        setShowRestrictedModal,
        setShouldNavigate
      );
    }
  }, [userLoggedIn, role, setShowVerificationModal, setShowRestrictedModal, setShouldNavigate]);
  
  useEffect(() => {
    const handleRedirectResult = async () => {
      setLoading(true);
      setIsSigningInWithGoogle(true);
      setIsSigningInWithFacebook(false);
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          const tokenResult = await user.getIdTokenResult();
          const currentRole = typeof tokenResult.claims.role === "string" ? tokenResult.claims.role : null;
          const currentGradeLevel = typeof tokenResult.claims.gradeLevel === "string" ? tokenResult.claims.gradeLevel : null;
          const currentGradeLevels = Array.isArray(tokenResult.claims.gradeLevels) ? tokenResult.claims.gradeLevels : null;
          const currentClassId = typeof tokenResult.claims.classId === "string" ? tokenResult.claims.classId : null;
          let response;
          if (!currentRole) {
            response = await doSetUserClaims(user.uid, "Student", null, null, null) as any;
          } else {
            response = await doSetUserClaims(
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
          if (response?.success) {
            try {
              await createUserDocumentfromAuth(user);
              await checkUserStatus(
                setShowVerificationModal,
                setShowRestrictedModal,
                setShouldNavigate
              ); 
            } catch (error) {
              console.error("Error creating user document:", error);
            }
          }
          return user;
        }
      } catch (error: any) {
        let errorMsg = "";
        const errorCode = error.code;
        console.error("Error Code:", errorCode);
        const errorMessage = error.message;
        console.error("Error Message:", errorMessage);
        const email = error.customData.email;
        console.error("Error Email:", email);
        const credential = GoogleAuthProvider.credentialFromError(error);
        if (errorCode === "auth/email-already-in-use") {
          errorMsg = "The email address is already in use. Please use a different email.";
        } else if (errorCode === "auth/operation-not-allowed") {
          errorMsg = "Registration is currently disabled. Please contact support.";
        } else if (errorCode === "auth/user-disabled") {
          errorMsg = "Access restricted: Your account is under review. Please contact the school administrator.";
        } else {
          errorMsg = `An error occurred while signing in with ${credential?.providerId}. Please try again.`;
        }
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
        setIsSigningInWithGoogle(false);
        setIsSigningInWithFacebook(false);
      }
    };
    handleRedirectResult();
  }, [setLoading, setShowVerificationModal, setShowRestrictedModal, setShouldNavigate, setIsSigningInWithGoogle, setIsSigningInWithFacebook, setErrorMessage]);

  if (showVerificationModal) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center">
        <EmailVerificationModal
          onVerified={async () => {
            await checkUserStatus(
              setShowVerificationModal,
              setShowRestrictedModal,
              setShouldNavigate
            );
          }}
        />
      </div>
    )
  };

  if (showRestrictedModal) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center">
        <AccountRestrictedModal
          isOpen={showRestrictedModal}
          onClose={() => {
            setShowRestrictedModal(false);
            resetState();
            closeModal();
          }}
        />
      </div>
    )
  };

  return (
    <div className="App">
      <div id="recaptcha-container"></div>
      <TitleManager />
      <Suspense fallback={<LoadingDots />}>
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/home" element={<HomePage />}></Route>
          <Route
            path="/Admin/:gradeLevels?/*"
            element={
              <ProtectedRoute >
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardTab />} />
            <Route path="dashboard" element={<AdminDashboardTab />} />
            <Route path="users" element={<AdminUsersTab />} />
            <Route path="users/add" element={<User />} />
            <Route path="users/edit/:uid" element={<User />} />
            <Route path="analytics" element={<AdminAnalyticsTab />} />
            <Route path="logs" element={<LogsTab />} />
            {classRoutes({ MyCourses })}
            {lessonRoutes}
            {seatworkRoutes}
            {quizRoutes}
            {bigkasRoutes}
            {allRoutes}
          </Route>
          <Route
            path="/Teacher/:gradeLevels?/*"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requiredRole="Teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboardTab />} />
            <Route path="dashboard" element={<TeacherDashboardTab />} />
            <Route path="students" element={<TeacherStudentsTab />} />
            <Route path="students/:studentId" element={<StudentProgressTab />} />
            {classRoutes({ MyCourses })}
            {lessonRoutes}
            {seatworkRoutes}
            {quizRoutes}
            {bigkasRoutes}
            {allRoutes}
          </Route>
          <Route
            path="/Student/:gradeLevel?/:tab?"
            element={
              <ProtectedRoute requireVerifiedEmail={true} requiredRole="Student">
                <StudentPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentHome />} />
            <Route path="home" element={<StudentHome />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="my-courses/:yunitNumber/lessons" element={<StudentLessons />} />
            {studentLessonRoutes}
            {seatworkRoutes}
            {quizRoutes}
            {bigkasRoutes}
            {allRoutes}
          </Route>
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/tos" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
