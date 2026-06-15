import { useEffect, useState } from 'react'
import { doGetAllUsersCurrentMonthActivities } from '../../api/functions';
import { SpinLoadingColored } from '../Icons/icons';
import { Minus, BookOpen, Calendar, CalendarDays, School2, TestTube2, CirclePlus, LibraryBig, RotateCw, Settings, User } from 'lucide-react';
import SkeletonActivity from '../SkeletonLoaders/SkeletonActivity';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/authContext';

const Logs = () => {
    const { setLoading: setIsLoading } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [logs, setLogs] = useState<any[]>([]);
    const getCurrentMonthRange = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        return [format(firstDay), format(lastDay)];
    };
    const [startDate, setStartDate] = useState<string>(() => getCurrentMonthRange()[0]);
    const [endDate, setEndDate] = useState<string>(() => getCurrentMonthRange()[1]);
    const getISODateRange = (start: string, end: string) => {
        const startISO = start ? new Date(`${start}T00:00:00.000Z`).toISOString() : "";
        const endISO = end ? new Date(`${end}T23:59:59.999Z`).toISOString() : "";
        return [startISO, endISO];
    };
    const [startISO, endISO] = getISODateRange(startDate, endDate);
    useEffect(() => {
        const fetchAndSetLogs = async () => {
            setLoading(true);
            setIsLoading(true);
            try {
                const response = await doGetAllUsersCurrentMonthActivities(startISO, endISO) as any;
                if (response?.activities) {
                    const allActs = Object.values(response.activities).flat();
                    setLogs(allActs);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
                setIsLoading(false);
            }
        };
        fetchAndSetLogs();
    }, [refresh]);
    
    return (
        <div className="p-6 space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
                <div className='flex items-center gap-2'>
                    <form className='flex items-center gap-2'>
                        <div className="text-left relative">
                            <input
                                disabled={refresh}
                                title='Start Date'
                                name="Start Date"
                                type="date"
                                id="Start-Date"
                                required
                                max={`${new Date().getFullYear()}-12-31`}
                                className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${startDate ? "border-[#2C3E50]" : "border-gray-300"}`}
                                placeholder=" "
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <label
                                className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${startDate ? "bg-[#F8F8F8] top-[-14px] text-[#2C3E50] text-lg" : "top-4 text-gray-500 text-base"}`}
                                htmlFor="Start Date"
                            >
                                {startDate ? "From" : ""}
                            </label>
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#2C3E50] pointer-events-none">
                                <CalendarDays size={20} />
                            </span>
                        </div>
                        <Minus className="text-[#2C3E50]" size={20} />
                        <div className="text-left relative">
                            <input
                                disabled={refresh}
                                title='End Date'
                                name="End Date"
                                type="date"
                                id="End-Date"
                                required
                                max={`${new Date().getFullYear()}-12-31`}
                                className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${endDate ? "border-[#2C3E50]" : "border-gray-300"}`}
                                placeholder=" "
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <label
                                className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${endDate ? "bg-[#F8F8F8] top-[-14px] text-[#2C3E50] text-lg" : "top-4 text-gray-500 text-base"}`}
                                htmlFor="End Date"
                            >
                                {endDate ? "To" : ""}
                            </label>
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#2C3E50] pointer-events-none">
                                <CalendarDays size={20} />
                            </span>
                        </div>
                        <button
                            title="Refresh"
                            type="button"
                            className="flex items-center gap-2 p-4 text-sm shadow-sm rounded-lg border border-gray-200 hover:bg-gray-100"
                            onClick={()=> setRefresh(!refresh)}
                        >
                            {loading ?
                                <SpinLoadingColored size={6}/>
                            : 
                                <RotateCw size={22} />
                            }
                        </button>
                    </form>
                </div>
            </div>
            <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
                <div className="w-full space-y-4">
                    {loading
                        ? <SkeletonActivity />
                        : logs.length > 0 
                            ? logs.map((act) => (
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
                                        <h4 className="text-sm font-medium">{act.activity}</h4>
                                        <div className="text-xs text-gray-500 text-muted-foreground mt-1">
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
                                <div className="text-lg font-semibold text-gray-500">No logs found</div>
                                <div className="text-sm text-gray-400 mt-1">You're all caught up!</div>
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Logs;