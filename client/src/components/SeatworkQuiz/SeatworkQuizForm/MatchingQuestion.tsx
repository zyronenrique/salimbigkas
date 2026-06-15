import { memo } from 'react';
import { Plus, Minus, Shuffle, Move, GripVertical, RefreshCcw } from 'lucide-react';
import { Question } from './QuizConstants';

interface MatchingQuestionProps {
  question: Question;
  onLeftItemChange?: (itemIdx: number, value: string) => void;
  onRightItemChange?: (itemIdx: number, value: string) => void;
  onMatchChange?: (leftIdx: number, rightIdx: number) => void;
  onAddPair?: () => void;
  onRemovePair?: (pairIdx: number) => void;
  onShufflePreview?: () => void;
  disabled: boolean;
}

const MatchingQuestion = memo(({ 
  question,
  onLeftItemChange,
  onRightItemChange,
  onMatchChange,
  onAddPair,
  onRemovePair,
  onShufflePreview,
  disabled 
}: MatchingQuestionProps) => {
  return (
    <div className="flex flex-col gap-6 mt-2">
      {/* Setup Section - Optimized */}
      <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-6 border-2 border-dashed border-[#2C3E50]">
        <h3 className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2 text-lg">
          <Move size={24} className="text-[#2C3E50]" />
          Create Matching Items
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column Setup - Optimized */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
            <h4 className="font-bold text-[#2C3E50] mb-4 text-center flex items-center justify-center gap-2">
              Column A (Fixed Items)
            </h4>
            <div className="space-y-3">
              {question.leftItems?.map((item: string, leftIdx: number) => (
                <div key={leftIdx} className="flex gap-2 items-center">
                  <div className="bg-[#2C3E50] text-white rounded-full w-8 h-8 px-1 flex items-center justify-center font-bold text-sm">
                    {leftIdx + 1}
                  </div>
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-[#2C3E50] focus:border-[#2C3E50] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white shadow-sm text-base transition-colors duration-150"
                    placeholder={`What goes in box ${leftIdx + 1}?`}
                    value={item}
                    onChange={(e) => onLeftItemChange && onLeftItemChange(leftIdx, e.target.value)}
                    aria-label={`Left item ${leftIdx + 1}`}
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column Setup - Optimized */}
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 shadow-sm border border-green-200">
            <h4 className="font-bold text-[#2C3E50] mb-4 text-center flex items-center justify-center gap-2">
              Column B (Draggable Items)
            </h4>
            <div className="space-y-3">
              {question.rightItems?.map((item: string, rightIdx: number) => (
                <div key={rightIdx} className="flex gap-2 items-center">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 px-1 flex items-center justify-center font-bold text-sm">
                    {String.fromCharCode(97 + rightIdx)}
                  </div>
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 focus:outline-none bg-white shadow-sm text-base transition-colors duration-150"
                    placeholder={`Answer option ${String.fromCharCode(97 + rightIdx)}`}
                    value={item}
                    onChange={(e) => onRightItemChange && onRightItemChange(rightIdx, e.target.value)}
                    aria-label={`Right item ${rightIdx + 1}`}
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Control Buttons - Optimized */}
        <div className="flex gap-3 mt-6 justify-center">
          <button
            type="button"
            className="flex bg-[#2C3E50] text-white px-6 py-3 rounded-xl hover:bg-[#34495e] transition-all duration-150 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={onAddPair}
            disabled={disabled || (question.leftItems?.length || 0) >= 6}
            aria-label="Add matching pair"
          >
            <Plus size={24} className="text-white mr-2" />
            <span>Add More Pairs</span>
          </button>
          <button
            type="button"
            className="flex bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all duration-150 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => onRemovePair && onRemovePair((question.leftItems?.length || 1) - 1)}
            disabled={disabled || (question.leftItems?.length || 0) <= 1}
            aria-label="Remove last matching pair"
          >
            <Minus size={24} className="text-white mr-2" />
            <span>Remove Pair</span>
          </button>
        </div>
      </div>
      
      {/* Answer Configuration - Optimized */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-dashed border-[#2C3E50]">
        <h4 className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2 text-lg">
          Set Correct Answers
        </h4>
        <div className="grid grid-cols-1 gap-4">
          {question.leftItems?.map((_: string, leftIdx: number) => (
            <div key={leftIdx} className="bg-white rounded-xl p-4 shadow-sm border border-yellow-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
                  <div className="bg-[#2C3E50] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    {leftIdx + 1}
                  </div>
                  <span className="text-gray-600 font-medium whitespace-nowrap">matches with</span>
                </div>
                <select
                  title="Select correct match"
                  className="w-full sm:flex-1 px-3 py-2 rounded-lg border-2 border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 focus:outline-none bg-white font-semibold text-left transition-colors duration-150"
                  value={question.matches?.[leftIdx] || 0}
                  onChange={(e) => onMatchChange && onMatchChange(leftIdx, parseInt(e.target.value))}
                  disabled={disabled}
                >
                  {question.rightItems?.map((item: string, rightIdx: number) => (
                    <option key={rightIdx} value={rightIdx} className="text-left">
                      {String.fromCharCode(97 + rightIdx)} - {item?.length > 50 ? item.substring(0, 50) + '...' : item || `Option ${rightIdx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Optimized Interactive Student Preview with reduced complexity */}
      <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-6 border-2 border-dashed border-blue-200">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-[#2C3E50] flex items-center gap-2 text-lg">
            Student View Preview
            <span className="text-sm bg-[#2C3E50] text-white px-3 py-1 rounded-full font-medium">
              Drag & Drop Fun!
            </span>
          </h4>
          <button
            type="button"
            className="bg-[#2C3E50] text-white px-4 py-2 rounded-lg hover:bg-[#34495e] transition-all duration-150 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            onClick={onShufflePreview}
            disabled={disabled}
          >
            <Shuffle size={16} />
            Mix It Up!
          </button>
        </div>
        
        {/* Simplified Preview - No complex DragDropContext for better performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Static Preview */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-5 shadow-sm">
            <h5 className="font-bold text-[#2C3E50] mb-4 text-center text-lg">
              Match These!
            </h5>
            <div className="space-y-3">
              {question.leftItems?.map((item: string, leftIdx: number) => (
                <div
                  key={leftIdx}
                  className="bg-white rounded-xl p-4 border-2 border-[#2C3E50] shadow-md transform transition-transform duration-150 hover:scale-102"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#2C3E50] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      {leftIdx + 1}
                    </div>
                    <span className="text-gray-800 font-semibold text-lg">
                      {item || `Item ${leftIdx + 1}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Static Preview */}
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-4">
              <RefreshCcw size={24} className="text-green-500" />
              <h5 className="font-bold text-[#2C3E50] text-center text-lg">
                Drag to Match!
              </h5>
            </div>
            <div className="space-y-3 min-h-[200px] rounded-xl p-3 border-2 border-dashed border-green-300">
              {(question.shuffledRightItems || question.rightItems)?.map((item: string, rightIdx: number) => (
                <div
                  key={`static-preview-${rightIdx}`}
                  className="bg-white rounded-xl p-4 border-2 border-green-300 shadow-md cursor-pointer transition-transform duration-150 hover:scale-102 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={20} className="text-green-500" />
                    <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      {String.fromCharCode(97 + rightIdx)}
                    </div>
                    <span className="text-gray-800 font-semibold text-lg">
                      {item || `Option ${rightIdx + 1}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

MatchingQuestion.displayName = 'MatchingQuestion';

export default MatchingQuestion;