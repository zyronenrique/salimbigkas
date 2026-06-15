import { memo } from 'react';
import { Plus, Gamepad2, Split, Goal, GripVertical, CaseSensitive, Eye, X } from 'lucide-react';
import { Question } from './QuizConstants';

interface SyllableQuestionProps {
  question: Question;
  onTargetWordChange?: (value: string) => void;
  onSyllablePartChange?: (partIdx: number, value: string) => void;
  onAddSyllablePart?: () => void;
  onRemoveSyllablePart?: (partIdx: number) => void;
  onAutoGenerateSyllables?: (word: string) => void;
  disabled: boolean;
}

const SyllableQuestion = memo(({ 
  question,
  onTargetWordChange,
  onSyllablePartChange,
  onAddSyllablePart,
  onRemoveSyllablePart,
  onAutoGenerateSyllables,
  disabled 
}: SyllableQuestionProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Optimized Setup Section */}
      <h3 className="font-bold text-[#2C3E50] flex items-center gap-2 text-lg">
        <Goal size={24} className="inline-block" />
        Create Syllable Split Game
      </h3>
      
      <div className="bg-gradient-to-b from-blue-100 to-green-100 rounded-xl p-6 shadow-sm border-2 border-dashed border-[#2C3E50]">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-[#2C3E50] text-white rounded-full p-2 flex items-center justify-center font-bold">
            <CaseSensitive size={24} className="inline-block" />
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-[#2C3E50] focus:border-[#2C3E50] focus:ring-2 focus:ring-[#2C3E50] focus:outline-none bg-white shadow-sm text-base font-semibold transition-colors duration-150"
              placeholder="Enter target word (e.g., bahay)"
              maxLength={30}
              value={question.targetWord || ""}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\-]/g, '');
                onTargetWordChange && onTargetWordChange(cleanValue);
              }}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Tab' || /[0-9!@#$%^&*()_+=\[\]{};':"\\|,.<>?`~]/.test(e.key)) {
                  e.preventDefault();
                  return;
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text');
                const cleanText = pastedText.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\-]/g, '');
                if (cleanText) {
                  onTargetWordChange && onTargetWordChange(cleanText);
                }
              }}
              disabled={disabled}
            />
            <button
              type="button"
              className="bg-[#2C3E50] text-white px-4 py-2 rounded-xl hover:bg-[#34495e] transition-all duration-150 font-semibold shadow-lg"
              onClick={() => onAutoGenerateSyllables && onAutoGenerateSyllables(question.targetWord || "")}
              disabled={disabled || !question.targetWord?.trim()}
              title="Auto-generate syllables"
            >
              <Split size={24} className="inline-block mr-1" />
              <span>Auto Split</span>
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-gray-700 mb-3">Syllable Parts:</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {question.syllableParts?.map((part: string, partIdx: number) => (
              <div key={partIdx} className="flex items-center gap-1">
                <input
                  type="text"
                  className="w-20 px-3 py-2 rounded-lg bg-white border-2 border-[#2C3E50] focus:border-[#2C3E50] focus:outline-none text-center font-semibold text-[#2C3E50] transition-colors duration-150"
                  placeholder={`Part ${partIdx + 1}`}
                  value={part || ""}
                  onChange={(e) => onSyllablePartChange && onSyllablePartChange(partIdx, e.target.value)}
                  disabled={disabled}
                />
                <button
                  type="button"
                  className="text-red-500 hover:bg-red-50 rounded p-1 transition-colors duration-150"
                  onClick={() => onRemoveSyllablePart && onRemoveSyllablePart(partIdx)}
                  disabled={disabled || (question.syllableParts || []).length <= 1}
                  title="Remove syllable part"
                >
                  <X size={16} />
                </button>
                {partIdx < ((question.syllableParts || []).length || 1)  - 1 && (
                  <span className="text-[#2C3E50] font-bold">+</span>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="bg-[#2C3E50] text-white px-4 py-2 rounded-lg hover:bg-[#34495e] transition-all duration-150 font-medium"
            onClick={onAddSyllablePart}
            disabled={disabled}
          >
            <Plus size={20} className="inline-block mr-1" />
            <span>Add Syllable Part</span>
          </button>
        </div>
        
        {/* Optimized Preview */}
        <div className="mt-4 bg-gradient-to-b from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={24} className="inline-block" />
            <span className="font-semibold text-gray-700">Preview:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {question.syllableParts?.map((part: string, partIdx: number) => (
              <div key={partIdx} className="flex items-center gap-1">
                <span className="bg-[#34495e] text-[#FFF9C4] px-2 py-1 rounded-lg font-semibold border-2 border-[#2C3E50] shadow-sm transition-transform duration-150 hover:scale-105">
                  {part || `part ${partIdx + 1}`}
                </span>
                {partIdx < (question.syllableParts || []).length - 1 && (
                  <span className="text-[#2C3E50] font-bold text-base flex-shrink-0">+</span>
                )}
              </div>
            ))}
            <span className="text-gray-400 mx-2 flex-shrink-0">→</span>
            <span className="bg-green-100 text-green-600 px-4 py-2 rounded-lg font-bold border-2 border-green-200 shadow-md text-lg">
              {question.targetWord || "target word"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Simplified Student Preview */}
      <h4 className="font-bold text-[#003311] flex items-center gap-2 text-lg">
        <Gamepad2 size={24} className="inline-block" />
        Student View Preview
      </h4>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-200">
        <div className="text-center">
          <h5 className="text-lg font-bold text-gray-700 mb-2">
            Drag the syllables to form the word:
          </h5>
          <div className="bg-[#003311] border-4 border-dashed border-[#8a3903] rounded-xl p-4 min-h-[80px] flex items-center justify-center gap-2 mb-4">
            <span className="text-[#FFF9C4] text-lg font-semibold">
              Drop syllables here to form: <strong>{question.targetWord || "target word"}</strong>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {question.syllableParts
              ?.slice()
              .sort(() => Math.random() - 0.5)
              .map((part: string, partIdx: number) => (
                <div
                  key={`static-syllable-${partIdx}`}
                  className="bg-[#2C3E50] text-[#FFF9C4] px-6 py-3 rounded-xl font-bold text-lg shadow-lg cursor-pointer transition-transform duration-150 border-2 border-[#2C3E50] hover:shadow-xl hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-[#FFF9C4]" />
                    <span>{part || `part${partIdx + 1}`}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
});

SyllableQuestion.displayName = 'SyllableQuestion';

export default SyllableQuestion;