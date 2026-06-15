import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface QuestionFormWrapperProps {
  questionIndex: number;
  question: any;
  onQuestionChange?: (value: string) => void;
  onRemoveQuestion?: () => void;
  canRemove?: boolean;
  disabled: boolean;
  children: React.ReactNode;
}

const QuestionFormWrapper = memo(({ 
  questionIndex, 
  question, 
  onQuestionChange, 
  onRemoveQuestion, 
  canRemove, 
  disabled,
  children 
}: QuestionFormWrapperProps) => {
  const isOptionalQuestion = ["enumeration", "matching", "syllable"].includes(question.type);

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 mb-8 shadow-md flex flex-col gap-5 border border-gray-100 relative group transition-all duration-200"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: questionIndex * 0.1 }}
    >
      {/* Remove Button */}
      <button
        type="button"
        className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition text-2xl font-bold opacity-0 group-hover:opacity-100 focus:opacity-100"
        onClick={onRemoveQuestion}
        disabled={!canRemove || disabled}
        title="Remove question"
        aria-label="Remove question"
      >
        <span aria-hidden>×</span>
      </button>

      {/* Question Input */}
      <label className="block">
        <span className="sr-only">Question {questionIndex + 1}</span>
        <input
          type="text"
          className="w-full px-5 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none text-lg bg-white shadow-sm"
          placeholder={
            isOptionalQuestion
              ? "Optional: Add instructions or context for this exercise"
              : "Enter your question here"
          }
          value={question.question}
          onChange={(e) => onQuestionChange && onQuestionChange(e.target.value)}
          aria-label={`Question ${questionIndex + 1}`}
          autoFocus={questionIndex === 0}
          disabled={disabled}
        />
        
        {isOptionalQuestion && (
          <div className="flex text-sm items-center justify-center text-gray-500 mt-2 gap-1">
            <Lightbulb className="text-yellow-500" size={20} />
            <p className="italic">
              Tip: This field is optional. You can leave it blank or add special instructions.
            </p>
          </div>
        )}
      </label>

      {/* Question Content */}
      {children}
    </motion.div>
  );
});

QuestionFormWrapper.displayName = 'QuestionFormWrapper';

export default QuestionFormWrapper;