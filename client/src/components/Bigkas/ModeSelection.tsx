import { memo, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { getWordImages, isModeUnlocked } from "../../utils/helpers";
import { SpinLoadingWhite } from "../Icons/icons";
import { imageSrc } from "../Icons/icons";
import { useBigkasContext } from "../../hooks/bigkasContext";
import { useBigkasLevels } from "./useBigkasLevels";
import { useNavigate } from "react-router-dom";
import BigkasModal from "./BigkasModal";
import { doSetStartPlayingBigkas } from "../../api/functions";
import { useAuth } from "../../hooks/authContext";
import { toast } from 'react-toastify';
import CustomToast from '../Toast/CustomToast';
import Characters from "../../pages/Characters";
import { useLogReg } from "../Modals/LogRegProvider";

const ModeSelection = memo(() => {
  const navigate = useNavigate();
  const { currentUser, role, setLoading } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { selectedLevel, selectedMode, setSelectedMode, setBigkasResults } = useBigkasContext();
  const { state, updateState } = useBigkasLevels();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isModeCompleted, setIsModeCompleted] = useState(false);

  const onBack = useCallback(() => {
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/bigkas/select-level`)
  }, [navigate, role, formattedGradeLevel]);

  // Memoize modes to prevent recreation on every render
  const modes = useMemo(() => [
    { 
      label: "Easy", 
      value: "easy", 
      stars: 1, 
      phrases: selectedLevel?.easy, 
      isUnlocked: true,  
      isCompleted: selectedLevel?.modeCompletions?.easy?.isCompleted || false
    },
    { 
      label: "Normal", 
      value: "normal", 
      stars: 2, 
      phrases: selectedLevel?.normal, 
      isUnlocked: isModeUnlocked("normal", selectedLevel?.modeCompletions), 
      isCompleted: selectedLevel?.modeCompletions?.normal?.isCompleted || false
    },
    { 
      label: "Hard", 
      value: "hard", 
      stars: 3, 
      phrases: selectedLevel?.hard, 
      isUnlocked: isModeUnlocked("hard", selectedLevel?.modeCompletions), 
      isCompleted: selectedLevel?.modeCompletions?.hard?.isCompleted || false
    },
  ], [selectedLevel]);

  // Memoize hover handlers to prevent recreation
  const handleHoverStart = useCallback((idx: number, isUnlocked: boolean) => {
    if (isUnlocked) {
      setHoveredIndex(idx);
    }
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModeCompleted(false);
    setSelectedMode('');
  }, []);

  const handleStartGame = useCallback(async (mode: string, phrases: any[], resetProgress: boolean = false) => {
    updateState({ isLoading: true });
    setLoading(true);
    try {
      let progressId;
      if (selectedLevel.progressId) {
        progressId = selectedLevel.progressId;
      } else {
        const response = await doSetStartPlayingBigkas(
          currentUser?.uid || "", 
          selectedLevel?.id, 
          selectedLevel?.levelNumber, 
          mode
        ) as any;
        progressId = response?.id;
      }
      navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/bigkas/level-${selectedLevel?.levelNumber}/${mode}/${progressId}`, {
        state: {
          progressId,
          id: selectedLevel?.id,
          levelNumber: selectedLevel?.levelNumber,
          mode: mode,
          modePhrases: phrases,
          resetProgress,
        },
      });
    } catch (error) {
      toast.error(<CustomToast title="Error" subtitle="Failed to start Bigkas. Please try again." />);
    } finally {
      updateState({ isLoading: false });
      setLoading(false);
    }
  }, [selectedLevel, currentUser?.uid, role, formattedGradeLevel, navigate, updateState]);
  
  const handleShowPlayAgain = useCallback((mode: string) => {
    setSelectedMode(mode);
    setIsModeCompleted(true);
  }, []);
  
  const handleConfirmPlayAgain = useCallback(() => {
    if (selectedLevel && selectedMode) {
      const phrases = selectedLevel[selectedMode];
      handleStartGame(selectedMode, phrases, true);
      handleCloseModal();
    }
  }, [selectedLevel, selectedMode, handleStartGame]);

  // Memoize mode click handler
  const handleModeClick = useCallback((mode: any) => {
    if (!mode.isUnlocked || state.isLoading) return;
    if (mode.isCompleted) {
      // Show play again modal
      handleShowPlayAgain(mode.value);
    } else {
      // Start new game
      handleStartGame(mode.value, mode.phrases, false);
    }
  }, [state.isLoading, handleShowPlayAgain, handleStartGame]);

  // Memoize play again handler
  const handlePlayAgain = useCallback((mode: any) => {
    if (!state.isLoading) {
      handleShowPlayAgain(mode.value);
    }
  }, [state.isLoading, handleShowPlayAgain]);

  const handleShowCompleted = useCallback(() => {
    setBigkasResults({
      bigkasId: selectedLevel?.id,
      levelNumber: selectedLevel?.levelNumber,
      mode: selectedMode,
    });
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/bigkas/level-${selectedLevel?.levelNumber}/leaderboard`);
  }, [role, formattedGradeLevel, selectedLevel, selectedMode]);

  return (
    <div className={`relative flex flex-col md:flex-nowrap items-center justify-center ${role !== "Student" ? "bg-[#F8F8F8]" : "bg-[#FFA600]"} text-white min-h-screen`}>
      <div className="flex items-center justify-between w-full p-4 space-x-4">
        <motion.button
          title="Back"
          type="button"
          className="px-4 py-2 gap-2 flex items-center transition-colors duration-300"
          onClick={onBack}
          aria-label="Back to Level Selection"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
        >
          <img loading="lazy" src={imageSrc.back} alt="Back" className="size-10 object-contain" />
          <div className="flex">
            {getWordImages(`back`, true).map((imageSrc, index) => (
              <img
                loading="lazy"
                key={index}
                src={imageSrc || ""}
                alt='back'
                className={`block h-8 w-auto object-contain -mr-1`}
              />
            ))}
          </div>
        </motion.button>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#2C3E50]">
          Select Mode
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-end w-full h-full">
        {/* Think Robot Animation */}
        <div className="relative w-full flex justify-center items-center h-[300px]">
          <motion.img
            loading="lazy"
            src={imageSrc.thinkRobot}
            alt="Think Robot"
            className="hidden md:block h-50 mx-auto object-cover absolute top-0"
            animate={{
              x: hoveredIndex !== null
                ? hoveredIndex * 350 - 350
                : 0,
              y: hoveredIndex !== null ? -15 : 0,
              scale: hoveredIndex !== null ? 1.1 : 1,
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
          
          {/* Mode Selection Grid */}
          <div className="flex justify-center items-end w-full h-full gap-6 relative z-10 mt-50">
            {modes.map((mode, idx) => (
              <motion.div 
                key={mode.value} 
                className="relative flex flex-col items-center h-56 w-[320px]"
                whileHover={mode.isUnlocked ? { scale: 1.05 } : {}}
                whileTap={mode.isUnlocked ? { scale: 0.95 } : {}}
                onHoverStart={() => handleHoverStart(idx, mode.isUnlocked)}
                onHoverEnd={handleHoverEnd}
              >
                {/* Blackboard Background */}
                <img
                  loading="lazy"
                  src={imageSrc.blackboardMode}
                  alt="Blackboard Mode"
                  className={`block h-64 w-full object-contain transition-all duration-300 ${
                    !mode.isUnlocked ? 'filter brightness-50' : 
                    mode.isCompleted && hoveredIndex === idx ? 'filter brightness-50' : ''
                  }`}
                />
                
                {/* Mode Button */}
                <button
                  disabled={state.isLoading || !mode.isUnlocked}
                  title={mode.isUnlocked ? mode.label : "Mode Locked"}
                  type="button"
                  className={`chalk-text absolute inset-0 flex flex-col items-center justify-center text-5xl font-bold bg-transparent transition-colors duration-300 ${
                    !mode.isUnlocked ? 'cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleModeClick(mode)}
                >
                  {state.isLoading ? (
                    <SpinLoadingWhite size={20} />
                  ) : (
                    <>
                      <span className={`${!mode.isUnlocked || mode.isCompleted && hoveredIndex === idx ? 'opacity-25' : ''}`}>
                        {mode.label}
                      </span>
                      <div className="flex gap-1 mt-2">
                        {Array.from({ length: mode.stars }, (_, starIdx) => (
                          <motion.img
                            loading="lazy"
                            key={starIdx}
                            src={imageSrc.star}
                            alt="Star"
                            className={`size-10 transition-transform duration-300 animate-pulse object-contain ${
                              mode.isCompleted && hoveredIndex === idx ? 'filter brightness-25' : !mode.isUnlocked ? 'filter brightness-25' : ''
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: starIdx * 0.1 }}
                          />
                        ))}
                      </div>
                      {!mode.isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img loading="lazy" src={imageSrc.locked} alt="Locked" className="size-16 object-contain" />
                        </div>
                      )}
                      {mode.isCompleted && (
                        <div className={`absolute top-5 right-5 ${mode.isCompleted && hoveredIndex === idx ? 'filter brightness-25' : ''}`}>
                          <img loading="lazy" src={imageSrc.check} alt="Completed" className="size-16 object-contain" />
                        </div>
                      )}
                    </>
                  )}
                </button>
                {/* Settings - Shows on hover for completed modes */}
                {mode.isCompleted && mode.isUnlocked && hoveredIndex === idx && (
                  <div className="absolute inset-0 flex items-center justify-center bg-opacity-30 rounded">
                    <motion.button 
                      disabled={state.isLoading}
                      title="Settings"
                      type="button"
                      className="flex text-white"
                      onClick={() => handlePlayAgain(mode)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <img loading="lazy" src={imageSrc.settings} alt="Settings" className="size-16 object-contain" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      {/* Character Images */}
      {role !== "Student" && <Characters />}
      {isModeCompleted && (
        <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center">
          <BigkasModal 
            type="playAgain" 
            isOpen={isModeCompleted} 
            onClose={handleCloseModal}  
            onConfirm={handleConfirmPlayAgain}
            onLeaderboard={handleShowCompleted}
          />
        </div>
      )}
    </div>
  );
});

ModeSelection.displayName = 'ModeSelection';

export default ModeSelection;