import { useState } from 'react'
import { motion } from 'framer-motion';
import NavButton from "../components/Buttons/NavButton";
import {
  LogOut,
} from "lucide-react";
import { imageSrc } from '../components/Icons/icons';
import LogoutModal from '../components/Modals/LogoutModal';
import { AdminNavItems, TeacherNavItems } from './DashboardConstant';
import { useAuth } from '../hooks/authContext';
import { useNavigate } from 'react-router-dom';

interface SideBarProps {
    role: 'Teacher' | 'Admin';
    activeTab: any;
    handleTabChange: (tab: any) => void;
}

const SideBar = ({ activeTab, handleTabChange, role }: SideBarProps) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <motion.div
                className={`w-20 bg-[#2C3E50] flex flex-col justify-between overflow-hidden text-white`}
                initial={{ x: -100, width: 80 }}
                animate={{ x: 0, width: isOpenMenu ? 80 : 256 }}
                // whileHover={{ width: 256 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                <div className="px-4 py-3 flex items-center gap-4">
                    <motion.img
                        loading="lazy"
                        src={imageSrc.schoolLogo}
                        alt="MDGSP"
                        className="block h-12 w-full object-contain"
                        onClick={() => setIsOpenMenu(!isOpenMenu)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    />
                    <h2 className="whitespace-nowrap font-extrabold">{role?.toUpperCase()}</h2>
                    <motion.img
                        loading="lazy"
                        src={imageSrc.symbol}
                        alt="Salimbigkas"
                        className="block h-12 w-full object-contain"
                        onClick={() => setIsOpenMenu(!isOpenMenu)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    />
                </div>
                <div className="flex flex-1">
                    <nav className="p-4 space-y-2 flex-1 flex flex-col items-center justify-center">
                        {(role === "Teacher" ? TeacherNavItems : role === "Admin" ? AdminNavItems : [])
                            .filter(item => item.tab !== "notifications" )
                            .map((item) => (
                            <NavButton
                                key={item.tab}
                                label={item.label}
                                icon={item.icon}
                                isActive={activeTab === item.tab}
                                onClick={() => handleTabChange(item.tab)}
                            />
                        ))}
                        <NavButton
                            label="Home"
                            icon={<img loading="lazy" src={imageSrc.homeTab} alt="Seatwork Tab" className="w-6 h-6 object-contain" />}
                            onClick={() => navigate("/")}
                        />
                    </nav>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <img
                                loading="lazy"
                                src={currentUser?.photoURL || imageSrc.woman}
                                alt="Avatar"
                                className="block w-full h-12 rounded-full border border-gray-200 object-contain"
                            />
                            <div className="w-[120px] text-left px-2">
                                <h3 className="text-sm font-bold truncate">
                                    {currentUser?.displayName}
                                </h3>
                                <h3 className="text-xs truncate">{currentUser?.email}</h3>
                            </div>
                        </div>
                        <motion.button
                            type="button"
                            onClick={() => setIsModalOpen(!isModalOpen)}
                            className="p-2 rounded-full hover:bg-gray-100 hover:text-[#2C3E50] transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                            title="Logout"
                        >
                            <LogOut size={24} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
            {isModalOpen && (
                <div className={"fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"}>
                    <LogoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(!isModalOpen)} />
                </div>
            )}
        </>
    )
}

export default SideBar