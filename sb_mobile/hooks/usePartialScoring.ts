import { useCallback } from "react";
import { combineUserAnswerWithClues } from "../utils/helpers";

export const usePartialScoring = (questions: any[]) => {
    const calculateScoreForQuestion = useCallback((qIdx: number, answers:{ [key: string]: any }) => {
        const q = questions[qIdx];
        switch (q.type) {
            case "multiple":
                return answers[q.id] === q.numAnswer ? 1 : 0;
            case "identification":
                const userInput = answers[q.id];
                const correctAnswer = q.answer;
                if (!correctAnswer) return 0;
                const cluePositions = answers[`${q.id}-cluePositions`];
                const combinedAnswer = combineUserAnswerWithClues(userInput, correctAnswer, cluePositions);
                answers[`${q.id}-combined`] = combinedAnswer;
                if (combinedAnswer === correctAnswer) return 1;
                if (userInput) {
                    let correctCount = 0;
                    let userIndex = 0;
                    for (let i = 0; i < correctAnswer.length; i++) {
                        if (!cluePositions.includes(i)) {
                            if (userIndex < userInput.length && 
                                userInput[userIndex]?.toUpperCase() === correctAnswer[i]?.toUpperCase()) {
                                correctCount++;
                            }
                            userIndex++;
                        }
                    }
                    const totalUserPositions = correctAnswer.length - cluePositions.length;
                    return totalUserPositions > 0 ? (correctCount / totalUserPositions) : 0;
                }
                return 0;
            case "enumeration":
                const userBoxes = answers[`${q.id}-boxes`] || [];
                const correctItemsData = q.correctItems || {};
                let correctItemsCount = 0;
                let totalItemsCount = 0;
                Object.values(correctItemsData).forEach((items: any) => {
                    if (Array.isArray(items)) {
                        totalItemsCount += items.length;
                    }
                });
                Object.keys(correctItemsData).forEach((categoryName, catIdx) => {
                    const correctItems = correctItemsData[categoryName] || [];
                    const userItems = userBoxes[catIdx] || [];
                    correctItems.forEach((correctItem: string) => {
                        if (userItems.includes(correctItem)) {
                            correctItemsCount++;
                        }
                    });
                });
                return totalItemsCount > 0 ? (correctItemsCount / totalItemsCount) : 0;
            case "matching":
                const userMatches = answers[q.id] || [];
                const correctMatches = q.matches || [];
                let correctMatchesCount = 0;
                correctMatches.forEach((correctMatch: number, leftIdx: number) => {
                    if (userMatches[leftIdx] === correctMatch) {
                        correctMatchesCount++;
                    }
                });
                const totalMatches = correctMatches.length;
                return totalMatches > 0 ? (correctMatchesCount / totalMatches) : 0;
            case "syllable":
                const targetWord = q.targetWord || "";
                const userSyllableOrder = answers[`${q.id}-0`] || [];
                const correctSyllableParts = q.syllableParts || [];
                const syllableCluePositions = answers[`${q.id}-syllableCluePositions`] || [];
                const userArrangedSyllables = userSyllableOrder.map((index: number) => correctSyllableParts[index] || '');
                const userArrangement = userArrangedSyllables.join('');
                if (userArrangement === targetWord.toLowerCase().trim()) {
                    return 1;
                } else {
                    let correctSyllablesCount = 0;
                    let totalUserSyllables = 0;
                    for (let i = 0; i < correctSyllableParts.length; i++) {
                        if (!syllableCluePositions.includes(i)) {
                            totalUserSyllables++;
                            if (i < userArrangedSyllables.length && 
                                userArrangedSyllables[i] === correctSyllableParts[i]) {
                                correctSyllablesCount++;
                            }
                        }
                    }
                    return totalUserSyllables > 0 ? (correctSyllablesCount / totalUserSyllables) : 0;
                }
            default:
                return 0;
        }
    }, [questions]);

    const calculateTotalPossibleScore = useCallback(() => {
        return questions.reduce((total: number, q: any) => {
            switch (q.type) {
                case "multiple":
                case "identification":
                case "syllable":
                    return total + 1;
                
                case "enumeration":
                    const correctItemsData = q.correctItems || {};
                    let totalItems = 0;
                    Object.values(correctItemsData).forEach((items: any) => {
                        if (Array.isArray(items)) {
                            totalItems += items.length;
                        }
                    });
                    return total + (totalItems > 0 ? 1 : 0);
                
                case "matching":
                    const totalMatches = (q.matches || []).length;
                    return total + (totalMatches > 0 ? 1 : 0);
                
                default:
                    return total;
            }
        }, 0);
    }, [questions]);

    return { calculateScoreForQuestion, calculateTotalPossibleScore };
};