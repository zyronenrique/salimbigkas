import { memo } from 'react';
import { motion } from 'framer-motion';
import { imageSrc } from '../Icons/icons';

interface GameSidebarProps {
  timer: number;
  maxTime: number;
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
}

const GameSidebar = memo(({ timer, maxTime, paused, onPause, onResume }: GameSidebarProps) => {
  const timerPercent = (timer / maxTime) * 100;
  
  return (
    <div className="flex flex-col items-center justify-between w-full md:w-auto h-screen p-4 space-y-2">
      {/* Pause/Resume Button */}
      <motion.button
        title={paused ? "Resume" : "Pause"}
        type="button"
        className="px-4 py-2 gap-4 flex items-center rounded-full hover:text-gray-600 transition-colors duration-300"
        onClick={paused ? onResume : onPause}
        aria-label="Pause Game"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
      >
        {paused ?
          <img loading='lazy' src={imageSrc.play} alt="Play" className="block h-10 object-contain" />
          :
          <img loading='lazy' src={imageSrc.pause} alt="Pause" className="block h-10 object-contain" />
        }
      </motion.button>

      {/* Timer */}
      <div data-joyride="sidebar-timer" className="flex flex-col items-center w-16 h-full bg-[#003311] rounded-full border-4 border-[#8a3903] relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 w-full bg-[#11c26b]"
          style={{
            height: `${timerPercent}%`,
            transition: "height 0.5s linear",
          }}
          initial={false}
          animate={{ height: `${timerPercent}%` }}
        />
        <span className="relative z-10 text-2xl font-bold mt-2 text-white drop-shadow">
          {timer}
        </span>
      </div>
    </div>
  );
});

export default GameSidebar;
