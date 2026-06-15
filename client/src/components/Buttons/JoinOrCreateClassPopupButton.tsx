import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import { useAuth } from "../../hooks/authContext";
import { useCallback } from "react";
import { useLogReg } from "../Modals/LogRegProvider";

interface JoinOrCreateClassPopupProps {
    triggerButton: React.ReactNode;
    setShowJoinClass: (v: boolean) => void;
    showJoinClass: boolean;
}

const JoinOrCreateClassPopup = ({
    triggerButton,
    setShowJoinClass,
    showJoinClass,
}: JoinOrCreateClassPopupProps) => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const { formattedGradeLevel } = useLogReg();
    
    const handleCreateClass = useCallback(() => {
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/add`);
    }, [navigate, role, formattedGradeLevel]);

    return (
        <Popup
            trigger={triggerButton}
            position="bottom center"
            on="click"
            closeOnDocumentClick
            arrow={false}
            contentStyle={{
                padding: 0,
                border: "none",
                background: "transparent",
                boxShadow: "none",
            }}
            nested
            lockScroll
            children={
                ((close: () => void) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col bg-white shadow-xl rounded-lg mt-2 border border-gray-200 min-w-[160px] focus:outline-none"
                        tabIndex={-1}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") close();
                        }}
                    >
                        <motion.button
                            type="button"
                            className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-100 rounded transition text-base"
                            onClick={() => {
                                handleCreateClass();
                                close();
                            }}
                            aria-label="Add users"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create new class
                        </motion.button>
                        <motion.button
                            type="button"
                            className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-100 rounded transition text-base"
                            onClick={() => {
                                setShowJoinClass(!showJoinClass);
                                close();
                            }}
                            aria-label="Add users"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Join class
                        </motion.button>
                    </motion.div>
                )) as any
            }
        />
    );
};

export default JoinOrCreateClassPopup;