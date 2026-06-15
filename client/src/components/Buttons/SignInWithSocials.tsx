import React from "react";
import { SpinLoadingColored } from "../Icons/icons";
import { motion } from "framer-motion";

interface SocialsProps {
  onGoogleSignIn: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onFacebookSignIn: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isSigningInWithGoogle: boolean;
  isSigningInWithFacebook: boolean;
  isSigningIn: boolean;
}

const SignInWithSocials = ({
  onGoogleSignIn,
  // onFacebookSignIn,
  isSigningInWithGoogle,
  isSigningInWithFacebook,
  isSigningIn,
}: SocialsProps) => {
  return (
    <>
      {/* Google sign-in button */}
      <motion.button
        type="button"
        title="Sign in with Google"
        disabled={isSigningInWithGoogle || isSigningInWithFacebook || isSigningIn}
        onClick={(e) => onGoogleSignIn(e)}
        className={`relative w-full flex mt-5 items-center justify-center text-black p-4 border rounded-lg shadow-md drop-shadow-lg ${isSigningInWithGoogle ? "cursor-not-allowed" : "hover:bg-[#e0f2f1] hover:text-[#2C3E50]  hover:border-[#386BF6]"}`}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
      >
        <svg
          className="w-5 h-5 absolute top-auto left-5"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_17_40)">
            <path
              d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
              fill="#4285F4"
            />
            <path
              d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
              fill="#34A853"
            />
            <path
              d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
              fill="#FBBC04"
            />
            <path
              d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
              fill="#EA4335"
            />
          </g>
          <defs>
            <clipPath id="clip0_17_40">
              <rect width="48" height="48" fill="white" />
            </clipPath>
          </defs>
        </svg>
        {isSigningInWithGoogle ? (
          <div className="flex items-center justify-center gap-2">
            <SpinLoadingColored size={6}/>
            Processing...
          </div>
        ) : (
          "Continue with Google"
        )}
      </motion.button>

      {/* Apple sign-in button */}
      {/* <motion.button
        type="button"
        title="Sign in with Facebook"
        disabled={isSigningInWithFacebook || isSigningInWithGoogle || isSigningIn}
        onClick={(e) => onFacebookSignIn(e)}
        className={`relative w-full flex mt-4 items-center justify-center text-black p-4 border rounded-lg shadow-md drop-shadow-lg ${isSigningInWithFacebook ? "cursor-not-allowed" : "hover:bg-[#e0f2f1] hover:text-[#2C3E50]"}`}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
      >
        <svg
          className="w-6 h-6 absolute top-auto left-5"
          xmlns="http://www.w3.org/2000/svg"
          width="800px"
          height="800px"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            fill="#1877F2"
            d="M15 8a7 7 0 00-7-7 7 7 0 00-1.094 13.915v-4.892H5.13V8h1.777V6.458c0-1.754 1.045-2.724 2.644-2.724.766 0 1.567.137 1.567.137v1.723h-.883c-.87 0-1.14.54-1.14 1.093V8h1.941l-.31 2.023H9.094v4.892A7.001 7.001 0 0015 8z"
          />
          <path
            fill="#ffffff"
            d="M10.725 10.023L11.035 8H9.094V6.687c0-.553.27-1.093 1.14-1.093h.883V3.87s-.801-.137-1.567-.137c-1.6 0-2.644.97-2.644 2.724V8H5.13v2.023h1.777v4.892a7.037 7.037 0 002.188 0v-4.892h1.63z"
          />
        </svg>
        {isSigningInWithFacebook ? (
          <div className="flex items-center justify-center gap-2">
            <SpinLoadingColored />
            Processing...
          </div>
        ) : (
          "Continue with Facebook"
        )}
      </motion.button> */}
    </>
  );
};

export default SignInWithSocials;
