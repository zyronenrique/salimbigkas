import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, Eye, EyeClosed } from 'lucide-react';
import { imageSrc } from '../Icons/icons';
import { doReauthenticateWithEmail } from '../../firebase/auth';

interface ReauthenticateModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const ReauthenticateModal = ({ isOpen, onClose, email }: ReauthenticateModalProps) => {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const handleCheck = async () => {
        setLoading(true);
        try {
            await doReauthenticateWithEmail(email, password);
        } catch (error) {
            setErrorMessage("Failed to reauthenticate. Please check your password.");
        } finally {
            setLoading(false);
        }
    }
    if (!isOpen) {
        return null;
    }
    return (
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
                onClick={() => {
                    onClose();
                }}
            >
                &times;
            </a>
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
            {/* Logo */}
            <div className="flex justify-center mb-4">
                <img
                    loading="lazy"
                    src={imageSrc.salimbigkas}
                    alt="Salimbigkas Logo"
                    className="size-20"
                />
            </div>
            {/* Email display */}
            <h2 className="text-xl font-bold mb-4 text-center">Change Email?</h2>
            <p className="text-sm text-gray-600 text-center">
                Please reauthenticate to continue.
            </p>
            <p className="text-sm text-gray-600 mb-4 text-center">
                Enter your password for{" "}
                <span className="font-semibold text-[#2C3E50]">{email}</span>.
            </p>
            {/* Password input */}
            <div className="mt-2 mb-3 text-left relative">
                <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    required
                    minLength={8}
                    maxLength={20}
                    className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${password ? "border-[#2C3E50]" : "border-gray-300"}`}
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
            {/* Submit button */}
            <button
                type="button"
                onClick={handleCheck}
                disabled={loading || !password}
                className={`w-full bg-[#2C3E50] text-white p-3 mt-2 rounded-lg shadow-md drop-shadow-lg transition duration-300 ${
                    loading || !password ? "opacity-50 cursor-not-allowed" : "hover:bg-[#34495e]"
                }`}
            >
                Next
            </button>
        </motion.div>
    )
}

export default ReauthenticateModal