import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/authContext';
import { database, dbRef, off, onValue } from '../../firebase/firebase';
import { imageSrc } from '../Icons/icons';
import { getWordImages } from '../../utils/helpers';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useClassContext } from '../../hooks/classContext';

interface LeaderboardEntry {
    uid: string;
    displayName: string;
    photoURL: string | null;
    gradeLevel: string | null;
    quizTaken: number;
    seatworkTaken: number;
    totalScore: number;
    updatedAt: number;
}

const QSLeaderboard = () => {
    const navigate = useNavigate();
    const { currentUser, gradeLevel, role, setLoading } = useAuth();
    const { isSeatWork } = useClassContext();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const leaderboardRef = dbRef(database, `leaderboard/${isSeatWork ? 'seatwork' : 'quiz'}/${gradeLevel}`);
        setLoading(true);
        const unsubscribe = onValue(leaderboardRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const entriesArray = Object.values(data) as LeaderboardEntry[];
                let filteredEntries = entriesArray;
                filteredEntries.sort((a, b) => {
                    b.totalScore !== a.totalScore
                    return b.totalScore - a.totalScore;
                });
                setEntries(filteredEntries);
            } else {
                setEntries([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching leaderboard:', error);
            setEntries([]);
            setLoading(false);
        });
        return () => {
            off(leaderboardRef, 'value', unsubscribe);
            setLoading(false);
        };
    }, [gradeLevel]);

    const userRank = entries.findIndex(e => e.uid === currentUser?.uid) + 1;

    const getRankIcon = useCallback((rank: number) => {
        switch (rank) {
        case 1: return imageSrc.trophy1;
        case 2: return imageSrc.trophy2;
        case 3: return imageSrc.trophy3;
        default: return `#${rank}`;
        }
    }, []);

    return (
        <div className={`relative min-h-screen ${role !== "Student" ? "bg-[#F8F8F8]" : "bg-[#FFA600]"} p-8`}>
            <motion.button
                title="Back"
                type="button"
                className="sticky top-10 left-10 z-10 flex items-center transition-colors duration-300"
                onClick={() => navigate(-1)}
                aria-label="Back"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
            >
                {getWordImages(`back`, true).map((imageSrc, index) => (
                <img
                    loading="lazy"
                    key={index}
                    src={imageSrc || ""}
                    alt='back'
                    className={`block h-10 w-auto object-contain -mr-1`}
                />
                ))}
            </motion.button>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                    {getWordImages(`leaderboard`, true).map((imageSrc, index) => (
                        <img
                            loading="lazy"
                            key={index}
                            src={imageSrc || ""}
                            alt='back'
                            className={`block h-12 w-auto object-contain -mr-1`}
                        />
                    ))}
                </div>
                <div className="bg-[#2C3E50] rounded-4xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className='flex items-center space-x-1'>
                            <h2 className="text-2xl font-bold text-white">
                                {userRank > 0 && <>You're in <span className="text-yellow-400">{userRank}{userRank === 1 ? 'st' : userRank === 2 ? 'nd' : userRank === 3 ? 'rd' : 'th'} place</span></>}
                            </h2>
                        </div>
                        <div className="flex space-x-2">
                            <h2 className="text-2xl text-white font-bold">{isSeatWork ? 'Seatwork' : 'Quiz'} ~ <span className="text-yellow-400">{gradeLevel}</span></h2>
                        </div>
                    </div>
                    {entries.length === 0 ? (
                        <div className="chalk-text text-center text-3xl py-8">
                            No scores yet. Be the first to play!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entries.slice(0, 10).map((entry, index) => (
                                <motion.div
                                    key={entry.uid}
                                    className={`flex items-center justify-between px-4 py-2 rounded-2xl transition-all duration-200 ${
                                        entry.uid === currentUser?.uid
                                        ? ' border-4 border-[#FFA600] bg-yellow-50 shadow-md'
                                        : ' border-2 border-gray-200 bg-gray-50 hover:bg-gray-100'
                                    }`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                <div className="flex items-center space-x-2">
                                    <div className="text-2xl font-bold w-12 text-center">
                                        {index + 1 <= 3 ? (
                                            <img
                                                loading="lazy"
                                                src={getRankIcon(index + 1)}
                                                alt={`Rank ${index + 1}`}
                                                className="size-14 object-contain"
                                            />
                                        ) : (
                                            <span>#{index + 1}</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        {entry.photoURL ? (
                                            <img
                                                loading="lazy"
                                                src={entry.photoURL}
                                                alt={entry.displayName}
                                                className="w-10 h-10 rounded-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#2C3E50] flex items-center justify-center">
                                                <span className="text-[#fff] font-bold">
                                                    {entry.displayName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className='flex flex-col text-left'>
                                            <p className="text-xl font-bold text-gray-800 items-center flex">
                                                {entry.displayName}
                                                {entry.uid === currentUser?.uid && (
                                                    <span className="ml-2 text-xs bg-[#2C3E50] text-white px-2 py-1 rounded">
                                                        You
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-[#2C3E50]">
                                        {entry.totalScore} pts
                                    </p>
                                    <p className="text-sm font-semibold text-gray-500">
                                        {(entry as any)[isSeatWork ? 'seatworkTaken' : 'quizTaken']} {isSeatWork ? 'seatwork' : 'quiz'} taken
                                    </p>
                                </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QSLeaderboard