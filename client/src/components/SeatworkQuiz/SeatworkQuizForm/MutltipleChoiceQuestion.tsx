import { memo } from 'react';
import { Gamepad2, GripVertical, Shuffle } from 'lucide-react';
import { Question } from './QuizConstants';

interface MultipleChoiceQuestionProps {
  question: Question;
  questionIndex: number;
  onOptionChange?: (optIdx: number, value: string) => void;
  onAnswerChange?: (ansIdx: number) => void;
  onShuffleOptions?: () => void;
  disabled: boolean;
}

const MultipleChoiceQuestion = memo(({ 
  question, 
  questionIndex,
  onOptionChange, 
  onAnswerChange, 
  onShuffleOptions,
  disabled 
}: MultipleChoiceQuestionProps) => {
  return (
    <div className="mt-1">
      {/* Setup Mode - Match the original styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {question.options.map((opt: string, optIdx: number) => (
          <div key={optIdx} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <input
              title="Select this option as correct answer"
              type="radio"
              name={`answer-${questionIndex}`}
              checked={question.numAnswer === optIdx}
              onChange={() => onAnswerChange && onAnswerChange(optIdx)}
              className="accent-[#2C3E50] scale-125"
              disabled={disabled}
            />
            <input
              type="text"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none bg-gray-50 transition-all duration-150"
              placeholder={`Option ${optIdx + 1}`}
              value={opt}
              onChange={(e) => onOptionChange && onOptionChange(optIdx, e.target.value)}
              disabled={disabled}
            />
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
              {String.fromCharCode(65 + optIdx)}
            </div>
          </div>
        ))}
      </div>

      {/* Student Preview - Enhanced to match original */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border-2 border-dashed border-blue-300">
        <h4 className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
          <Gamepad2 size={24} />
          Student Drag & Drop Preview
        </h4>
        
        {/* Answer Drop Zone - Enhanced styling */}
        <div className="bg-white border-4 border-dashed border-[#2C3E50] rounded-xl p-8 min-h-[120px] mb-6 flex items-center justify-center shadow-inner">
          <div className="text-center">
            <div className="text-[#2C3E50] text-xl font-bold mb-2">
              Drop your answer here
            </div>
            <div className="text-gray-500 text-sm">
              Correct answer: {question.options[question.numAnswer] || "No answer selected"}
            </div>
          </div>
        </div>

        {/* Draggable Options - Enhanced with better layout */}
        <div className="space-y-3 mb-4">
          <h5 className="font-semibold text-[#2C3E50] text-center">Available Options:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(question.shuffledOptions || question.options).map((option: string, idx: number) => (
              <div
                key={idx}
                className="bg-[#2C3E50] text-white p-4 rounded-xl text-center font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              >
                <GripVertical size={20} />
                <span className="flex-1">
                  {option || `Option ${idx + 1}`}
                </span>
                <div className="w-6 h-6 bg-white text-[#2C3E50] rounded-full flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + idx)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Button */}
        <div className="text-center">
          <button
            type="button"
            className="bg-[#2C3E50] text-white px-6 py-3 rounded-lg hover:bg-[#34495e] transition-all duration-150 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={onShuffleOptions}
            disabled={disabled}
          >
            <Shuffle size={16} className="inline mr-2" />
            Shuffle Options
          </button>
        </div>
      </div>
    </div>
  );
});

MultipleChoiceQuestion.displayName = 'MultipleChoiceQuestion';

export default MultipleChoiceQuestion;