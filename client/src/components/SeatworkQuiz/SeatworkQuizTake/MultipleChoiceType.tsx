import { memo, useCallback } from "react";
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckCircle, GripVertical, XCircle } from "lucide-react";

interface MultipleChoiceTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    availableOptions: any[];
}

const MultipleChoiceType = memo(({ 
    question,
    answers,
    isAnswered,
    availableOptions
}: MultipleChoiceTypeProps) => {
    const userAnswer = answers[question.id];

    const getAnswerZoneStyle = useCallback(() => {
        if (!isAnswered) {
            return "bg-[#003311] border-[#8a3903]";
        }
        if (userAnswer === question.numAnswer) {
            return "bg-green-200 border-green-400";
        } else {
            return "bg-red-200 border-red-400";
        }
    }, [isAnswered, userAnswer, question.numAnswer]);

    const getPlacedOptionStyle = useCallback(() => {
        if (!isAnswered) {
            return "bg-green-300 text-green-800";
        }
        if (userAnswer === question.numAnswer) {
            return "bg-green-400 text-green-900 border-2 border-green-600";
        } else {
            return "bg-red-400 text-red-900 border-2 border-red-600";
        }
    }, [isAnswered, userAnswer, question.numAnswer]);

    const getOptionIcon = useCallback(() => {
        if (!isAnswered) return null;
        if (userAnswer === question.numAnswer) {
            return <CheckCircle size={24} className="absolute top-2 right-2 text-green-900 animate-pulse" />;
        } else {
            return <XCircle size={24} className="absolute top-2 right-2 text-red-900 animate-pulse" />;
        }
    }, [isAnswered, userAnswer, question.numAnswer]);

    return (
        <div>
            {/* Answer Drop Zone */}
            <Droppable droppableId={`answer-zone-${question.id}`}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`border-4 border-dashed rounded-xl min-h-[200px] px-6 py-4 mb-6 flex items-center justify-center transition-all duration-300 ${
                            getAnswerZoneStyle()
                        } ${
                            snapshot.isDraggingOver && !isAnswered
                                ? 'border-orange-400' 
                                : ''
                        } ${isAnswered ? 'pointer-events-none' : ''}`}
                    >
                        {userAnswer !== undefined ? (
                            <Draggable
                                draggableId={`placed-option-${userAnswer}`}
                                index={0}
                                isDragDisabled={isAnswered}
                            >
                                {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`relative flex items-center w-full h-36 px-6 rounded-xl font-semibold transition-all duration-300 ${
                                        getPlacedOptionStyle()
                                    } ${
                                        snapshot.isDragging && !isAnswered
                                            ? 'shadow-xl scale-110' 
                                            : !isAnswered 
                                                ? 'shadow-lg hover:scale-102 cursor-grab'
                                                : 'cursor-not-allowed'
                                    }`}
                                    style={provided.draggableProps.style}
                                >
                                    <div className="flex items-center justify-between flex-1">
                                        <div className="flex items-center gap-3">
                                            <GripVertical size={24} className={
                                                isAnswered 
                                                    ? userAnswer === question.numAnswer 
                                                        ? 'text-green-900' 
                                                        : 'text-red-900'
                                                    : 'text-green-800'
                                            } />
                                            <span className="text-2xl font-bold text-left">{question.options[userAnswer] || 'Option not found'}</span>
                                        </div>
                                        <div>
                                            <div className={`flex items-center justify-center size-12 rounded-full text-2xl font-semibold transition-all duration-300 ${
                                                isAnswered 
                                                    ? userAnswer === question.numAnswer
                                                        ? 'bg-green-600 text-white scale-110'
                                                        : 'bg-red-600 text-white scale-110'
                                                    : 'bg-[#003311] text-white'
                                            }`}>
                                                {String.fromCharCode(65 + userAnswer)}
                                            </div>
                                        </div>
                                    </div>
                                    {getOptionIcon()}
                                </div>
                                )}
                            </Draggable>
                        ) : (
                            <span className={`text-lg font-semibold italic ${
                                isAnswered 
                                    ? getAnswerZoneStyle().includes('green') 
                                        ? 'text-green-800' 
                                        : 'text-red-800'
                                    : 'text-white'
                            }`}>
                                {isAnswered ? 'No answer selected' : 'Drag your answer here'}
                            </span>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            {/* Options Bank */}
            <Droppable droppableId={`options-bank-${question.id}`}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-colors duration-200 ${
                            snapshot.isDraggingOver && !isAnswered
                                ? 'bg-transparent' 
                                : ''
                        } ${isAnswered ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                        {availableOptions.map(({opt, optIdx}: {opt: string; optIdx: number}, consecutiveIdx: number) => {
                            const isCorrectOption = optIdx === question.numAnswer;
                            const optionStyle = !isAnswered 
                                ? "bg-[#2C3E50] text-white" 
                                : isCorrectOption 
                                    ? "bg-green-300 text-green-800 border-2 border-green-500" 
                                    : "bg-gray-300 text-gray-600";

                            return (
                                <Draggable
                                    key={`option-${question.id}-${optIdx}`}
                                    draggableId={`option-${question.id}-${optIdx}`}
                                    index={consecutiveIdx}
                                    isDragDisabled={isAnswered}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`relative flex items-center rounded-2xl w-full min-h-40 max-h-40 px-6 transition-all duration-300 ${optionStyle} ${
                                                snapshot.isDragging && !isAnswered
                                                    ? 'shadow-xl z-50 rotate-3 scale-105' 
                                                    : !isAnswered 
                                                        ? 'hover:scale-102 hover:shadow-md cursor-grab'
                                                        : 'cursor-not-allowed'
                                            }`}
                                            style={{
                                                ...provided.draggableProps.style,
                                                transform: snapshot.isDragging && !isAnswered
                                                ? `${provided.draggableProps.style?.transform} rotate(3deg)` 
                                                : provided.draggableProps.style?.transform
                                            }}
                                        >
                                            <div className="flex items-center justify-between flex-1">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical size={24} className={
                                                        isAnswered 
                                                            ? isCorrectOption 
                                                                ? 'text-green-800' 
                                                                : 'text-gray-600'
                                                            : 'text-white'
                                                    } />
                                                    <span className="text-xl font-medium text-left">{opt}</span>
                                                </div>
                                                <div>
                                                    <div className={`flex items-center justify-center size-12 rounded-full text-2xl font-semibold transition-all duration-300 ${
                                                        isAnswered 
                                                            ? isCorrectOption
                                                                ? 'bg-green-500 text-white scale-110'
                                                                : 'bg-gray-400 text-white'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {String.fromCharCode(65 + optIdx)}
                                                    </div>
                                                </div>
                                            </div>
                                            {isAnswered && isCorrectOption && (
                                                <CheckCircle size={24} className="absolute top-2 right-2 text-green-600 animate-pulse" />
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
});

export default MultipleChoiceType;