import { memo, useCallback } from "react";
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Lightbulb } from "lucide-react";

interface SyllableTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    cluePositions: number[];
    shuffledSyllableIndexes: number[];
}

const SyllableType = memo(({ 
    question, 
    answers,
    isAnswered,
    cluePositions,
    shuffledSyllableIndexes
}: SyllableTypeProps) => {
    const qId = question.id;

    const getSyllableStyle = useCallback((syllableIdx: number, isInAnswer: boolean) => {
        if (!isAnswered) {
            const isClue = cluePositions.includes(syllableIdx);
            return isClue 
                ? 'bg-yellow-300 text-yellow-800 border-yellow-500'
                : 'bg-[#2C3E50] border-[#2C3E50] text-[#FFF9C4]';
        }
        const userSyllableOrder = answers[`${qId}-0`] || [];
        const targetWord = question.targetWord || "";
        const correctSyllableParts = question.syllableParts || [];
        const userArrangedSyllables = userSyllableOrder.map((index: number) => 
            correctSyllableParts[index] || ''
        );
        const userArrangement = userArrangedSyllables.join('');
        const correctArrangement = targetWord.toLowerCase().trim();
        if (isInAnswer) {
            const correctPosition = correctSyllableParts.findIndex((syl: string) => syl === question.syllableParts[syllableIdx]);
            const userPosition = userSyllableOrder.indexOf(syllableIdx);
            
            if (userPosition === correctPosition && userArrangement === correctArrangement) {
                return 'bg-green-300 text-green-800 border-green-500';
            } else {
                return 'bg-red-300 text-red-800 border-red-500';
            }
        }
        return 'bg-gray-300 text-gray-600 opacity-50';
    }, [isAnswered, answers, qId, question.targetWord, question.syllableParts, cluePositions]);

    return (
        <div className="mt-4">
            <div className="space-y-6">
                {question.targetWord && (
                    <div key={0}>
                        <div className="bg-[#2C3E50] text-white px-4 py-4 rounded-lg font-bold text-lg mb-4 gap-2 flex items-center justify-center">
                            <span className="text-yellow-300 tracking-wider">Target:</span>
                            <div className="flex gap-2 items-center bg-[#003311] px-4 py-2 rounded-lg border-2 border-yellow-400">
                                {question.syllableParts.map((syllable: string, syllableIdx: number) => {
                                    const isClue = cluePositions.includes(syllableIdx);
                                    return (
                                        <div key={syllableIdx} className="relative">
                                            {isClue ? (
                                                <div className="bg-yellow-300 text-yellow-800 rounded-lg size-20 font-bold text-xl border-2 border-yellow-500 flex items-center justify-center">
                                                    {syllable}
                                                </div>
                                            ) : (
                                                <div className="bg-white/20 border-2 border-dashed border-white rounded-lg size-20 flex items-center justify-center">
                                                    <span className="text-xl text-white font-bold">?</span>
                                                </div>
                                            )}
                                            {isClue && (
                                                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full size-6 flex items-center justify-center text-xs">
                                                    <Lightbulb size={14} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <Droppable droppableId={`syllable-drop-${qId}-0`} direction="horizontal">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`bg-[#003311] border-4 border-dashed rounded-xl p-4 min-h-[150px] flex items-center justify-center gap-2 mb-4 transition-colors duration-150 ${
                                        snapshot.isDraggingOver && !isAnswered
                                        ? 'border-orange-400 bg-[#002208]' 
                                        : 'border-[#8a3903]'
                                    } ${isAnswered ? 'opacity-75' : ''}`}
                                >
                                    {(answers[`${qId}-0`] || []).length === 0 ? (
                                        <span className="chalk-text text-3xl font-semibold tracking-widest">
                                            Drop syllables here
                                        </span>
                                    ) : (
                                        <div className="flex gap-2">
                                            {(answers[`${qId}-0`] || []).map((syllableIdx: number, orderIdx: number) => (
                                                <Draggable
                                                    key={`arranged-${syllableIdx}-${orderIdx}`}
                                                    draggableId={`arranged-${syllableIdx}-${orderIdx}`}
                                                    index={orderIdx}
                                                    isDragDisabled={isAnswered}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`flex items-center justify-center w-[130px] h-[112px] rounded-lg font-bold shadow-md transition-transform duration-150 border-2 ${
                                                                getSyllableStyle(syllableIdx, true)
                                                            } ${
                                                                snapshot.isDragging && !isAnswered
                                                                ? 'scale-110 shadow-xl z-50'
                                                                : !isAnswered ? 'hover:scale-105 cursor-grab' : 'cursor-not-allowed'
                                                            }`}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <div className="flex items-center gap-2 text-3xl">
                                                                <span>{question.syllableParts[syllableIdx] || ''}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        </div>
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        {/* Syllables section */}
                        <Droppable droppableId={`syllable-source-${qId}-0`} direction="horizontal">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex flex-wrap justify-center gap-2 p-4 rounded-xl transition-colors duration-150 ${
                                        snapshot.isDraggingOver && !isAnswered ? 'bg-blue-100' : ''
                                    } ${isAnswered ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {shuffledSyllableIndexes
                                        .filter((syllableIdx: number) => !(answers[`${qId}-0`] || []).includes(syllableIdx))
                                        .map((syllableIdx: number, consecutiveIdx: number) => {
                                            const syllable = question.syllableParts[syllableIdx];
                                            const isClue = cluePositions.includes(syllableIdx);
                                            return (
                                                <Draggable
                                                    key={`syllable-${syllableIdx}-${syllable}`}
                                                    draggableId={`syllable-${syllableIdx}`}
                                                    index={consecutiveIdx}
                                                    isDragDisabled={isAnswered}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`flex items-center justify-center w-[130px] h-[112px] rounded-lg font-bold shadow-md transition-transform duration-150 border-2 ${
                                                                getSyllableStyle(syllableIdx, false)
                                                            } ${
                                                                snapshot.isDragging && !isAnswered
                                                                    ? 'scale-110 shadow-xl z-50'
                                                                    : !isAnswered ? 'hover:scale-105 cursor-grab' : 'cursor-not-allowed'
                                                            }`}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <div className={`flex items-center gap-2 text-3xl ${
                                                                isClue ? 'text-yellow-800' : !isAnswered ? 'text-[#FFF9C4]' : ''
                                                            }`}>
                                                                <GripVertical size={14} className={isClue ? 'text-yellow-800' : !isAnswered ? 'text-[#FFF9C4]' : 'text-gray-600'} />
                                                                <span>{syllable}</span>
                                                                {isClue && (
                                                                    <Lightbulb size={16} className="text-yellow-800" />
                                                                )}
                                                            </div>
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
                )}
            </div>
        </div>
    );
});

export default SyllableType;