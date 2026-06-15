import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../hooks/authContext";
import { doSendEmailVerification } from "../../firebase/auth";
import { auth } from "../../firebase/firebase";
import { BarLoader } from "react-spinners";

// Email verification modal to the user.
const EmailVerificationModal = ({ onVerified }: { onVerified: () => void }) => {
  const [resendMessage, setResendMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(60);

  // Check if the user is logged in and has an email
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!auth.currentUser) return;
    const interval = setInterval(async () => {
      try {
        if (auth.currentUser && typeof auth.currentUser.reload === "function") {
          await refreshUser(); // Refresh the user to get the latest data
          if (auth.currentUser?.emailVerified) {
            clearInterval(interval);
            setIsLoading(false);
            onVerified();
          }
        }
      } catch (error) {
        console.error("Error checking email verification:", error);
      }
    }, 10000);

    // Stop polling after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsLoading(false);
    }, 300000); // 5 minutes

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      setIsLoading(false);
    };
  }, [auth.currentUser, onVerified]);

  // Timer effect for the "resend" button – for 60 seconds cooldown.
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            // Timer is about to hit 0, so clear message
            setResendMessage("");
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Function to handle resend verification email
  const handleResend = async () => {
    try {
      await doSendEmailVerification();
      setResendMessage("A new verification email has been sent.");
      setTimer(60); // start a 60-second countdown
    } catch (error) {
      console.error("Resend verification failed:", error);
      setResendMessage("Failed to resend email, please try again later.");
    }
  };

  // Check if the user is logged in and has an email
  if (!auth.currentUser || !auth.currentUser.email) {
    return null;
  }

  return (
    <>
      <motion.div
        className="relative max-w-md flex-1 bg-white py-10 px-15 rounded-lg shadow-lg flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", bounce: 0.4 },
        }}
      >
        {isLoading && (
          <BarLoader
            color="#208ec5" 
            loading={isLoading}
            cssOverride={
              {
                position: 'absolute',
                backgroundColor: 'transparent',
                borderColor: '#208ec5',
                top: 0,
                left: 0,
                margin: "0 auto",
                width: '100%',
                zIndex: 9999,
              }
            }
            speedMultiplier={0.8}
          />
        )}
        <AnimatePresence>
          {resendMessage && (
            <motion.div
              className="flex mt-5 mb-4 py-5 px-10 bg-green-100 justify-center items-center rounded-sm shadow-sm drop-shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-green-600">{resendMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <h2 className="text-xl font-bold mb-4">Verify Your Email</h2>
        <p className="text-justify text-sm text-gray-600">
          A verification email has been sent to your inbox.
        </p>
        <p className="mb-4 text-center text-sm text-gray-600">
          Please check your email (and spam folder) {"\n"}and click on the
          verification link.
        </p>
        <p className="mb-4 text-center text-sm text-gray-600">
          We are checking your verification status...
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0}
          className={`w-full bg-[#2C3E50] text-white p-3 rounded-lg shadow-md drop-shadow-lg transition duration-300 ${
            timer > 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#34495e]"
          }`}
        >
          {timer > 0 ? `Resend in ${timer}s` : "Resend Verification Email"}
        </button>
      </motion.div>
    </>
  );
};

export default EmailVerificationModal;
