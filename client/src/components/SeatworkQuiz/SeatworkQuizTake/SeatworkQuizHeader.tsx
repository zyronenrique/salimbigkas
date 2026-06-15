import { useEffect, useState } from "react";
import { SquareX, Image, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { imageSrc } from "../../Icons/icons";
import { motion } from "framer-motion";

interface QuizHeaderProps {
    isSubmitting: boolean;
    currentQuestion: any;
    currentQuestionIndex: number;
    totalQuestions: number;
    totalScore: number;
    timer: number;
    questionTime: number;
    run: boolean;
}

const QuizHeader = ({ isSubmitting, currentQuestion, currentQuestionIndex, totalQuestions, totalScore, timer, questionTime, run }: QuizHeaderProps) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState<number>(run ? 0 : timer);
    const [openTimer, setOpenTimer] = useState<boolean>(run ? true : false);
    const [openImage, setOpenImage] = useState<boolean>(false);
    // const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!run) {
            setTimeLeft(timer);
            setOpenTimer(false);
        }
    }, [run, timer]);

    useEffect(() => {
        // if (isPaused) return;
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    useEffect(() => {
        setTimeLeft(timer);
    }, [timer, currentQuestionIndex]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = ((questionTime - timeLeft) / questionTime) * 100;
    const isWarning = timeLeft <= 10;
    const isCritical = timeLeft <= 5;
    
    return (
        <div className="flex items-center justify-between mb-2 py-2">
            <div className="flex items-center gap-2">
                <motion.button
                    type="button"
                    disabled={isSubmitting}
                    className="relative flex flex-col items-center justify-center font-semibold text-base p-4"
                    onClick={() => navigate(-1)}
                    title="Close quiz"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <SquareX size={24} strokeWidth={2} />
                </motion.button>
                <span className="font-extrabold mr-2" data-joyride="swq-question-number">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <div 
                    className={`px-4 py-1 rounded-full ${
                        currentQuestion?.type === 'multiple-choice' ? 'bg-[#3b82f6]' :
                        currentQuestion?.type === 'identification' ? 'bg-[#10b981]' :
                        currentQuestion?.type === 'enumeration' ? 'bg-[#ece114]' :
                        currentQuestion?.type === 'matching' ? 'bg-[#8b5cf6]' :
                        'bg-[#ef4444]'
                    }`}
                    data-joyride="swq-type"
                >
                    <h1 className="text-[#2C3E50] font-bold">{currentQuestion?.type.replace('-', ' ')}</h1>
                </div>
                {(run || currentQuestion.image) && (
                    <motion.button
                        disabled={isSubmitting || run}
                        type="button"
                        title="View question image"
                        className="relative flex items-center justify-center p-2 rounded-full bg-[#2C3E50] text-white"
                        onClick={() => setOpenImage(!openImage)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        data-joyride="swq-question-image"
                    >
                        <Image size={24} />
                    </motion.button>
                )}
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2" data-joyride="swq-score">
                    <h2 className="text-lg font-bold text-[#2C3E50]">Score:</h2>
                    <div className="flex items-center gap-1">
                        <span className="text-3xl font-bold text-[#2C3E50]">{totalScore}</span>
                        <span className="text-xl font-bold text-[#2C3E50]">pts</span>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 relative" data-joyride="swq-timer">
                    <motion.div
                        key={timeLeft}
                        className="relative"
                        initial={{ scale: 1 }}
                        animate={{ scale: isCritical ? 1.2 : isWarning ? 1.1 : 1 }}
                        transition={{ duration: 0.3 }}
                        title={isCritical ? 'Hurry up! Time is almost up!' : isWarning ? 'Time is running out!' : 'Time left'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setOpenTimer(!openTimer)}
                    >
                        <div className={`w-12 h-12 flex items-center justify-center transition-all duration-300 `}>
                            <img loading='lazy' src={imageSrc.clock} alt="Clock" className="size-8" />
                        </div>
                        <svg className="absolute top-0 left-0 w-12 h-12 transform -rotate-90">
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="transparent"
                                stroke={isCritical ? '#ef4444' : isWarning ? '#eab308' : '#8a3903'}
                                strokeWidth="6"
                                strokeDasharray={`${progressPercentage * 1.25} 125`}
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                    </motion.div>
                    {openTimer && (
                        <div 
                            className={`absolute top-full flex items-center bg-[#003311] border-4 rounded-lg px-3 py-1
                                border-[${isCritical ? '#ef4444' : isWarning ? '#eab308' : '#8a3903'}]
                            `}
                            data-joyride="swq-timer"
                        >
                            <span 
                                className={`text-xl font-bold transition-colors duration-300 ${
                                    isCritical 
                                    ? 'text-red-500' 
                                    : isWarning 
                                        ? 'text-yellow-600' 
                                        : 'text-white'
                                }`}
                            >
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {openImage && currentQuestion.image && (
                <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center" data-joyride="swq-question-image">
                    <motion.button
                        type="button"
                        className="absolute top-5 right-5 p-2 rounded-full bg-white text-black"
                        onClick={() => setOpenImage(!openImage)}
                        title="Close image"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <X size={24} strokeWidth={2} />
                    </motion.button>
                    <img
                        loading="eager"
                        src={currentQuestion.image}
                        alt={`Question ${currentQuestionIndex + 1} image`}
                        className="rounded-lg w-96 h-auto border-2 border-[#F39C12]"
                    />
                </div>
            )}
        </div>
    );
};

export default QuizHeader;