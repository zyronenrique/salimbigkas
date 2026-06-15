import React from 'react';
import { SquareX } from 'lucide-react';

interface QuizNavigationProps {
    onClose: () => void;
    isSubmitting: boolean;
    timer: number;
    currentQuestionIndex: number;
    totalQuestions: number;
    score: number;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
    onClose,
    isSubmitting,
    timer,
    currentQuestionIndex,
    totalQuestions,
    score,
}) => {
    return (
        <nav className="bg-[#2C3E50] w-20 rounded-l-3xl shadow-2xl p-6 flex flex-col items-center justify-between border border-[#2C3E50]/30 min-h-[350px]">
            <div className="flex flex-col items-center">
                <button
                    type="button"
                    disabled={isSubmitting}
                    className="relative w-14 h-14 flex flex-col items-center justify-center rounded-full font-semibold text-base transition-all duration-200 bg-[#2C3E50] text-white hover:bg-[#34495e] hover:scale-105 shadow-lg group"
                    onClick={onClose}
                    aria-label="Close quiz"
                    title="Close quiz"
                >
                    <SquareX size={28} />
                    <span className="absolute left-18 bg-[#2C3E50] text-white px-6 py-4 rounded-r-lg shadow-lg text-base font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        Close Quiz
                    </span>
                </button>
            </div>

            {/* Middle Section - Timer and Progress */}
            <div className="flex flex-col items-center space-y-6 text-white">
                {/* Timer */}
                <div className="flex flex-col items-center">
                    <div className={`text-2xl font-bold ${timer <= 5 ? 'text-red-400 animate-pulse' : ''}`}>
                        {timer}
                    </div>
                    <div className="text-xs text-gray-300">seconds</div>
                </div>

                {/* Progress */}
                <div className="flex flex-col items-center">
                    <div className="text-lg font-semibold">
                        {currentQuestionIndex + 1}/{totalQuestions}
                    </div>
                    <div className="text-xs text-gray-300">questions</div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center">
                    <div className="text-lg font-bold text-yellow-400">
                        {score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-300">points</div>
                </div>
            </div>
        </nav>
    );
};

export default QuizNavigation;