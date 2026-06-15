import { SpinLoadingWhite } from '../Icons/icons';
import { BookOpen, Calendar, CirclePlus, LibraryBig, RotateCw, School2, Settings, TestTube2, User } from 'lucide-react';
import SkeletonActivity from '../SkeletonLoaders/SkeletonActivity';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/authContext';
import { fetchCurrentMonthActivities, getWordImages } from '../../utils/helpers';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { imageSrc } from '../Icons/icons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const Notifications = () => {
    const navigate = useNavigate();
    const { currentUser, role, setLoading: setIsLoading } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [allAct, setAllAct] = useState<any[]>([]);
    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            setIsLoading(true);
            const data = await fetchCurrentMonthActivities(currentUser?.uid || "");
            setAllAct(data.all);
            setLoading(false);
            setIsLoading(false);
        };
        fetchActivities();
    }, [refresh]);
    return (
        <div className="relative p-6 space-y-6 z-10">
            {/* Header section */}
            {role == "Student" && (
                <motion.button
                    title="Back"
                    type="button"
                    className="px-4 py-2 gap-2 flex items-center transition-colors duration-300"
                    onClick={() => navigate(-1)}
                    aria-label="Back"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                >
                    <img loading="lazy" src={imageSrc.back} alt="Back" className="size-10 object-contain" />
                    <div className="flex">
                        {getWordImages(`back`, true).map((imageSrc, index) => (
                            <img
                                loading="lazy"
                                key={index}
                                src={imageSrc || ""}
                                alt='back'
                                className={`block h-8 w-auto object-contain -mr-1`}
                            />
                        ))}
                    </div>
                </motion.button>
            )}
            <div className="flex items-center justify-between">
                <h1 className={`text-2xl font-bold tracking-tight ${role === 'Student' ? 'text-[#FFA600]' : 'text-[#2C3E50]'}`}>Notifications</h1>
                <button
                    title="Refresh Stats"
                    type="button"
                    className={`flex items-center gap-2 px-3 py-2 text-sm shadow-sm rounded-lg ${role === 'Student' ? 'bg-[#FFA600] text-[#2C3E50] hover:bg-gray-100' : 'bg-[#2C3E50] text-white hover:bg-[#1A2733]' } transition-colors duration-300`}
                    onClick={()=> setRefresh(!refresh)}
                >
                    {loading ?
                        <SpinLoadingWhite size={6}/>
                    : 
                        <RotateCw className="h-4 w-4" />
                    }
                </button>
            </div>
            <OverlayScrollbarsComponent
                options={{ scrollbars: { autoHide: "leave" } }}
                defer
                className={`flex flex-col text-left items-start justify-between p-6 rounded-lg ${role === 'Student' ? 'bg-[#FFA600] max-h-[70vh] overflow-y-auto' : 'bg-white shadow-sm border border-gray-200'}`}
            >
                <div className="w-full space-y-4">
                    {loading
                        ? <SkeletonActivity />
                        : allAct.length > 0 
                            ? allAct.map((act) => (
                                <div
                                    key={act.id}
                                    className="flex items-start gap-4 p-3 rounded-lg transition-colors duration-200 hover:bg-gray-50 justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full p-2 bg-[#2C3E50] flex items-center justify-center">
                                        {act.activity.includes("user") && (
                                            <User size={18} color="white" />
                                        )}
                                        {act.activity.includes("lesson") && (
                                            <BookOpen size={18} color="white" />
                                        )}
                                        {act.activity.includes("system") && (
                                            <Settings size={18} color="white" />
                                        )}
                                        {act.activity.includes("yunit") && (
                                            <LibraryBig size={18} color="white" />
                                        )}
                                        {act.activity.includes("event") && (
                                            <Calendar size={18} color="white" />
                                        )}
                                        {act.activity.includes("quiz") && (
                                            <TestTube2 size={18} color="white" />
                                        )}
                                        {act.activity.includes("class") && (
                                            <School2 size={18} color="white" />
                                        )}
                                        </div>
                                        <div className="flex-1">
                                        <h4 className="text-sm font-bold">{act.activity}</h4>
                                        <div className={`text-xs text-semibold ${role === 'Student' ? 'text-[#2C3E50]' : 'text-gray-500'} text-muted-foreground mt-1`}>
                                            {act.userName && <p>{act.userName}</p>}
                                            {act.userRole && <p>Role: {act.userRole}</p>}
                                        </div>
                                        </div>
                                    </div>
                                    <div className="text-xs">
                                        {act.timestamp && formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                                    </div>
                                </div>
                            ))
                            :
                            <div className="flex flex-col items-center justify-center py-4">
                                <CirclePlus size={40} className="text-gray-300 mb-3" />
                                <div className="text-lg font-semibold text-gray-500">No activities found</div>
                                <div className="text-sm text-gray-400 mt-1">You're all caught up!</div>
                            </div>
                    }
                </div>
            </OverlayScrollbarsComponent>
        </div>
    )
}

export default Notifications