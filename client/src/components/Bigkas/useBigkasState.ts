import { useState, useCallback, useRef, useMemo } from 'react';
import { CallBackProps, STATUS, Step } from 'react-joyride';

interface GameState {
  currentPhraseIndex: number;
  timer: number;
  isActive: boolean;
  paused: boolean;
  isExiting: boolean;
  phraseCompleted: boolean;
  showPopup: boolean;
  wordResults: (null | boolean)[];
  phrases: any[];
  showSpeed: boolean;
  run: boolean;
  stepIndex: number;
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

  const steps: Step[] = [
    {
      target: '[data-joyride="sidebar-timer"]',
      content: 'Heto ang timer! Subukan mong tapusin ang parirala bago ito mag-timeout. Kayang-kaya mo ’yan!',
      placement: 'auto',
      disableBeacon: true,
    },
    {
      target: '[data-joyride="sidebar-phrase-progress"]',
      content: 'Dito mo makikita ang iyong progreso!',
      placement: 'auto',
    },
    {
      target: '[data-joyride="bigkas-listen-button"]',
      content: 'Pindutin ito para marinig kung paano bigkasin ang parirala. Makinig nang mabuti!',
      placement: 'auto',
    },
    {
      target: '[data-joyride="bigkas-phrase"]',
      content: 'Ito ang pariralang kailangan mong bigkasin. Ipakita ang galing mo!',
      placement: 'auto',
    },
    {
      target: '[data-joyride="bigkasin-button"]',
      content: 'Ready na? Pindutin para bigkasin ang parirala.',
      placement: 'auto',
    },
    {
      target: '[data-joyride="scorepanel-points"]',
      content: 'Dito mo makikita ang iyong puntos.',
      placement: 'auto',
    },
    {
      target: '[data-joyride="scorepanel-words"]',
      content: 'Tingnan kung ilang salita ang nakuha mo nang tama.',
      placement: 'auto',
    },
  ];

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
      wordResults: [],
      phrases: processedPhrases,
      showSpeed: false,
      currentSpeed: 'normal',
      run: true,
      stepIndex: 0,
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
      return {
        ...prev,
        phrases: newPhrases,
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

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setState(prev => ({
        ...prev,
        run: false,
      }));
    } else if (type === 'step:after' && typeof index === 'number') {
      setState(prev => ({
        ...prev,
        stepIndex: action === 'prev' ? index - 1 : index + 1,
      }));
    }
  }, []);
  
  return { 
    state,
    updateState, 
    resetForNewPhrase, 
    updatePhraseScore, 
    decrementTimer, 
    getCurrentPhrases, 
    userTotalPoints, 
    userTotalWords, 
    completionPercentage,
    steps,
    run: state.run,
    stepIndex: state.stepIndex,
    handleJoyrideCallback,
  };
};
