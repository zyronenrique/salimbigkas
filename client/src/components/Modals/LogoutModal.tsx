import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doSignOut } from "../../firebase/auth";
import { useAuth } from "../../hooks/authContext";
import { useLogReg } from "./LogRegProvider";
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal = ({ isOpen, onClose }: LogoutModalProps) => {
  const navigate = useNavigate();
  const { role, setCurrentUser, setUserLoggedIn } = useAuth();
  const { resetState, closeModal } = useLogReg();
  
  const handleLogout = async() => {
    try {
      await doSignOut();
      setUserLoggedIn(false);
      setCurrentUser(null);
      resetState();
      closeModal();
      onClose();
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <motion.div
        className={`flex-1 max-w-md py-10 px-15 rounded-lg shadow-lg
          ${role === "Student" ? "text-[#FFF9C4] bg-[#003311] border-8 border-[#8a3903]" : "text-[#2C3E50] bg-[#F8F8F8]"}  
        `}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.4 },
        }}
      >
        {/* Modal content */}
        <div className="rounded-full bg-red-500 size-15 items-center justify-center mx-auto mb-4">
          <motion.div
            className="text-5xl font-bold text-white size-15 flex items-center justify-center mx-auto mb-4"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: [1, -1, 1] }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            ?
          </motion.div>
        </div>
        <h2 className="text-lg font-semibold text-center mb-4 text">
          Are you sure you want to log out?
        </h2>
        <div className="flex justify-center gap-4 mt-4">
          <button
            type="button"
            className="w-full bg-red-500 text-white p-4 rounded-lg hover:bg-red-600"
            onClick={handleLogout}
          >
            Yes
          </button>
          <button
            type="button"
            className="w-full bg-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-400"
            onClick={onClose}
          >
            No
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default LogoutModal;
