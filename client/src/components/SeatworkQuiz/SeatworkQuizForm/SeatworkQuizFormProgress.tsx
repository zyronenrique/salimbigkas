import { memo } from 'react';

interface QuizFormProgressProps {
  currentItems: number;
  maxItems: number;
  questionsCount: number;
}

const QuizFormProgress = memo(({ currentItems, maxItems, questionsCount }: QuizFormProgressProps) => {
  const progressPercentage = Math.min((currentItems / (maxItems || 1)) * 100, 100);

  return (
    <div className="space-y-4 mt-8 mb-40">
      {/* Questions Count */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-base">
          {questionsCount} question{questionsCount > 1 ? "s" : ""}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-[#2C3E50]">
            Progress (Items)
          </span>
          <span className="text-xs font-semibold text-[#2C3E50]">
            {currentItems} / {maxItems}
          </span>
        </div>
        
        <div
          className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner"
          aria-label="Quiz progress"
        >
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#2C3E50] via-[#34495E] to-[#6c7a89] rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
          
          <div
            className="absolute left-0 top-0 h-full flex items-center justify-end pr-2"
            style={{ width: `${progressPercentage}%` }}
          >
            <span className="text-xs font-bold text-white drop-shadow-sm">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

QuizFormProgress.displayName = 'QuizFormProgress';

export default QuizFormProgress;