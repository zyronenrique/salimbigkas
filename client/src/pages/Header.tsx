import { useState } from "react";
import Popup from "reactjs-popup";
import { motion } from "framer-motion";
import { imageSrc } from "../components/Icons/icons";
import { useAuth } from "../hooks/authContext";
import { LogOut, Settings } from "lucide-react";
import LogoutModal from "../components/Modals/LogoutModal";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
    handleTabChange?: (tab: string) => void;
}

const Header = ({ handleTabChange }: HeaderProps) => {
    const navigate = useNavigate();
    const { currentUser, role, gradeLevel } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className='flex items-center justify-between px-4 py-6 h-16 bg-[#F8F8F8]'>
            <div className='flex items-center justify-center space-x-4 z-0'>
                {role === "Student" && (
                    <img
                        loading="lazy"
                        src={imageSrc.schoolLogo}
                        alt="MDGSP"
                        className="block size-12 object-contain"
                    />
                )}
                <img
                    loading="lazy"
                    src={imageSrc.salimbigkasPng}
                    alt="Salimbigkas Logo"
                    className="block w-50 h-auto object-contain"
                />
            </div>
            <div className='flex items-center justify-center space-x-4'>
                <motion.button
                    title="Notifications"
                    type="button"
                    className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none ${role === "Student" ? "z-10" : ""}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        {role === "Student" ? navigate(`/${role?.toLowerCase()}/${gradeLevel?.toLowerCase()}/notifications`) : handleTabChange && handleTabChange("notifications")}
                    }}
                >
                    <img loading="lazy" src={imageSrc.bell} alt="Notifications" className="block size-8 object-contain" />
                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center">
                        <span className="relative flex size-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
                        </span>
                    </span>
                </motion.button>
                {role === "Student" && (
                    <Popup
                        trigger={
                            <motion.img
                                loading="lazy"
                                src={currentUser?.photoURL || imageSrc.man}
                                alt="Student Avatar"
                                className="h-10 w-10 rounded-full object-contain bg-[#FFA600] border border-gray-200 shadow-sm hover:cursor-pointer z-10"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            />
                        }
                        position="bottom right"
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
                        lockScroll={false}
                        children={
                        ((close: () => void) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col text-[#FFF9C4] bg-[#003311] shadow-xl rounded-lg mt-2 border-4 border-[#8a3903] min-w-[160px] focus:outline-none"
                                tabIndex={-1}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") close();
                                }}
                            >
                                <div className='flex flex-col items-center justify-center p-4 border-b-2 border-[#8a3903]'>
                                    <h1 className='text-lg font-bold'>{currentUser?.displayName}</h1>
                                    <p className='text-sm text-[#FFF9C4]/80'>{currentUser?.email}</p>
                                </div>
                                <button
                                    type="button"
                                    className="flex hover:bg-white/20 items-center px-6 py-4 space-x-2"
                                    onClick={() => {
                                        navigate(`/${role?.toLowerCase()}/${gradeLevel?.toLowerCase()}/settings`);
                                        close();
                                    }}
                                >
                                    <Settings size={20} />
                                    <span>Settings</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(!isModalOpen);
                                        close();
                                    }}
                                    className="flex items-center hover:bg-white/20 px-6 py-4 space-x-2"
                                    title="Logout"
                                >
                                    <LogOut className="inline" size={24} />
                                    <span>Log out</span>
                                </button>
                            </motion.div>
                        )) as any
                        }
                    />
                )}
            </div>
            {isModalOpen && (
                <div className={"fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"}>
                    <LogoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(!isModalOpen)} />
                </div>
            )}
        </div>
    )
}

export default Header;