import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doSetSaveProgressBigkas } from "../../api/functions";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { useAuth } from "../../hooks/authContext";
import { useBigkasState } from "./useBigkasState";
import { useFuzzyMatching } from "./useFuzzyMatching";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useTimer } from "../Timer/useTimer";
import GameSidebar from "./GameSidebar";
import Blackboard from "./Blackboard";
import ScorePanel from "./ScorePanel";
import BigkasModal from "./BigkasModal";
import { useBigkasContext } from "../../hooks/bigkasContext";
import { buildJobsFromText, createAudioForJob, stepAudios } from "../../utils/helpers";
import Joyride from 'react-joyride';
import { useAudioQueue } from "../Lesson/useAudioQueue";
import { useLogReg } from "../Modals/LogRegProvider";
import JoyrideCustomTooltip from "../Modals/JoyrideCustomTooltip";

const PlayBigkas = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = useMemo(() => 
    location.state || {}, 
    [location.state]
  );
  const { progressId, id, levelNumber, mode, modePhrases, resetProgress } = locationState;
  const { currentUser, role, loading, setLoading } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { setBigkasResults } = useBigkasContext();
  const maxTime = useMemo(() => 
    mode === "easy" ? 60 : mode === "normal" ? 45 : 30,
    [mode]
  );
  const { 
    state, 
    updateState, 
    resetForNewPhrase, 
    updatePhraseScore, 
    decrementTimer, 
    getCurrentPhrases, 
    userTotalPoints, 
    userTotalWords ,
    steps,
    run,
    stepIndex,
    handleJoyrideCallback,
  } = useBigkasState(modePhrases?.phrases, maxTime, resetProgress);
  const { normalize, matchWords } = useFuzzyMatching(mode);
  const stopListeningRef = useRef<(() => void) | null>(null);
  const currentPhrase = useMemo(() => 
    state.phrases?.[state.currentPhraseIndex],
    [state.phrases, state.currentPhraseIndex]
  );
  const audioQueue = useAudioQueue(createAudioForJob);
  
  // Save progress function
  const saveProgress = useCallback(async () => {
    setLoading(true);
    try {
      const currentPhrases = getCurrentPhrases();
      const latestTotalPoints = currentPhrases.reduce((sum, p) => sum + (p.userPoints || 0), 0);
      const latestTotalWords = currentPhrases.reduce((sum, p) => sum + (p.userWords || 0), 0);
      if (role === "Student") {
        await doSetSaveProgressBigkas(
          currentUser?.uid || "", 
          id, 
          progressId, 
          levelNumber, 
          mode, 
          currentPhrases, 
          latestTotalPoints,
          latestTotalWords, 
          modePhrases.totalWords
        );
      }
      toast.success(<CustomToast title="Progress Saved" subtitle="Your progress has been saved successfully." />);
      setBigkasResults({
        bigkasId: id,
        userTotalPoints: latestTotalPoints,
        levelNumber: parseInt(levelNumber),
        mode,
      });
      navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/bigkas/level-${levelNumber}/leaderboard`);
    } catch (error) {
      toast.error(<CustomToast title="Error" subtitle="Failed to save progress." />);
    } finally {
      setLoading(false);
    }
  }, [
    role, 
    currentUser?.uid, 
    id, 
    progressId, 
    levelNumber, 
    mode, 
    getCurrentPhrases, 
    userTotalPoints, 
    userTotalWords, 
    modePhrases?.totalWords
  ]);
  
  // Handle exit with progress save
  const handleExitWithSave = useCallback(async () => {
    await saveProgress();
    navigate(`/${role}/bigkas`);
  }, [saveProgress, navigate, role]);

  // Handle next phrase
  const handleNextPhrase = useCallback(async () => {
    if (state.currentPhraseIndex < state.phrases?.length - 1) {
      resetForNewPhrase(state.currentPhraseIndex + 1);
    } else {
      updateState({ phraseCompleted: true });
      await saveProgress();
    }
  }, [state.currentPhraseIndex, state.phrases?.length, resetForNewPhrase, updateState, saveProgress]);

  // Handle timer timeout
  const handleTimerTimeout = useCallback(() => {
    if (stopListeningRef.current) {
      stopListeningRef.current();
    }
    const correctWordsCount = state.wordResults.filter(Boolean).length;
    updateState({ 
      isActive: false, 
      phraseCompleted: true, 
      showPopup: correctWordsCount > 0
    });
    if (correctWordsCount > 0) {
      updatePhraseScore(state.currentPhraseIndex, correctWordsCount, modePhrases.basePoints);
      setTimeout(() => {
        updateState({ showPopup: false });
        handleNextPhrase();
      }, 2000);
    } else {
      setTimeout(() => {
        handleNextPhrase();
      }, 1000);
    }
  }, [state.wordResults, state.currentPhraseIndex, updateState, updatePhraseScore, modePhrases?.basePoints, handleNextPhrase]);

  // Handle phrase completion
  const handlePhraseComplete = useCallback((correctWordsCount: number) => {
    if (stopListeningRef.current) {
      stopListeningRef.current();
    }
    updateState({ 
      isActive: false, 
      phraseCompleted: true, 
      showPopup: true,
    });
    updatePhraseScore(state.currentPhraseIndex, correctWordsCount, modePhrases.basePoints);
    setTimeout(() => {
      updateState({ showPopup: false });
      handleNextPhrase();
    }, 2000);
  }, [updateState, updatePhraseScore, state.currentPhraseIndex, modePhrases?.basePoints, handleNextPhrase]);

  // Handle speech recognition result
  const handleSpeechResult = useCallback((transcript: string) => {
    if (state.phraseCompleted || state.paused) return;
    const userWords = normalize(transcript).split(/\s+/);
    const targetWords = normalize(currentPhrase.text).split(/\s+/);
    const matched = matchWords(userWords, targetWords);
    updateState({ wordResults: matched });
    if (matched.every(Boolean) && matched.length === targetWords.length) {
      handlePhraseComplete(matched.filter(Boolean).length);
    }
  }, [state.phraseCompleted, state.paused, currentPhrase?.text, normalize, matchWords, updateState, handlePhraseComplete]);
  
  const { startListening, stopListening } = useSpeechRecognition(handleSpeechResult);
  stopListeningRef.current = stopListening;

  useTimer({
    timer: state.timer,
    isActive: !state.paused && !state.phraseCompleted && !run,
    onTick: decrementTimer,
    onTimeout: handleTimerTimeout,
  });
  const handlePause = useCallback(() => {
    stopListening();
    updateState({ paused: true, isActive: false });
  }, [stopListening, updateState]);
  const handleResume = useCallback(() => {
    stopListening();
    updateState({ paused: false, isActive: false });
  }, [stopListening, updateState]);
  const handleStartListening = useCallback(() => {
    updateState({ isActive: true });
    startListening();
  }, [updateState, startListening]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (run && steps[stepIndex] && stepAudios[stepIndex]) {
      const audio = new Audio(stepAudios[stepIndex]);
      audioRef.current = audio;
      audio.play().catch(() => {});
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [run, stepIndex, steps, stepAudios]);

  // Speak phrase
  const handleSpeak = useCallback(async (speed: "normal" | "slow") => {
    const jobs = buildJobsFromText(currentPhrase?.text, speed === "slow" ? 0.7 : 1);
    await audioQueue.playQueue(jobs);
  }, [buildJobsFromText, currentPhrase?.text, audioQueue]);

  return (
    <>
      <div className={`relative flex items-center justify-between ${role !== "Student" ? "bg-[#F8F8F8]" : "bg-[#FFA600]"} text-white`}>
        <Joyride
          tooltipComponent={JoyrideCustomTooltip}
          callback={handleJoyrideCallback}
          steps={steps}
          run={run}
          stepIndex={stepIndex}
          continuous
          showSkipButton
          spotlightClicks
          styles={{
            options: {
              width: 300,
              arrowColor: '#a3380d',
              zIndex: 1000,
            },
          }}
        />
        <GameSidebar
          timer={state.timer}
          maxTime={maxTime}
          paused={state.paused}
          onPause={handlePause}
          onResume={handleResume}
        />
        <Blackboard 
          loading={loading}
          phrase={currentPhrase}
          wordResults={state.wordResults}
          isActive={state.isActive}
          onListen={handleStartListening}
          onSpeak={handleSpeak}
          showSpeed={state.showSpeed}
          updateState={updateState}
          run={run}
          audioQueue={audioQueue}
        />
        <ScorePanel 
          mode={mode}
          phrases={state.phrases}
          currentPhrase={state.currentPhraseIndex + 1}
          totalPhrases={state.phrases?.length}
          totalPoints={modePhrases?.totalPoints}
          totalWords={modePhrases?.totalWords}
          showPopup={state.showPopup}
          isActive={state.isActive}
          userTotalPoints={userTotalPoints}
          userTotalWords={userTotalWords}
        />
      </div>
      {state.paused && (
        <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center">
          <BigkasModal 
            type="pause" 
            isExiting={state.isExiting} 
            isOpen={state.paused} 
            onClose={handleResume} 
            onExitWithSave={handleExitWithSave} 
          />
        </div>
      )}
    </>
  );
});

export default PlayBigkas;