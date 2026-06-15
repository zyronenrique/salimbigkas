import { useEffect, memo, useCallback } from "react";
import { useAuth } from "../../hooks/authContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeClosed, X, Check, CircleAlert } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ForgotPasswordModal from "./ForgotPasswordModal";
import SignInWithSocials from "../Buttons/SignInWithSocials";
import { SpinLoadingWhite } from "../Icons/icons";
import { useLogReg } from "./LogRegProvider";

// Component for the Login Modal
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitch: () => void;
}
const LoginModal = memo(({ isOpen, onClose, onSwitch }: LoginModalProps) => {
  // Form state variables and error handling
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    email,
    password,
    isSigningIn,
    isSigningInWithGoogle,
    isSigningInWithFacebook,
    errorMessage,
    showPassword,
    rememberMe,
    showForgotPasswordModal,
    shouldNavigate,
    setEmail, 
    setPassword, 
    setShowPassword, 
    setRememberMe, 
    setShowForgotPasswordModal,
    setShouldNavigate,
    setErrorMessage,
    handleLogin,
    onGoogleSignIn,
    onFacebookSignIn,
    formattedGradeLevel,
    resetState,
  } = useLogReg();

  const navigate = useNavigate();

  // Get user authentication state and role from context
  const { role } = useAuth();

  useEffect(() => {
    if (shouldNavigate && role && formattedGradeLevel) {
      navigate(`/${role.toLowerCase()}/${formattedGradeLevel}`, { replace: true });
      setShouldNavigate(false); // reset flag
    }
  }, [shouldNavigate, role, navigate, formattedGradeLevel, setShouldNavigate]);

  useEffect(() => {
    if (searchParams.get("forgot") === "true") {
      setShowForgotPasswordModal(true);
    }
  }, [searchParams]);

  const handleForgotPassword = useCallback(() => {
    setShowForgotPasswordModal(true);
    setSearchParams({ forgot: "true" });
  }, [setShowForgotPasswordModal, setSearchParams]);

  // Show the forgot password modal if needed
  if (showForgotPasswordModal) {
    return (
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => {
          setShowForgotPasswordModal(false);
          setSearchParams({ login: "true" });
        }}
      />
    );
  }

  // If modal is not visible, return null to prevent rendering
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <motion.div
        className={`relative max-w-md flex-1 bg-white py-10 px-15 rounded-lg shadow-lg`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.4 },
        }}
      >
        <motion.button
          disabled={isSigningIn || isSigningInWithGoogle || isSigningInWithFacebook}
          type="button"
          title="Close"
          className="absolute top-3 right-5 text-black hover:text-gray-600 text-2xl cursor-pointer"
          onClick={() => {
            onClose();
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          &times;
        </motion.button>
        {/* Error message display */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              className="relative flex mt-5 mb-4 py-5 px-15 bg-[#FBE6E6] text-xs justify-center items-center rounded-sm shadow-sm drop-shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CircleAlert
                size={20}
                className="absolute top-auto left-6 text-red-600"
              />
              <p className="text-[#D30001]">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <h2 className="text-xl font-bold mb-4">SalimBigkas Account</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          {/* Email input */}
          <div className="mt-10 mb-4 text-left relative">
            <input
              disabled={isSigningIn || isSigningInWithGoogle || isSigningInWithFacebook}
              name="email"
              type="email"
              id="email"
              autoComplete="email"
              required
              autoFocus
              minLength={1}
              maxLength={30}
              className={`w-full font-bold p-4 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${email ? "border-[#2C3E50]" : "border-gray-300"}`}
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={() => {
                setErrorMessage("");
              }}
            />
            <label
              htmlFor="email"
              className={`absolute text-sm font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${email ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
            >
              Email
            </label>
          </div>
          {/* Password input */}
          <div className="mt-5 mb-4 text-left relative">
            <input
              disabled={isSigningIn || isSigningInWithGoogle || isSigningInWithFacebook}
              name="password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              required
              minLength={8}
              maxLength={20}
              className={`w-full font-bold p-4 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${password ? "border-[#2C3E50]" : "border-gray-300"}`}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={() => {
                setErrorMessage("");
              }}
            />
            {/* Toggle password visibility */}
            <button
              type="button"
              className="absolute right-4 top-4.5 border-none bg-transparent cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye
                  size={24}
                  color={`${password ? "#2C3E50" : "oklch(87.2% 0.01 258.338)"}`}
                />
              ) : (
                <EyeClosed
                  size={24}
                  color={`${password ? "#2C3E50" : "oklch(87.2% 0.01 258.338)"}`}
                />
              )}
            </button>
            <label
              htmlFor="password"
              className={`absolute text-sm font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${password ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
            >
              Password
            </label>
          </div>
          {/* // Remember me and forgot password links */}
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <motion.button
                disabled={isSigningIn || isSigningInWithGoogle || isSigningInWithFacebook}
                type="button"
                title="Remember me"
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  rememberMe ? "bg-[#2C3E50]" : "bg-gray-300"
                }`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div
                  className={`relative bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    rememberMe ? "translate-x-6" : "translate-x-0"
                  }`}
                >
                  {rememberMe ? (
                    <Check
                      size={8}
                      strokeWidth={5}
                      className="absolute inset-0 m-auto"
                    />
                  ) : (
                    <X
                      size={8}
                      strokeWidth={5}
                      className="absolute inset-0 m-auto"
                    />
                  )}
                </div>
              </motion.button>
              <span className={`${rememberMe ? "font-medium text-gray-700" : "text-gray-600"}`}>
                {rememberMe ? "You’ll stay logged in" : "Remember me?"}
              </span>
            </div>
            <a
              className="text-[#2C3E50] hover:underline"
              href="#"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </a>
          </div>
          <motion.button
            type="submit"
            title="Login"
            disabled={isSigningIn || isSigningInWithGoogle || isSigningInWithFacebook}
            className={`w-full mt-6 bg-[#2C3E50] text-white p-4 rounded-lg shadow-md drop-shadow-lg ${isSigningIn ? "opacity-80 cursor-not-allowed" : "hover:font-medium hover:border-[#386BF6] hover:bg-[#34495e]"}`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            {isSigningIn ? (
              <div className="flex items-center justify-center gap-2">
                <SpinLoadingWhite size={6}/>
                Processing...
              </div>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
        {/* Divider */}
        <div className="flex flex-row mt-5 w-full">
          <div className="border-b-1 mb-2.5 mr-2 w-full border-gray-200"></div>
          <div className="text-sm mb-0.5 w-fit text-gray-500">or</div>
          <div className="border-b-2 mb-2.5 ml-2 w-full border-gray-200"></div>
        </div>
        {/* Social login buttons */}
        <SignInWithSocials
          onGoogleSignIn={onGoogleSignIn}
          onFacebookSignIn={onFacebookSignIn}
          isSigningInWithGoogle={isSigningInWithGoogle}
          isSigningInWithFacebook={isSigningInWithFacebook}
          isSigningIn={isSigningIn}
        />
        {/* Switch to sign-up link */}
        <p className="mt-4 text-sm">
          New to SalimBigkas?
          <a
            href="/signup"
            className="ml-1 cursor-pointer hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Create a new account"
            onClick={(e) => {
              e.preventDefault();
              resetState();
              onSwitch();
            }}
          >
            Create yours now.
          </a>
        </p>
      </motion.div>
    </>
  );
});

export default LoginModal;
