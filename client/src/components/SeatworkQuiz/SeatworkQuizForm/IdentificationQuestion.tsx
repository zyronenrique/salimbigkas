import { memo } from 'react';
import { Gamepad2, RefreshCcw, Eye, Type } from 'lucide-react';
import { Question } from './QuizConstants';

interface IdentificationQuestionProps {
    question: Question;
    onAnswerChange?: (value: string) => void;
    onGenerateLetterBank?: () => void;
    disabled: boolean;
}

const IdentificationQuestion = memo(({ 
    question, 
    onAnswerChange, 
    onGenerateLetterBank, 
    disabled 
}: IdentificationQuestionProps) => {
    return (
        <div className="mt-1">
            {/* Setup Mode - Enhanced with better styling */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2 items-center gap-2">
                    Correct Answer:
                </label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        className="flex-1 px-5 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-[#2C3E50] focus:border-[#2C3E50] focus:outline-none bg-white shadow-sm transition-all duration-150 font-medium"
                        placeholder="Enter the correct answer (will be converted to uppercase)"
                        value={question.answer}
                        onChange={(e) => onAnswerChange && onAnswerChange(e.target.value.toUpperCase())}
                        disabled={disabled}
                    />
                    <button
                        type="button"
                        className="bg-[#2C3E50] text-white px-4 py-3 rounded-lg hover:bg-[#34495e] transition-all duration-150 font-semibold shadow-lg flex items-center gap-2"
                        onClick={onGenerateLetterBank}
                        disabled={disabled || !question.answer}
                        title="Generate scrambled letter bank"
                    >
                        <RefreshCcw size={16} />
                        Generate Letters
                    </button>
                </div>
                
                {/* Answer Preview */}
                {question.answer && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                            <Eye size={16} />
                            <span className="text-sm font-medium">Answer Preview:</span>
                            <span className="font-bold">{question.answer}</span>
                            <span className="text-xs">({question.answer.length} letters)</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Student Preview - Enhanced to match original */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-300">
                <h4 className="font-bold text-[#2C3E50] mb-6 flex items-center gap-2">
                    <Gamepad2 size={24} />
                    Letter Assembly Game Preview
                </h4>

                {/* Answer Slots - Enhanced styling */}
                <div className="bg-white border-2 border-[#2C3E50] rounded-xl p-6 mb-2 shadow-inner">
                    <h5 className="font-semibold text-[#2C3E50] mb-4 text-center">
                        Drag letters to spell the word:
                    </h5>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {question.answer ? (
                            question.answer.split('').map((_: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="w-14 h-14 border-2 border-dashed border-[#2C3E50] rounded-lg flex items-center justify-center bg-gray-50 shadow-sm transition-all duration-200 hover:bg-gray-100"
                                >
                                    <span className="text-xs text-gray-400 font-semibold">{idx + 1}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 py-4 text-center">
                                <Type size={32} className="mx-auto mb-2 text-gray-300" />
                                <p className="font-medium">Enter an answer above to see letter slots</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Letter Bank - Enhanced styling */}
                <div className="bg-blue-50 rounded-xl p-2">
                    <h5 className="font-semibold text-[#2C3E50] mb-4 text-center">
                        Available Letters (Scrambled):
                    </h5>
                    {question.letterBank && question.letterBank.length > 0 ? (
                        <div className="flex gap-3 justify-center flex-wrap min-h-[60px] items-center">
                            {question.letterBank.map((letter: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="w-14 h-14 bg-[#2C3E50] text-white rounded-lg flex items-center justify-center font-bold text-xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 hover:bg-[#34495e]"
                                >
                                    {letter.toUpperCase()}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                                <Type size={32} className="mx-auto mb-2 text-gray-300" />
                                <p className="font-medium mb-1">No letters generated yet</p>
                                <p className="text-sm">Click "Generate Letters" to create the letter bank</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Generation Status */}
                    {question.answer && !question.letterBank?.length && (
                        <div className="mt-4 text-center">
                            <p className="text-orange-600 text-sm font-medium">
                                ⚠️ Letter bank not generated yet. Click the button above.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

IdentificationQuestion.displayName = 'IdentificationQuestion';

export default IdentificationQuestion;