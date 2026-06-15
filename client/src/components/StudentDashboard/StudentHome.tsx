import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpinLoading } from '../Icons/icons';
import { getWordImages } from '../../utils/helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authContext';
import { useBigkasLevels } from '../Bigkas/useBigkasLevels';
import { imageSrc } from '../Icons/icons';
import { useClassContext } from '../../hooks/classContext';
import { doGetClassNameById } from "../../api/functions";
import { useLogReg } from '../Modals/LogRegProvider';

const StudentHome = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, role, classId, setLoading } = useAuth();
    const { formattedGradeLevel } = useLogReg();
    const { state, refreshLevels } = useBigkasLevels();
    const { setClassName, className, setIsSeatWork } = useClassContext();

    useEffect(() => {
        if (location.state?.shouldRefresh) {
          refreshLevels();
          window.history.replaceState({}, document.title);
        }
    }, [location.state, refreshLevels]);

    useEffect(() => {
        const fetchClassName = async () => {
            if (classId) {
                setLoading(true);
                const response = await doGetClassNameById(classId) as any;
                setClassName(response?.className);
            }
            setLoading(false);
        };
        fetchClassName();
    }, [classId]);

    const handleNavigate = useCallback((mode: string, insideMode?: string) => {
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/${mode}${insideMode ? `/${insideMode}` : ''}`);
    }, [navigate, role, formattedGradeLevel]);

    const gameModes = [
        {
            img: imageSrc.lesson,
            icon: null,
            title: "lesson",
            onClick: () => handleNavigate('my-courses'),
        },
        {
            img: imageSrc.quiz,
            icon: imageSrc.leaderboard,
            title: "quiz",
            onClickLeaderboard: () => {
                setIsSeatWork(false);
                navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/leaderboard`);
            },
            onClick: () => {
                setIsSeatWork(false);
                handleNavigate('quizzes','select-quiz')
            },
        },
        {
            img: imageSrc.seatwork,
            icon: imageSrc.leaderboard,
            title: "seatwork",
            onClickLeaderboard: () => {
                setIsSeatWork(true);
                navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/leaderboard`);
            },
            onClick: () => {
                setIsSeatWork(true);
                handleNavigate('seatworks','select-seatwork')
            },
        },
        {
            img: imageSrc.bigkas,
            icon: null,
            title: "bigkas",
            onClick: () => handleNavigate('bigkas', 'select-level'),
        },
    ];
    const [centerIdx, setCenterIdx] = useState(0);
    const prevSlide = () => setCenterIdx((centerIdx - 1 + gameModes.length) % gameModes.length);
    const nextSlide = () => setCenterIdx((centerIdx + 1) % gameModes.length);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] w-full">
            {className && (
                <h1 className="text-4xl text-gray-600 font-bold mb-8 text-center italic">
                    Welcome {currentUser?.displayName} to {className}!
                </h1>
            )}
            <div className="relative flex items-center justify-center w-[800px] h-[500px]">
                <motion.button
                    title='Left'
                    type='button'
                    onClick={prevSlide}
                    className="absolute left-5 z-10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <img loading="lazy" src={imageSrc.lessThan} alt="Left Arrow" className="size-12 object-contain" />
                </motion.button>
                <div className="relative w-full h-full">
                    <AnimatePresence initial={false}>
                        {gameModes.map((mode, idx) => {
                            const pos = idx - centerIdx;
                            if (Math.abs(pos) > 1 && Math.abs(pos) !== gameModes.length - 1) return null;
                            let style = {};
                            let x = 0;
                            if (pos === 0) {
                                style = {
                                    scale: 1.1,
                                    opacity: 1,
                                    filter: "none",
                                    zIndex: 2,
                                };
                                x = 0;
                            } else if (pos === 1 || pos === -3) {
                                style = {
                                    scale: 0.85,
                                    opacity: 0.5,
                                    filter: "blur(2px)",
                                    zIndex: 1,
                                };
                                x = 250;
                            } else if (pos === -1 || pos === 3) {
                                style = {
                                    scale: 0.85,
                                    opacity: 0.5,
                                    filter: "blur(2px)",
                                    zIndex: 1,
                                };
                                x = -250;
                            }
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ x: pos > 0 ? 200 : -200, opacity: 0, scale: 0.7 }}
                                    animate={{ x, ...style }}
                                    exit={{ x: pos > 0 ? 200 : -200, opacity: 0, scale: 0.7 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="absolute flex flex-col items-center justify-center bg-gradient-to-b from-[#FFA600] via-[#FFCE18] to-[#FFA600] rounded-xl shadow-2xl w-full h-full mx-2"
                                >
                                    <img loading="lazy" src={mode.img} alt={mode.title} className="block w-full h-[400px] mx-2 object-contain" />
                                    {mode.icon && (
                                        <motion.img 
                                            loading="lazy" 
                                            src={mode.icon} 
                                            title={`Leaderboard`}
                                            alt={`${mode.title}-icon`} 
                                            className="block w-16 h-16 object-contain absolute top-4 left-4"
                                            onClick={mode.onClickLeaderboard}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        />
                                    )}
                                    <motion.button
                                        disabled={state.isLoading}
                                        title={`Play ${mode.title}`}
                                        type="button"
                                        className={`flex text-9xl font-bold text-center tracking-wider leading-tight absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-300 
                                            ${mode.title === "bigkas" ? "top-[80%]" : `${mode.title === "quiz" ? "top-[80%]" : "top-[85%]"}`}
                                        `}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={mode.onClick}
                                    >
                                        {state.isLoading ? (
                                            <SpinLoading size={14} />
                                        ) : (
                                            <>
                                                {getWordImages(mode.title, true).map((imageSrc, index) => (
                                                    <img 
                                                        loading='lazy'
                                                        key={index} 
                                                        src={imageSrc || ""} 
                                                        alt={`Letter ${index}`} 
                                                        className={`block h-14 w-auto object-contain 
                                                            ${mode.title === "seatwork" && 
                                                                (index > 0 && index <= 2) ? "-ml-1" 
                                                                : mode.title === "seatwork" && (index > 2 && index <= 3) ? "-ml-3" 
                                                                : mode.title === "bigkas" && (index > 3 && index <= 4) ? "-ml-3"
                                                                : mode.title === "bigkas" && index > 4 ? "-ml-2"
                                                                : "-ml-1"
                                                            }
                                                        `}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
                <motion.button
                    title='Right'
                    type='button'
                    onClick={nextSlide}
                    className="absolute right-0 z-10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <img loading="lazy" src={imageSrc.greaterThan} alt="Right Arrow" className="size-12 object-contain" />
                </motion.button>
            </div>
        </div>
    )
}

export default StudentHome