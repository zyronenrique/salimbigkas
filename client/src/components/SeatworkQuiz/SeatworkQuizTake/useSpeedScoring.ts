import { useCallback } from 'react';

const useSpeedScoring = () => {
    const calculateScore = useCallback((answerTime: number, isCorrect: boolean, questionTimeLimit: number) => {
        if (!isCorrect) return 0;
        const answerTimeSeconds = answerTime / 1000;
        const basePoints = 1000;
        const timeRatio = Math.max(0, (questionTimeLimit - answerTimeSeconds) / questionTimeLimit);
        const speedBonus = Math.floor(timeRatio * 1000);
        return basePoints + speedBonus;
    }, []);
    const calculateFinalGrade = useCallback((totalScore: number, totalQuestions: number) => {
        const maxPossibleScore = totalQuestions * 2000;
        const percentage = (totalScore / maxPossibleScore) * 100;
        return Math.round(percentage);
    }, []);
    return {
        calculateScore,
        calculateFinalGrade
    };
};

export default useSpeedScoring;