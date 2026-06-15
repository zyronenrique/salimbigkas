import { memo, useCallback } from "react";
import Leaderboard from "./Leaderboard";
import { useBigkasContext } from "../../hooks/bigkasContext";
import { useAuth } from "../../hooks/authContext";
import { useNavigate } from "react-router-dom";
import { getWordImages } from "../../utils/helpers";
import { motion } from "framer-motion";
import { imageSrc } from "../Icons/icons";
import { useLogReg } from "../Modals/LogRegProvider";

const GameCompleted = memo(() => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { bigkasResults } = useBigkasContext();
  const { setSelectedLevel } = useBigkasContext();

  const handleBackToLevels = useCallback(() => {
    setSelectedLevel(null);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/bigkas/select-level`);
  }, [role, formattedGradeLevel, setSelectedLevel, navigate]);

  return (
    <div className={`relative min-h-screen ${role !== "Student" ? "bg-[#F8F8F8]" : "bg-[#FFA600]"} p-8`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col text-center mb-6 items-center justify-between gap-8">
          <div className="flex">
            {getWordImages(`leaderboard`, true).map((imageSrc, index) => (
              <img
                loading='lazy'
                key={index}
                src={imageSrc || ""}
                alt='leaderboard'
                className={`block h-12 w-auto object-contain -mr-1`}
              />
            ))}
          </div>
          {bigkasResults?.userTotalPoints !== undefined && (
            <p className="text-2xl text-[#2C3E50] font-bold">
              You got {bigkasResults?.userTotalPoints || 0} points
            </p>
          )}
        </div>
        <Leaderboard />
      </div>
      <motion.button
        title="Back"
        type="button"
        className="sticky top-10 left-1/2 transform -translate-x-1/2 z-10 mt-4 flex items-center transition-colors duration-300"
        onClick={handleBackToLevels}
        aria-label="Back"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
      >
        {getWordImages(`back`, true).map((imageSrc, index) => (
          <img
            loading='lazy'
            key={index}
            src={imageSrc || ""}
            alt='back'
            className={`block h-10 w-auto object-contain -mr-1`}
          />
        ))}
      </motion.button>
      <img
        loading='lazy'
        src={imageSrc.tagalogChampion}
        alt="Character"
        className="absolute left-0 bottom-0 hidden md:block h-[350px] object-contain opacity-50"
      />
      <img
        loading='lazy'
        src={imageSrc.tagalogTitan}
        alt="Character"
        className="absolute right-0 bottom-0 hidden md:block h-[350px] object-contain opacity-50"
      />
    </div>
  );
});

export default GameCompleted;