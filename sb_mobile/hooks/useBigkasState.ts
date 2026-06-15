import { useState, useCallback, useRef, useMemo } from 'react';

interface GameState {
  currentPhraseIndex: number;
  timer: number;
  isActive: boolean;
  paused: boolean;
  isExiting: boolean;
  phraseCompleted: boolean;
  showPopup: boolean;
  isSpeaking: boolean;
  wordResults: (null | boolean)[];
  phrases: any[];
  isGameCompleted: boolean;
}

export const useBigkasState = (initialPhrases: any[], maxTime: number, resetProgress = false) => {
  const processedPhrases = useMemo(() => {
    return initialPhrases?.map(phrase => ({
      ...phrase,
      isContinue: resetProgress ? false : (phrase.isContinue || false),
      userPoints: resetProgress ? 0 : (phrase.userPoints || 0),
      userWords: resetProgress ? 0 : (phrase.userWords || 0)
    }));
  }, [initialPhrases, resetProgress]);
  const [state, setState] = useState<GameState>(() => {
    const nextIncompleteIndex = processedPhrases?.findIndex(p => !p.isContinue);
    return {
      currentPhraseIndex: nextIncompleteIndex !== -1 ? nextIncompleteIndex : 0,
      timer: maxTime,
      isActive: false,
      paused: false,
      isExiting: false,
      phraseCompleted: false,
      showPopup: false,
      isSpeaking: false,
      wordResults: [],
      phrases: processedPhrases,
      isGameCompleted: false,
    };
  });
  const currentPhrasesRef = useRef(state.phrases);
  currentPhrasesRef.current = state.phrases;
  const updatePhraseScore = useCallback((phraseIndex: number, correctWords: number, basePoints: number) => {
    const pointsEarned = correctWords * basePoints;
    setState(prev => {
      const newPhrases = prev.phrases.map((p, idx) => 
        idx === phraseIndex 
          ? {
              ...p,
              userPoints: pointsEarned,
              userWords: correctWords,
              isContinue: true
            }
          : p
      );
      const allCompleted = newPhrases.every(p => p.isContinue);
      return {
        ...prev,
        phrases: newPhrases,
        isGameCompleted: allCompleted,
      };
    });
  }, []);
  const resetForNewPhrase = useCallback((phraseIndex: number) => {
    setState(prev => {
      const wordCount = prev.phrases[phraseIndex]?.text.split(" ").length || 0;
      return {
        ...prev,
        currentPhraseIndex: phraseIndex,
        timer: maxTime,
        isActive: false,
        isSpeaking: false,
        phraseCompleted: false,
        wordResults: Array(wordCount).fill(null)
      };
    });
  }, [maxTime]);

  const updateState = useCallback((updates: Partial<GameState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const decrementTimer = useCallback(() => {
    setState(prev => ({ ...prev, timer: prev.timer - 1 }));
  }, []);

  const getCurrentPhrases = useCallback(() => currentPhrasesRef.current, []);
  const userTotalPoints = useMemo(() => 
    state.phrases?.reduce((sum: number, p: any) => sum + (p.userPoints || 0), 0),
    [state.phrases]
  );
  const userTotalWords = useMemo(() => 
    state.phrases?.reduce((sum: number, p: any) => sum + (p.userWords || 0), 0),
    [state.phrases]
  );
  const completionPercentage = useMemo(() => {
    const completed = state.phrases?.filter(p => p.isContinue).length;
    return state.phrases?.length > 0 ? (completed / state.phrases.length) * 100 : 0;
  }, [state.phrases]);
  
  return { state, updateState, resetForNewPhrase, updatePhraseScore, decrementTimer, getCurrentPhrases, userTotalPoints, userTotalWords, completionPercentage };
};
