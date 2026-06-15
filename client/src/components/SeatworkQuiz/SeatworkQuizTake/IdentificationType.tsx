import { useCallback, memo } from "react";
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Lightbulb} from "lucide-react";
import { combineUserAnswerWithClues } from "../../../utils/helpers";

interface IdentificationTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    cluePositions: number[];
    letterBank: string[];
    availableLetters: any[]; 
}

const IdentificationType = memo(({ 
    question,
    answers,
    isAnswered,
    cluePositions,
    letterBank,
    availableLetters
}: IdentificationTypeProps) => {
    const qId = question.id;

    const getSlotStyle = useCallback((slotIdx: number, hasLetter: boolean) => {
        if (isAnswered) {
            const userInput = answers[qId] || '';
            const combinedAnswer = combineUserAnswerWithClues(userInput, question.answer, cluePositions);
            const isCorrectPosition = combinedAnswer[slotIdx]?.toLowerCase() === question.answer[slotIdx]?.toLowerCase();
            if (cluePositions.includes(slotIdx)) {
                return "border-yellow-400 bg-yellow-100";
            } else if (isCorrectPosition) {
                return "border-green-400 bg-green-100";
            } else {
                return "border-red-400 bg-red-100";
            }
        }
        return hasLetter ? "border-orange-400 bg-white/30" : "border-white bg-white/20";
    }, [isAnswered, answers, qId, question.answer, cluePositions]);

    return (
        <div className="mt-4">
                {/* Answer Slots */}
                <div className="bg-[#003311] border-4 border-[#8a3903] rounded-xl px-4 py-6 mb-6">
                    <h5 className="font-bold text-white mb-3 text-center">Form the word:</h5>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {question.answer?.split('').map((_: string, slotIdx: number) => {
                            const isClueSlot = cluePositions?.includes(slotIdx);
                            const correctLetter = question.answer[slotIdx]?.toUpperCase();
                            const hasUserLetter = answers[`${qId}-slots`]?.[slotIdx] !== null && answers[`${qId}-slots`]?.[slotIdx] !== undefined;
                            return (
                                <div key={slotIdx} className="relative">
                                    {isClueSlot ? (
                                        <div className="w-[112px] h-[112px] border-2 border-yellow-400 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <div title={correctLetter} className="w-[104px] h-[104px] bg-yellow-300 text-yellow-800 rounded-lg flex items-center justify-center font-bold text-3xl border-2 border-yellow-500">
                                                {correctLetter}
                                            </div>
                                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold">
                                                <Lightbulb size={16} />
                                            </div>
                                        </div>
                                    ) : (
                                        <Droppable droppableId={`slot-${slotIdx}`}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`
                                                        w-[112px] h-[112px] border-2 border-dashed rounded-lg flex items-center justify-center
                                                        ${getSlotStyle(slotIdx, hasUserLetter)}
                                                        ${snapshot.isDraggingOver ? 'border-orange-400' : ''}
                                                        ${isAnswered ? 'pointer-events-none' : ''}
                                                    `}
                                                >
                                                    {hasUserLetter ? (
                                                        <Draggable
                                                            draggableId={`placed-letter-${slotIdx}-${answers[`${qId}-slots`][slotIdx]}`}
                                                            index={0}
                                                            isDragDisabled={isAnswered}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`
                                                                        w-[104px] h-[104px] rounded-lg flex items-center justify-center text-3xl font-bold
                                                                        ${isAnswered 
                                                                            ? getSlotStyle(slotIdx, true).includes('green') 
                                                                                ? 'bg-green-300 text-green-800' 
                                                                                : 'bg-red-300 text-red-800'
                                                                            : 'bg-green-300 text-green-800 cursor-grab hover:scale-105'
                                                                        }
                                                                        ${snapshot.isDragging ? 'scale-105 shadow-xl rotate-6' : ''}
                                                                    `}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        transform: snapshot.isDragging && !isAnswered
                                                                        ? `${provided.draggableProps.style?.transform} rotate(6deg)` 
                                                                        : provided.draggableProps.style?.transform
                                                                    }}
                                                                >
                                                                    {letterBank[answers[`${qId}-slots`][slotIdx]]?.toUpperCase() || '?'}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ) : (
                                                        <span className="text-3xl text-white font-semibold">?</span>
                                                    )}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                            <Lightbulb size={16} />
                            <span>Yellow letters are hints!</span>
                        </div>
                    </div>
                </div>
                {/* Letter Bank */}
                <Droppable droppableId={`letter-bank-${qId}`} direction="horizontal">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`
                                flex gap-2 justify-center flex-wrap p-6 rounded-xl min-h-[60px]
                                ${isAnswered ? 'opacity-50 pointer-events-none' : ''}
                                ${snapshot.isDraggingOver ? 'bg-transparent' : ''}
                            `}
                        >
                            {availableLetters.map(({ letter, letterIdx }: { letter: string; letterIdx: number }, consecutiveIdx: number) => (
                                <Draggable
                                    key={`letter-${letterIdx}`}
                                    draggableId={`letter-${letterIdx}`}
                                    index={consecutiveIdx}
                                    isDragDisabled={isAnswered}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`
                                                size-28 bg-[#2C3E50] text-3xl text-white rounded-lg flex items-center justify-center font-bold transition-all duration-200
                                                ${isAnswered 
                                                    ? 'cursor-not-allowed opacity-50' 
                                                    : 'cursor-grab hover:shadow-md hover:scale-105'
                                                }
                                                ${snapshot.isDragging ? 'shadow-xl z-50 rotate-12' : ''}
                                            `}
                                            style={{
                                            ...provided.draggableProps.style,
                                            transform: snapshot.isDragging && !isAnswered
                                                ? `${provided.draggableProps.style?.transform} rotate(12deg)` 
                                                : provided.draggableProps.style?.transform
                                            }}
                                            title={letter.toUpperCase()}
                                        >
                                            {letter.toUpperCase()}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
        </div>
    );
});

export default IdentificationType;