import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { SpinLoading } from "../Icons/icons";
import { imageSrc } from "../Icons/icons";
import { getWordImages } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authContext";
import { useQuizzesState } from "./SeatworkQuizTake/useQuizzesState";
import Popup from "reactjs-popup";
import { useClassesState } from "../Class/useClassesState";
import { SquareChevronDown } from "lucide-react";
import { useSeatworkQuizContext } from "../../hooks/seatworkQuizContext";
import { useLogReg } from "../Modals/LogRegProvider";

const QuizHome = memo(() => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { allClassIds } = useClassesState();
  const { selectedClassId, setSelectedClassId } = useSeatworkQuizContext();
  const { state } = useQuizzesState();
  const selectedClass = allClassIds.find(cls => cls.id === selectedClassId);
  const selectedGradeNumber = selectedClass
    ? selectedClass.gradeLevel.replace(/\D/g, "")
    : "1";

  useEffect(() => {
    if (!selectedClassId && allClassIds.length > 0) {
      const defaultClass = allClassIds[0];
      setSelectedClassId(defaultClass.id);
    }
  }, [allClassIds, selectedClassId, setSelectedClassId]);

  return (
    <div className="relative bg-[#F8F8F8] h-screen">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <Popup
          trigger={
            <motion.button
              disabled={state.isLoading}
              type="button"
              title="Select Grade Level"
              className="flex mb-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getWordImages(`grade ${selectedGradeNumber}`, true).map((imageSrc, index) => (
                <img 
                  loading="lazy"
                  key={index} 
                  src={imageSrc || ""} 
                  alt={`Letter ${index}`} 
                  className={`block h-12 w-auto object-contain ${
                    index > 1 && index <= 4 ? '-ml-2' : index > 4 ? 'ml-4' : ''
                  }`}
                />
              ))}
              <SquareChevronDown className="self-center ml-2" size={34} color="#2C3E50" />
            </motion.button>
          }
          position="bottom center"
          on="click"
          closeOnDocumentClick
          arrow={false}
          contentStyle={{
            padding: 0,
            border: "none",
            background: "transparent",
            boxShadow: "none",
          }}
          overlayStyle={{
            background: "rgba(0,0,0,0.05)",
          }}
          nested
          lockScroll
          children={
            ((close: () => void) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col bg-[#FFA600] shadow-xl rounded-lg mt-2 p-4"
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key === "Escape") close();
                }}
              >
                {[...allClassIds]
                  .sort((a, b) => {
                    const gradeA = parseInt(a.gradeLevel.replace(/\D/g, ""), 10);
                    const gradeB = parseInt(b.gradeLevel.replace(/\D/g, ""), 10);
                    return gradeA - gradeB;
                  })
                  .map(({ id, gradeLevel }) => {
                    const gradeNumber = gradeLevel.replace(/\D/g, "");
                    return (
                      <motion.button
                        key={gradeNumber}
                        type="button"
                        title={`Select Grade ${gradeNumber}`}
                        className="flex my-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          selectedClassId !== id && setSelectedClassId(id);
                          close();
                        }}
                      >
                        {getWordImages(`grade ${gradeNumber}`, true).map((imageSrc, index) => (
                          <img 
                            loading="lazy"
                            key={index} 
                            src={imageSrc || ""} 
                            alt={`Letter ${index}`} 
                            className={`block h-8 w-auto object-contain ${
                              index > 1 && index <= 4 ? '-ml-2' : index > 4 ? 'ml-4' : ''
                            }`}
                          />
                        ))}
                      </motion.button>
                    );
                })}
              </motion.div>
            )) as any
          }
        />
        <div className="relative w-full max-w-4xl mx-auto">
          <img
            loading="lazy"
            src={imageSrc.quiz}
            alt="Quiz"
            className="hidden md:block w-full h-auto object-contain"
          />
          <motion.button
            disabled={state.isLoading}
            title="Start Quiz"
            type="button"
            className="flex text-9xl font-bold text-center tracking-wider leading-tight absolute top-[85%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/quizzes/select-quiz`)}
          >
            {state.isLoading ? (
              <SpinLoading size={20} />
            ) : (
              <>
                {getWordImages("play", true).map((imageSrc, index) => (
                  <img 
                    loading="lazy"
                    key={index} 
                    src={imageSrc || ""} 
                    alt={`Letter ${index}`} 
                    className={`block h-20 w-auto object-contain ${
                      index > 2 ? '-ml-4' : ''
                    }`}
                  />
                ))}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
});

QuizHome.displayName = 'QuizHome';

export default QuizHome;