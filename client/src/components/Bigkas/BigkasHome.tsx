import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, SquareChevronDown } from "lucide-react";
import { SpinLoading, SpinLoadingWhite } from "../Icons/icons";
import { imageSrc } from "../Icons/icons";
import { getWordImages } from "../../utils/helpers";
import { useBigkasLevels } from "./useBigkasLevels";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authContext";
import Popup from "reactjs-popup";
import { useClassesState } from "../Class/useClassesState";
import { useBigkasContext } from "../../hooks/bigkasContext";
import { useLogReg } from "../Modals/LogRegProvider";

const BigkasHome = memo(() => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { allClassIds } = useClassesState();
  const { selectedGradeLevel, setSelectedGradeLevel } = useBigkasContext();
  const { state } = useBigkasLevels();
  const { formattedGradeLevel } = useLogReg();
  const selectedClass = allClassIds.find(cls => cls.gradeLevel === selectedGradeLevel);
  const selectedGradeNumber = selectedClass
    ? selectedClass.gradeLevel.replace(/\D/g, "")
    : "1";

  useEffect(() => {
    if (!selectedGradeLevel && allClassIds.length > 0) {
      const defaultClass = allClassIds[0];
      setSelectedGradeLevel(defaultClass.gradeLevel);
    }
  }, [allClassIds, selectedGradeLevel, setSelectedGradeLevel]);

  const handleNewLevel = () => {
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/bigkas/new-level`);
  };

  return (
    <div className={`relative ${role !== "Student" ? "bg-[#F8F8F8]" : "bg-[#FFA600]"} h-screen`}>
      <motion.button
        disabled={state.isLoading}
        type="button"
        title="Add new level"
        className="fixed bottom-4 right-4 size-16 z-50 bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#2980B9] shadow-2xl rounded-full flex items-center justify-center border-4 border-white hover:scale-105 active:scale-95 transition-all duration-200 group"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleNewLevel}
      >
        {state.isLoading ? (
          <SpinLoadingWhite size={10} />
        ) : (
          <motion.span
            className="relative flex items-center justify-center w-full h-full"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: [1, -1, 1] }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <Plus
              color="#fff"
              size={34}
              strokeWidth={2.2}
              className="drop-shadow-lg group-hover:rotate-10 transition-transform duration-200"
            />
          </motion.span>
        )}
      </motion.button>

      {/* Main Content */}
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
                  .map(({ gradeLevel }) => {
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
                          selectedGradeLevel !== gradeLevel && setSelectedGradeLevel(gradeLevel);
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
            src={imageSrc.bigkas}
            alt="Bigkas"
            className="hidden md:block w-full h-auto object-contain"
          />
          <motion.button
            disabled={state.isLoading}
            title="Start Bigkas"
            type="button"
            className="flex text-9xl font-bold text-center tracking-wider leading-tight absolute top-[85%] left-[47%] transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/bigkas/select-level`)}
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

BigkasHome.displayName = 'BigkasHome';

export default BigkasHome;