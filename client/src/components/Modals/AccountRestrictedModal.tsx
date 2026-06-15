import { motion } from 'framer-motion';

interface AccountRestrictedModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AccountRestrictedModal = ({ isOpen, onClose }: AccountRestrictedModalProps) => {
    
    if (!isOpen) {
        return null;
    }
    
    return (
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
            {/* Close button */}
            <button
                type='button'
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors text-2xl focus:outline-none"
                onClick={onClose}
                aria-label="Close"
            >
                &times;
            </button>
            <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-red-500 size-15 items-center justify-center mx-auto">
                    <motion.div
                        className="text-5xl font-bold text-white size-15 flex items-center justify-center mx-auto"
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: [1, -1, 1] }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        !
                    </motion.div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-1 text-center">Account Restricted</h2>
                <p className="text-gray-600 text-center mb-2">
                    Your account is pending verification.<br />
                    Please wait for approval from the school administrator.
                </p>
            </div>
        </motion.div>
    );
}

export default AccountRestrictedModal;
