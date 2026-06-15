import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, Eye, EyeClosed, Send } from 'lucide-react';
import { doPasswordChange, doReauthenticateWithEmail, doSignOut, doVerifyBeforeUpdateEmail } from '../../firebase/auth';
import { SpinLoadingWhite } from '../Icons/icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomToast from '../Toast/CustomToast';
import { imageSrc } from '../Icons/icons';

interface ReauthenticateModalProps {
    isOpen: boolean;
    onClose: () => void;
    setEditMode: () => void;
    isEm: boolean;
    email: string;
    isPw: boolean;
}

const ReauthenticateModal = ({ isOpen, onClose, email, isEm, isPw }: ReauthenticateModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
    const [newEmail, setNewEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isEmail, setIsEmail] = useState<boolean>(false);
    const [isPassword, setIsPassword] = useState<boolean>(false);
    const [isSignOut, setIsSignOut] = useState<boolean>(false);

    const handleCheck = async () => {
        setLoading(true);
        try {
            await doReauthenticateWithEmail(email, password);
            if (isEm) return setIsEmail(!isEmail);
            if (isPw) return setIsPassword(!isPassword);
        } catch (error) {
            setErrorMessage("Failed to reauthenticate. Please check your password.");
        } finally {
            setLoading(false);
        }
    }
    const handleUpdateEmail = async () => {
        setLoading(true);
        try {
            await doVerifyBeforeUpdateEmail(newEmail);
            setSuccessMessage("A verification email has been sent to your inbox. Please check your email to confirm the change.");
            setIsEmail(false);
            setIsSignOut(true);
        } catch (error) {
            setErrorMessage("Failed to update email. Please try again." + error);
        } finally {
            setLoading(false);
        }
    }
    const passwordRequirements = [
        newPassword.length >= 8,
        /[A-Z]/.test(newPassword),
        /[a-z]/.test(newPassword),
        /\d/.test(newPassword),
        /[@$!%*?&]/.test(newPassword),
    ];
    const allPasswordValid = passwordRequirements.every(Boolean);
    const handleUpdatePassword = async () => {
        setLoading(true);
        try {
            await doPasswordChange(newPassword);
            toast.success(
                <CustomToast
                    title="Congratulation!"
                    subtitle="Your password has been changed successfully."
                />,
            );
            onClose();
        } catch (err: any) {
            setErrorMessage("Failed to update password. Please try again.");
        } finally {
            setLoading(false);
            setPassword("");
        }
    }
    const navigate = useNavigate();
    const handleLogout = () => {
        setTimeout(() => {
        doSignOut()
            .then(() => {
                setIsSignOut(false);
                navigate("/home");
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
        }, 100);
    };
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
            {!isSignOut && (
                <a
                    className="absolute top-3 right-5 text-black text-2xl cursor-pointer"
                    onClick={() => {
                        onClose();
                    }}
                >
                    &times;
                </a>
            )}
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
            {/* Success message display */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        className="flex mt-5 mb-4 py-5 px-10 bg-green-100 justify-center items-center rounded-sm shadow-sm drop-shadow-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                    <p className="text-sm text-green-600">{successMessage}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            {isSignOut ?
                <div className="rounded-full bg-blue-500 size-15 items-center justify-center mx-auto mb-4">
                    <motion.div
                        className="text-5xl font-bold text-white size-15 flex items-center justify-center mx-auto mb-4"
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: [1, -1, 1] }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        !
                    </motion.div>
                </div>
            :
                <div className="flex justify-center mb-4">
                    <img
                        loading="lazy"
                        src={imageSrc.salimbigkasPng}
                        alt="Salimbigkas Logo"
                        className="h-12 object-contain"
                    />
                </div>
            }
            {/* Email display */}
            <h2 className="text-lg font-bold mb-2 text-center">{
                isEmail ? 
                    "Change Email?" 
                :  isPassword ?
                    "Change Password?"
                :   isSignOut ? 
                    "You are about to sign out." 
                :
                    "Reauthenticate to continue"
                }
            </h2>
            {isEmail ?
                <> 
                    <p className="text-sm text-gray-600 text-center">
                        You are about to change your email to{" "}
                        <span className="font-semibold text-[#2C3E50]">{newEmail}</span>.
                    </p>
                    <p className="text-sm text-gray-600 mb-4 text-center">
                        Please enter your new email address below to confirm the change.
                    </p>
                    {/* New email input */}
                    <div className="mt-2 mb-4 text-left relative">
                        <input
                            disabled={loading}
                            name="email"
                            type="email"
                            id="email"
                            autoComplete="email"
                            required
                            autoFocus
                            minLength={1}
                            maxLength={30}
                            className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${newEmail ? "border-[#2C3E50]" : "border-gray-300"}`}
                            placeholder=" "
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyDown={() => {
                                setErrorMessage("");
                            }}
                        />
                        <label
                            htmlFor="email"
                            className={`absolute text-sm font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${newEmail ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                        >
                            New email
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={handleUpdateEmail}
                        className={`w-full flex items-center justify-center gap-2 bg-[#2C3E50] text-white p-3 mt-2 rounded-lg shadow-md drop-shadow-lg transition duration-300 ${loading || !newEmail ? "opacity-50 cursor-not-allowed" : "hover:bg-[#34495e]"}`}
                        disabled={loading || !newEmail}
                    >
                        {loading ? <SpinLoadingWhite size={6}/> : <Send size={20} />}
                        <span>{loading ? "Verifying..." : "Verify and update email"}</span>
                    </button>
                </>
            : isPassword ?
                <>
                    <p className="text-sm text-gray-600 text-center">
                        You are about to change your password.
                    </p>
                    <p className="text-sm text-gray-600 mb-4 text-center">
                        Please enter your new password below to confirm the change.
                    </p>
                    {/* New password input */}
                    <div className="mt-2 mb-3 text-left relative">
                        <motion.input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="current-password"
                            required
                            minLength={8}
                            maxLength={20}
                            className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${newPassword ? "border-[#2C3E50]" : "border-gray-300"}`}
                            placeholder=" "
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
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
                            color={`${newPassword ? "#2C3E50" : "oklch(87.2% 0.01 258.338)"}`}
                            />
                        ) : (
                            <EyeClosed
                            size={24}
                            color={`${newPassword ? "#2C3E50" : "oklch(87.2% 0.01 258.338)"}`}
                            />
                        )}
                        </button>
                        <label
                            htmlFor="password"
                            className={`absolute text-sm font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${newPassword ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                        >
                            Password
                        </label>
                        {/* Password requirements */}
                        {isPasswordFocused && !allPasswordValid && (
                            <div className="absolute left-0 top-full mt-2 w-full z-50 bg-[#2C3E50] text-white py-3 px-4 rounded-lg shadow-lg border border-[#bcd0e6]">
                                <ul className="text-sm text-left space-y-1">
                                    <li className="flex items-center gap-2">
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full ${
                                                newPassword.length >= 8 ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                        ></span>
                                        <span>Password is at least 8 characters</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full ${
                                                /[A-Z]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                        ></span>
                                        <span>Contains an uppercase letter</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full ${
                                                /[a-z]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                        ></span>
                                        <span>Contains a lowercase letter</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full ${
                                                /\d/.test(newPassword) ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                        ></span>
                                        <span>Contains a number</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full ${
                                                /[@$!%*?&]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                        ></span>
                                        <span>Contains a special character</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleUpdatePassword}
                        className={`w-full flex items-center justify-center gap-2 bg-[#2C3E50] text-white p-3 mt-2 rounded-lg shadow-md drop-shadow-lg transition duration-300 ${loading || !newPassword ? "opacity-50 cursor-not-allowed" : "hover:bg-[#34495e]"}`}
                        disabled={loading || !newPassword}
                    >
                        {loading ? <SpinLoadingWhite size={6}/> : ""}
                        <span>{loading ? "Saving..." : "Update password"}</span>
                    </button>
                </>
            : isSignOut ?
                <>
                    <p className="text-sm text-gray-600 text-center">
                        Your email has been updated.
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                        Please sign in again with your new email.
                    </p>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className={`w-full bg-[#2C3E50] text-white p-3 mt-4 rounded-lg shadow-md drop-shadow-lg transition duration-300 hover:bg-[#34495e]`}
                    >
                        Sign Out
                    </button>
                </>
            :
                <>
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
                        className={`w-full flex bg-[#2C3E50] items-center justify-center text-white p-3 mt-2 rounded-lg shadow-md drop-shadow-lg transition duration-300 ${
                            loading || !password ? "opacity-50 cursor-not-allowed" : "hover:bg-[#34495e]"
                        }`}
                    >
                        {loading ? <SpinLoadingWhite size={6}/> : <span>Next</span>}
                    </button>
                </>
            }
        </motion.div>
    )
}

export default ReauthenticateModal