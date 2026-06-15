import { useCallback } from 'react';
import stringComparison from 'string-comparison';

const SIMILARITY_THRESHOLDS = {
  easy: 0.7,
  normal: 0.8,
  hard: 0.95
};

const algorithms = [
    stringComparison.jaroWinkler,
    stringComparison.levenshtein,
    stringComparison.diceCoefficient,
    stringComparison.cosine,
    stringComparison.longestCommonSubsequence
];

const useFuzzyMatching = (mode: string) => {
    const threshold = SIMILARITY_THRESHOLDS[mode as keyof typeof SIMILARITY_THRESHOLDS] || 0.8;

    const normalize = useCallback((text: string) => 
        text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[.,/#!$%^&*;:{}=\-_`~()"'“”‘’]/g, "")
            .replace(/\s+/g, " ")
            .trim()
    , []);
    const matchWords = useCallback((userWords: string[], targetWords: string[]) => {
        const matched = Array(targetWords.length).fill(false);
        const used = Array(userWords.length).fill(false);

        targetWords.forEach((target, tIdx) => {
        for (let uIdx = 0; uIdx < userWords.length; uIdx++) {
            if (mode === "hard" || !used[uIdx]) {
            if (algorithms.some(algo => algo.similarity(userWords[uIdx], target) >= threshold)) {
                matched[tIdx] = true;
                if (mode !== "hard") used[uIdx] = true;
                break;
            }
            }
        }
        });

        return matched;
    }, [mode, threshold]);

    return { normalize, matchWords };
};

export default useFuzzyMatching;
