import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { doPasswordReset } from "../../firebase/auth";
import { CircleCheck } from "lucide-react";
// import { auth } from '../../firebase/firebase';
// import EmailVerificationModal from './EmailVerificationModal';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  // Form state variables and error handling
  const [email, setEmail] = useState("");
  const [Message, setMessage] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  // const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailVerified) return;
    setIsEmailVerified(true);
    try {
      await doPasswordReset(email);
      // if (auth.currentUser && !auth.currentUser.emailVerified) {
      //     setShowVerificationModal(true);
      //     return;
      // }
      setMessage("Password reset email sent successfully!");
    } catch (error) {
      setMessage(
        "Failed to send password reset email. Please check your email address.",
      );
    } finally {
      setIsEmailVerified(false);
    }
  };

  // if (showVerificationModal) {
  //     return (
  //         <EmailVerificationModal
  //             onVerified={() => {
  //                 setShowVerificationModal(false);
  //                 setMessage('Email verified successfully! You can now reset your password.');
  //             }}
  //         />
  //     );
  // }

  if (!isOpen) return null; // Don't render if modal is not open

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
        {/* Modal content */}
        {/* Close button */}
        <a
          className="absolute top-3 right-5 text-black text-2xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </a>

        {/* Message display */}
        <AnimatePresence>
          {Message && (
            <motion.div
              // className={`flex mt-5 mb-4 py-5 px-12 ${isEmailVerified ? 'bg-green-100' : 'bg-[#FBE6E6]'} justify-center items-center rounded-sm shadow-sm drop-shadow-sm`}
              className={`flex mt-5 mb-4 py-5 px-12 bg-green-100 justify-center items-center rounded-sm shadow-sm drop-shadow-sm`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* {isEmailVerified ?
                                <>
                                    <CircleCheck size={20} className="absolute top-auto left-6 text-green-600" />
                                    <p className="text-sm text-green-600">{Message}</p>
                                </>
                                :
                                <>
                                    <CircleAlert size={20} className="absolute top-auto left-6 text-red-600" />
                                    <p className="text-sm text-[#D30001]">{Message}</p>
                                </>
                            } */}
              <CircleCheck
                size={20}
                className="absolute top-auto left-6 text-green-600"
              />
              <p className="text-sm text-green-600">{Message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal title */}
        <h2 className="text-3xl font-bold mb-6">Forgot Password</h2>

        {/* // Modal description */}
        <p className="text-center text-md text-gray-500">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {/* Login form */}
        <form onSubmit={handleForgotPassword}>
          {/* Email input */}
          <div className="mt-8 mb-4 text-left relative">
            <input
              name="email"
              type="email"
              id="email"
              autoComplete="email"
              required
              autoFocus
              minLength={1}
              maxLength={30}
              className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${email ? "border-[#2C3E50]" : "border-gray-300"}`}
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={() => {
                setMessage("");
              }}
            />
            <label
              htmlFor="email"
              className={`absolute text-sm font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${email ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
            >
              Email
            </label>
          </div>

          {/* Reset Password button */}
          {/* <button
                        type="submit"
                        className={`w-full mt-6 bg-[#2C3E50] text-white p-4 rounded-lg shadow-md drop-shadow-lg ${isEmailVerified ? 'opacity-80 cursor-not-allowed' : 'hover:font-medium hover:border-[#386BF6] hover:bg-[#34495e]'}`}
                    >
                        {isEmailVerified ? 
                            <div className="flex items-center justify-center gap-2">
                                <SpinLoadingWhite />
                                Processing...
                            </div>
                        : 
                            'Reset Password'
                        }
                    </button> */}
          <button
            type="submit"
            className={`w-full mt-6 bg-[#2C3E50] text-white p-4 rounded-lg shadow-md drop-shadow-lg hover:font-medium hover:border-[#386BF6] hover:bg-[#34495e]`}
          >
            Reset Password
          </button>
        </form>
      </motion.div>
    </>
  );
};

export default ForgotPasswordModal;
