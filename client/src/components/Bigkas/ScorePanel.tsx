import { memo } from 'react';
import { motion } from 'framer-motion';
import { imageSrc } from '../Icons/icons';
import { getNumberImages, getStarImages } from '../../utils/helpers';

interface ScorePanelProps {
  mode: string;
  phrases: any[];
  currentPhrase: number;
  totalPhrases: number;
  totalPoints: number;
  totalWords: number;
  showPopup: boolean;
  isActive: boolean;
  userTotalPoints: number;
  userTotalWords: number;
}

const ScorePanel = memo(({ mode, phrases, currentPhrase, totalPhrases, totalPoints, totalWords, showPopup, isActive, userTotalPoints, userTotalWords }: ScorePanelProps) => {
  const latestEarnedPoints = phrases?.length > 0 ? (phrases.slice().reverse().find(p => p.isContinue === true && p.userPoints > 0)?.userPoints || 0) : 0;

  const renderNumberImages = (num: number, size = 50) => (
    getNumberImages(num)?.map((img, idx) => (
      <img loading='eager' key={idx} src={img} alt={`Number ${num}`} className={`block h-[${size}px] object-contain`} />
    ))
  );

  return (
    <div className="flex flex-col items-center justify-between h-screen md:w-1/3 mr-4">
      <div className="flex flex-col items-center justify-end w-full gap-2">
        {/* Star here */}
        <div className="flex items-center justify-end w-full space-x-2 py-2">
          {getStarImages(mode).map((img, idx) => (
            <img loading='lazy' key={idx} src={img} alt={`Star ${idx + 1}`} className="block h-[60px] object-contain" />
          ))}
        </div>
        {/* Total Points */}
        <div className="flex flex-col items-end justify-center w-full py-2">
          <span className="text-lg">Puntos</span>
          <div className="flex items-center" data-joyride="scorepanel-points">
            {renderNumberImages(userTotalPoints, 60)}
            <img loading='eager' src={imageSrc.slash} alt="Slash" className="block h-[60px] object-contain mx-2" />
            {renderNumberImages(totalPoints, 60)}
          </div>
        </div>
        {/* Total Words */}
        <div className="flex flex-col items-end justify-center w-full space-y-2">
          <span className="text-lg">Tamang Salita</span>
          <div className="flex items-center" data-joyride="scorepanel-words">
            {renderNumberImages(userTotalWords, 40)}
            <img loading='eager' src={imageSrc.slash} alt="Slash" className="block h-[40px] object-contain mx-2" />
            {renderNumberImages(totalWords, 40)}
          </div>
        </div>
        {/* Phrase Progress */}
        <div className="flex flex-col items-end justify-center w-full">
          <span className="text-lg">Parirala</span>
          <div className="flex items-center wrap justify-center" data-joyride="sidebar-phrase-progress">
            {renderNumberImages(currentPhrase, 40)}
            <img loading='eager' src={imageSrc.slash} alt="Slash" className="block h-[40px] object-contain mx-1" />
            {renderNumberImages(totalPhrases, 40)}
          </div>
        </div>
      </div>
      {/* Popup Score */}
      {showPopup && (
        <motion.div
          className="flex items-center justify-center w-full py-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
        >
          <img loading='eager' src={imageSrc.plus} alt="Plus" className="block h-[80px] object-contain" />
          {renderNumberImages(latestEarnedPoints, 80)}
        </motion.div>
      )}
      <motion.img
        loading='lazy'
        src={isActive ? imageSrc.happyRobot : imageSrc.angryRobot}
        alt="Character"
        className="block h-[250px] object-contain"
        whileTap={{ scale: 0.95 }}
      />
    </div>
  );
});

export default ScorePanel;
