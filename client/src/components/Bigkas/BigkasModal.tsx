import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { imageSrc, SpinLoadingWhite } from "../Icons/icons";

interface BigkasModalProps {
  isExiting?: boolean;
  type: "pause" | "playAgain";
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onExitWithSave?: () => void;
  onLeaderboard?: () => void;
}

const BigkasModal = memo(({ isExiting, type, isOpen, onClose, onConfirm, onExitWithSave, onLeaderboard }: BigkasModalProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleLeaderboard = useCallback(() => {
    if (onLeaderboard) {
      onLeaderboard();
    }
    onClose();
  }, [onLeaderboard, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <motion.div
        className={`relative flex-1 max-w-[500px] p-8`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.4 },
        }}
      >
        <img 
          loading="lazy"
          src={imageSrc.blackboardMode} 
          alt="Blackboard Mode" 
          className={`absolute inset-0 w-full ${type === "playAgain" ? "h-auto" : "h-full"} object-contain z-0`}
        />
        {/* Modal content */}
        <div className={`relative z-10 flex  ${type === "playAgain" ? "gap-4 mt-6" : "flex-col"} items-center justify-center w-full h-full py-12 px-10`}>
          {type === "playAgain" ? (
            <>
              <motion.button
                title="Exit"
                type="button"
                className="chalk-text flex text-[3rem] text-[#FFF9C4] text-center tracking-widest"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  loading="lazy"
                  src={imageSrc.gameX} 
                  alt="Close" 
                  className="h-24 w-auto object-contain" 
                />
              </motion.button>
              <motion.button
                title={"Play Again"}
                type="button"
                className={`chalk-text flex text-[4rem] text-[#FFF9C4] text-center tracking-wider`}
                onClick={handleConfirm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  loading="lazy"
                  src={imageSrc.refreshBox}
                  alt="Play Again"
                  className="h-24 w-auto object-contain"
                />
              </motion.button>
              <motion.button
                title={"Leaderboard"}
                type="button"
                className={`chalk-text flex text-[4rem] text-[#FFF9C4] text-center tracking-wider`}
                onClick={handleLeaderboard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  loading="lazy"
                  src={imageSrc.trophyBox}
                  alt="Play Again"
                  className="h-24 w-auto object-contain"
                />
              </motion.button>
            </>
          ):(
            <>
              <motion.button
                disabled={type === "pause" && isExiting}
                title={"Continue"}
                type="button"
                className={`chalk-text flex text-[5rem] mt-1 text-[#FFF9C4] text-center tracking-wider`}
                onClick={handleConfirm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue?
              </motion.button>
              <div className="chalk-text -mt-4 text-[1.5rem] text-[#FFF9C4] text-lg">or</div>
              <motion.button
                disabled={type === "pause" && isExiting}
                title="Exit"
                type="button"
                className="chalk-text flex mt-1 text-[3rem] text-[#FFF9C4] text-center tracking-widest"
                onClick={onExitWithSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isExiting ? <SpinLoadingWhite size={6} /> : "Save & Exit"}
              </motion.button>
            </>
          )}
          <p className="absolute bottom-3 text-sm font-bold text-[#FFF9C4] text-center">
            {type === "playAgain"
              ? "Note: Playing again will reset your progress."
              : "Note: Exiting will save your progress."}
          </p>
        </div>
      </motion.div>
    </>
  );
});

export default BigkasModal;
