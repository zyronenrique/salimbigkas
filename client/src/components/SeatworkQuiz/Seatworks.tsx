import { motion } from "framer-motion";
import { useSeatworksState } from "./SeatworkQuizTake/useSeatworksState";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authContext";
import { 
  getWordImages, 
  // isLevelUnlocked 
} from "../../utils/helpers";
import { imageSrc, SpinLoadingWhite } from "../Icons/icons";
import Characters from "../../pages/Characters";
import { useSeatworkQuizContext } from "../../hooks/seatworkQuizContext";
import { useLogReg } from "../Modals/LogRegProvider";
import { useCallback } from "react";
import { useClassContext } from "../../hooks/classContext";

const Seatworks = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { setSelectedSeatwork, setSeatworkResults } = useSeatworkQuizContext();
  const { setIsSeatWork } = useClassContext();
  const { 
    state,
    lessons,
    canGoPrevYunit, 
    canGoNextYunit, 
    canGoPrevLesson, 
    canGoNextLesson,
    handlePrevYunit,
    handleNextYunit,
    handlePrevSeatworks,
    handleNextSeatworks,
  } = useSeatworksState();
  
  const currentYunit = state.seatworksByYunit[state.selectedYunitIndex];
  const currentLesson = lessons[state.selectedLessonIndex];
  
  const handleSeatworkSelect = useCallback((seatwork: any) => {
    setIsSeatWork(true);
    setSelectedSeatwork(seatwork);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/seatworks/${seatwork.category}/${seatwork.id}`);
  }, [formattedGradeLevel, navigate, role, setSelectedSeatwork]);

  const handleSeatworkResult = useCallback((seatwork: any, category: string) => {
    setIsSeatWork(true);
    setSelectedSeatwork(seatwork);
    setSeatworkResults(seatwork.response);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/seatworks/${category}/${seatwork.id}/results`);
  }, [formattedGradeLevel, navigate, role, setSeatworkResults, setSelectedSeatwork]);

  return (
    <div className={`relative flex flex-col md:flex-nowrap w-full h-screen items-center ${role !== "Student" ? "bg-[#F8F8F8]" : "bg-[#FFA600]"} text-white`}>
      <div className="flex items-center justify-between w-full p-4 space-x-4">
        <motion.button
          title="Back"
          type="button"
          className="px-4 py-2 gap-2 flex items-center transition-colors duration-300"
          onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/${role !== "Student" ? "seatworks" : ""}`)}
          aria-label="Bumalik sa mga Yunit"
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
        {currentYunit?.yunitNumber && (
          <div className="flex items-center py-4">
            <div className="w-1/4 flex items-center justify-center mx-6">
              <motion.button
                disabled={!canGoPrevYunit}
                title="Previous Lesson"
                type="button"
                className="flex items-start justify-center"
                onClick={handlePrevYunit}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                <img loading="lazy" src={imageSrc.lessThan} alt="Less Than" className="size-10 object-contain"/>
              </motion.button>
            </div>
            <div className="flex items-end justify-center w-full">
              {getWordImages(`Yunit ${currentYunit?.yunitNumber}`, true).map((imageSrc, index) => (
                <img
                  loading="lazy"
                  key={index}
                  src={imageSrc || ""}
                  alt={`Yunit ${currentYunit?.yunitNumber}`}
                  className={`block h-12 w-auto object-contain ${
                    index > 3 ? 'mr-3' : ''
                  }`}
                />
              ))}
            </div>
            <div className="w-1/4 flex items-center justify-center mx-6">
              <motion.button
                disabled={!canGoNextYunit}
                title="Next Yunit"
                type="button"
                className="flex items-center justify-center"
                onClick={handleNextYunit}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                <img loading="lazy" src={imageSrc.greaterThan} alt="Greater Than" className="size-10 object-contain" />
              </motion.button>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-[#2C3E50]">
          Select Seatwork
        </h1>
      </div>
      <div className="relative flex flex-col items-center justify-center w-full h-1/2 z-10">
        {/* Lesson Title */}
        {currentLesson?.seatworks && currentLesson.seatworks.length > 0 && (
          <div className="flex items-end justify-center w-full py-6">
            {getWordImages(`Lesson ${currentLesson?.lessonNumber}`, true).map((imageSrc, index) => (
              <img
                loading="lazy"
                key={index}
                src={imageSrc || ""}
                alt={`Lesson ${currentLesson?.lessonNumber}`}
                className={`block h-8 w-auto object-contain ${
                  index > 4 ? 'mr-3' : ''
                }`}
              />
            ))}
          </div>
        )}
        {/* Seatworks Grid with Navigation */}
        <div className="flex w-full">
          {/* Previous Button */}
          {currentLesson?.seatworks && currentLesson.seatworks.length > 0 && (
            <div className="w-1/4 flex items-center justify-center p-4">
              <motion.button
                disabled={!canGoPrevLesson}
                title="Previous Lesson"
                type="button"
                className="flex items-start justify-center"
                onClick={handlePrevSeatworks}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                <img loading="lazy" src={imageSrc.lessThan} alt="Less Than" className="size-16 object-contain"/>
              </motion.button>
            </div>
          )}
          {/* Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 flex-wrap gap-6 p-4 w-full max-h-[550px]mx-auto z-10">
            {currentLesson?.seatworks && currentLesson.seatworks.length > 0 ? (
              currentLesson?.seatworks?.map((seatwork: any, index: number) => {
                const unlocked = currentLesson.isUnlocked && (index === 0 || currentLesson.seatworks[index - 1]?.response);
                return (
                  <motion.div
                    key={seatwork.id}
                    className={`relative flex flex-col items-center mx-auto h-52 w-[300px] ${
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
                      alt={`Seatwork ${index + 6}`}
                      className={`block h-full w-full object-contain ${
                        !unlocked ? 'filter brightness-50' : ''
                      }`}
                    />
                    <button
                      title={unlocked ? seatwork.category : "Seatwork Locked"}
                      type="button"
                      disabled={!unlocked}
                      className={`chalk-text absolute inset-0 flex flex-col items-center justify-center text-6xl font-bold bg-transparent transition-colors duration-300 ${
                        !unlocked ? 'cursor-not-allowed' : ''
                      }`}
                      onClick={
                        unlocked && !seatwork.response
                          ? () => handleSeatworkSelect(seatwork)
                          : seatwork.response
                          ? () => handleSeatworkResult(seatwork, seatwork.category)
                          : undefined
                      }
                    >
                      <span className={`${!unlocked ? 'opacity-25' : ''}`}>
                        {seatwork.category}
                      </span>
                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img loading="lazy" src={imageSrc.locked} alt="Locked" className="size-16 object-contain" />
                        </div>
                      )}
                      {seatwork.response && (
                        <div className="absolute top-4 right-4">
                          <img loading="lazy" src={imageSrc.check} alt="Completed" className="size-16 object-contain" />
                        </div>
                      )}
                    </button>
                  </motion.div>
                )
              })
            ) : state.isLoading ? (
              <div className="flex col-span-3 items-center justify-center font-bold w-full h-80 gap-4">
                <SpinLoadingWhite size={16} />
                <p className="chalk-text text-8xl">Loading seatworks...</p>
              </div>
            ) : (
              <div className="flex col-span-3 items-center justify-center font-bold w-full h-80">
                <p className="chalk-text text-8xl">No seatworks available</p>
              </div>
            )}
          </div>

          {/* Next Button */}
          {currentLesson?.seatworks && currentLesson.seatworks.length > 0 && (
            <div className="w-1/4 flex items-center justify-center p-4">
              <motion.button
                disabled={!canGoNextLesson}
                title="Next Lesson"
                type="button"
                className="flex items-center justify-center"
                onClick={handleNextSeatworks}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                <img loading="lazy" src={imageSrc.greaterThan} alt="Greater Than" className="size-16 object-contain" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
      {role !== "Student" && <Characters />}
    </div>
  );
};

export default Seatworks;
