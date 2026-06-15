import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { getWordImages, isLevelUnlocked } from "../../utils/helpers";
import { useBigkasLevels } from "./useBigkasLevels";
import { imageSrc, SpinLoadingWhite } from "../Icons/icons";
import { useNavigate } from "react-router-dom";
import { useBigkasContext } from "../../hooks/bigkasContext";
import Characters from "../../pages/Characters";
import { useAuth } from "../../hooks/authContext";
import { useLogReg } from "../Modals/LogRegProvider";

const LevelSelection = memo(() => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { setSelectedLevel } = useBigkasContext();
  const { state, handlePrevYunit, handleNextYunit, canGoPrev, canGoNext } = useBigkasLevels();
  
  const onSelectLevel = useCallback((level: string, levelNumber: number) => {
    setSelectedLevel(level);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/bigkas/level-${levelNumber}/select-mode`);
  }, [setSelectedLevel, navigate, role, formattedGradeLevel]);

  return (
    <div className={`relative flex flex-col md:flex-nowrap h-screen items-center ${role !== "Student" ? "bg-[#F8F8F8]" : "bg-[#FFA600]"} text-white`}>
      <div className="flex items-center justify-between w-full p-4 space-x-4">
        <motion.button
          title="Back"
          type="button"
          className="px-4 py-2 gap-2 flex items-center transition-colors duration-300"
          onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}${role === "Student" ? "" : "/bigkas"}`)}
          aria-label="Back"
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
          Select Level
        </h1>
      </div>

      {/* Yunit Title */}
      {state.levels[state.selectedYunitNumber]?.length > 0 && (
        <div className="flex items-end justify-center w-full py-6">
          {getWordImages(`Yunit ${state.selectedYunitNumber}`, true).map((imageSrc, index) => (
            <img
              loading="lazy"
              key={index}
              src={imageSrc || ""}
              alt={`Yunit ${state.selectedYunitNumber}`}
              className={`block h-10 w-auto object-contain ${
                index > 3 ? 'mr-3' : ''
              }`}
            />
          ))}
        </div>
      )}

      {/* Levels Grid with Navigation */}
      <div className="relative flex items-center justify-center w-full h-1/2 z-10">
        {/* Previous Button */}
        {state.levels[state.selectedYunitNumber]?.length > 0 && (
          <div className="w-1/4 flex items-center justify-center p-4">
            <motion.button
              disabled={!canGoPrev}
              title="Previous Yunit"
              type="button"
              className="flex items-start justify-center"
              onClick={handlePrevYunit}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <img loading="lazy" src={imageSrc.lessThan} alt="Less Than" className="size-16 object-contain"/>
            </motion.button>
          </div>
        )}

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 w-full max-h-[550px] overflow-y-auto hide-scrollbar mx-auto z-10">
          {state.levels[state.selectedYunitNumber]?.length > 0 ? ( 
            state.levels[state.selectedYunitNumber].map((level: any, index: number) => {
              const unlocked = isLevelUnlocked(index, state.levels[state.selectedYunitNumber]);
              return (
                <motion.div
                  key={index}
                  className={`relative flex flex-col items-center mx-auto h-60 w-[300px] ${
                    !unlocked ? 'cursor-not-allowed' : ''
                  }`}
                  whileHover={unlocked ? { scale: 1.05 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <img
                    loading="lazy"
                    src={imageSrc.blackboardLevel}
                    alt={`Level ${level.levelNumber}`}
                    className={`block h-full w-full object-contain ${
                      !unlocked ? 'filter brightness-50' : ''
                    }`}
                  />
                  <button
                    title={unlocked ? `Level ${level.levelNumber}` : "Level Locked"}
                    type="button"
                    disabled={!unlocked}
                    className={`chalk-text absolute inset-0 flex flex-col items-center justify-center text-6xl font-bold bg-transparent transition-colors duration-300 ${
                      !unlocked ? 'cursor-not-allowed' : ''
                    }`}
                    onClick={() => unlocked && onSelectLevel(level, level.levelNumber)}
                  >
                    <span className={`${!unlocked ? 'opacity-25' : ''}`}>
                      Level {level.levelNumber}
                    </span>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img loading="lazy" src={imageSrc.locked} alt="Locked" className="size-16 object-contain" />
                      </div>
                    )}
                    {level.isCompleted && (
                      <div className="absolute top-10 right-10">
                        <img loading="lazy" src={imageSrc.check} alt="Completed" className="size-16 object-contain" />
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })) : state.isLoading ? (
              <div className="flex col-span-3 items-center justify-center font-bold h-80 gap-4">
                <SpinLoadingWhite size={16} />
                <p className="chalk-text text-8xl">Loading levels...</p>
              </div>
            ) : (
              <div className="flex col-span-3 items-center justify-center font-bold h-80">
                <p className="chalk-text text-8xl">No levels available</p>
              </div>
            )}
        </div>

        {/* Next Button */}
        {state.levels[state.selectedYunitNumber]?.length > 0 && (
          <div className="w-1/4 flex items-center justify-center p-4">
            <motion.button
              disabled={!canGoNext}
              title="Next Yunit"
              type="button"
              className="flex items-center justify-center"
              onClick={handleNextYunit}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <img loading="lazy" src={imageSrc.greaterThan} alt="Greater Than" className="size-16 object-contain" />
            </motion.button>
          </div>
        )}
      </div>
      {role !== "Student" && <Characters />}
    </div>
  );
});

LevelSelection.displayName = 'LevelSelection';

export default LevelSelection;