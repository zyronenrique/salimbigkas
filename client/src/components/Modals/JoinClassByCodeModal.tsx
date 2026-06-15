import React, { useState } from "react";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { motion } from "framer-motion";
import { SpinLoadingWhite } from "../Icons/icons";
import { useAuth } from "../../hooks/authContext";
import { doJoinClassByCode } from "../../api/functions";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinClassByCodeModal = ({
  isOpen,
  onClose,
}: EventModalProps) => {
  const { currentUser } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        const response = (await doJoinClassByCode(
          currentUser?.uid || "",
          code,
        )) as any;
        if (response?.success) {
          toast.success(
            <CustomToast
              title="Congratulation!"
              subtitle={"You have successfully joined a class."}
            />,
          );
          onClose();
        } else {
          toast.error(
            <CustomToast
              title="Failed to join class!"
              subtitle="Please check the code and try again."
            />,
          );
        }
      } catch (error) {
        setErrorMessage(
          "An error occurred while joining the class. Please try again later.",
        );
      } finally {
        setIsRegistering(false);
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <motion.div
        className={`relative flex-1 max-w-md bg-white py-10 px-12 rounded-lg shadow-lg`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.4 },
        }}
      >
        <a
          className="absolute top-3 right-5 text-black text-3xl cursor-pointer"
          onClick={() => {
            onClose();
          }}
        >
          &times;
        </a>
        {/* Error message display */}
        {errorMessage && (
          <motion.div
            className="relative flex mb-6 py-5 px-15 bg-[#FBE6E6] text-sm justify-center items-center rounded-sm shadow-sm drop-shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              className="w-5 h-5 absolute top-auto left-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="rgb(211, 0, 1)"
            >
              <path
                d="M7.493 0.015 C 7.442 0.021,7.268 0.039,7.107 0.055 C 5.234 0.242,3.347 1.208,2.071 2.634 C 0.660 4.211,-0.057 6.168,0.009 8.253 C 0.124 11.854,2.599 14.903,6.110 15.771 C 8.169 16.280,10.433 15.917,12.227 14.791 C 14.017 13.666,15.270 11.933,15.771 9.887 C 15.943 9.186,15.983 8.829,15.983 8.000 C 15.983 7.171,15.943 6.814,15.771 6.113 C 14.979 2.878,12.315 0.498,9.000 0.064 C 8.716 0.027,7.683 -0.006,7.493 0.015 M8.853 1.563 C 9.967 1.707,11.010 2.136,11.944 2.834 C 12.273 3.080,12.920 3.727,13.166 4.056 C 13.727 4.807,14.142 5.690,14.330 6.535 C 14.544 7.500,14.544 8.500,14.330 9.465 C 13.916 11.326,12.605 12.978,10.867 13.828 C 10.239 14.135,9.591 14.336,8.880 14.444 C 8.456 14.509,7.544 14.509,7.120 14.444 C 5.172 14.148,3.528 13.085,2.493 11.451 C 2.279 11.114,1.999 10.526,1.859 10.119 C 1.618 9.422,1.514 8.781,1.514 8.000 C 1.514 6.961,1.715 6.075,2.160 5.160 C 2.500 4.462,2.846 3.980,3.413 3.413 C 3.980 2.846,4.462 2.500,5.160 2.160 C 6.313 1.599,7.567 1.397,8.853 1.563 M7.706 4.290 C 7.482 4.363,7.355 4.491,7.293 4.705 C 7.257 4.827,7.253 5.106,7.259 6.816 C 7.267 8.786,7.267 8.787,7.325 8.896 C 7.398 9.033,7.538 9.157,7.671 9.204 C 7.803 9.250,8.197 9.250,8.329 9.204 C 8.462 9.157,8.602 9.033,8.675 8.896 C 8.733 8.787,8.733 8.786,8.741 6.816 C 8.749 4.664,8.749 4.662,8.596 4.481 C 8.472 4.333,8.339 4.284,8.040 4.276 C 7.893 4.272,7.743 4.278,7.706 4.290 M7.786 10.530 C 7.597 10.592,7.410 10.753,7.319 10.932 C 7.249 11.072,7.237 11.325,7.294 11.495 C 7.388 11.780,7.697 12.000,8.000 12.000 C 8.303 12.000,8.612 11.780,8.706 11.495 C 8.763 11.325,8.751 11.072,8.681 10.932 C 8.616 10.804,8.460 10.646,8.333 10.580 C 8.217 10.520,7.904 10.491,7.786 10.530 "
                stroke="none"
              />
            </svg>
            <p>{errorMessage}</p>
          </motion.div>
        )}
        <form onSubmit={handleRegister}>
          <div className="flex text-left justify-between items-center">
            <h3 className="text-sm text-gray-600">
              Please type the class code to join a class.
            </h3>
          </div>
          <div className="flex flex-col mt-4">
            <div className="mt-2 mb-2 text-left relative">
              <input
                disabled={isRegistering}
                title="code"
                name="code"
                type="text"
                id="code"
                autoComplete="code"
                required
                autoFocus
                minLength={5}
                maxLength={5}
                className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${code ? "border-[#2C3E50]" : "border-gray-300"}`}
                placeholder=" "
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={() => {
                  setErrorMessage("");
                }}
              />
              <label
                className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${code ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                htmlFor="code"
              >
                Class code
              </label>
            </div>
          </div>
          {/* Register button */}
          <button
            type="submit"
            className={`w-full bg-[#2C3E50] text-lg text-white mt-4 px-15 py-3 rounded-lg shadow-md drop-shadow-lg ${isRegistering ? "opacity-50 cursor-not-allowed" : "hover:font-medium hover:border-[#386BF6] hover:bg-[#34495e]"}`}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <div className="flex items-center justify-center gap-2">
                <SpinLoadingWhite size={6}/>
                Joining...
              </div>
            ) : (
              "Join class"
            )}
          </button>
        </form>
      </motion.div>
    </>
  );
};

export default JoinClassByCodeModal;
