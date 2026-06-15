import { memo, useCallback } from "react";
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckCircle, GripVertical, RefreshCcw, XCircle } from "lucide-react";

interface MatchingTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    availableMatchingItems: any[];
}

const MatchingType = memo(({ 
    question,
    answers, 
    isAnswered,
    availableMatchingItems
}: MatchingTypeProps) => {
    const qId = question.id;

    const getMatchStyle = useCallback((leftIdx: number, rightIdx: number) => {
        if (!isAnswered) {
            return "bg-green-100 border-green-300 text-green-800";
        }
        const correctMatches = question.matches || [];
        const isCorrectMatch = correctMatches[leftIdx] === rightIdx;
        return isCorrectMatch 
            ? "bg-green-200 border-green-400 text-green-800" 
            : "bg-red-200 border-red-400 text-red-800";
    }, [isAnswered, question.matches]);

    return (
        <div className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Optimized Drop Zones */}
                <div className="bg-[#003311] rounded-xl p-5 shadow-sm border-4 border-[#8a3903]">
                    <h5 className="font-bold text-white mb-4 text-center text-lg">
                        Match These Items
                    </h5>
                    <div className="space-y-3">
                        {question.leftItems?.map((item: string, leftIdx: number) => {
                            const matchedItemIdx = answers[qId]?.[leftIdx];
                            const hasMatch = matchedItemIdx !== null && matchedItemIdx !== undefined;
                            return (
                                <Droppable key={leftIdx} droppableId={`left-${leftIdx}`}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`bg-white/20 rounded-xl p-4 border-2 border-dashed shadow-md min-h-[80px] transition-colors duration-150 ${
                                            snapshot.isDraggingOver && !isAnswered
                                                ? 'border-orange-400'
                                                : 'border-white'
                                            } ${isAnswered ? 'opacity-75' : ''}`}
                                        >
                                            <div className="flex text-left items-center gap-3 mb-4">
                                                <div className="bg-white text-[#2C3E50] rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                                    {leftIdx + 1}
                                                </div>
                                                <span className="text-white font-semibold flex-1">
                                                    {item}
                                                </span>
                                            </div>
                                            {hasMatch && (
                                                <div className="mt-2">
                                                    <Draggable
                                                        draggableId={`right-${matchedItemIdx}`}
                                                        index={matchedItemIdx}
                                                        isDragDisabled={isAnswered}
                                                    >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`px-4 py-6 rounded-lg border-2 transition-transform duration-150 ${
                                                                getMatchStyle(leftIdx, matchedItemIdx)
                                                            } ${
                                                                snapshot.isDragging && !isAnswered
                                                                ? 'scale-105 shadow-xl z-50'
                                                                : !isAnswered ? 'hover:scale-102 cursor-grab' : 'cursor-not-allowed'
                                                            }`}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <GripVertical size={16} className={isAnswered ? 'text-gray-600' : 'text-green-500'} />
                                                                <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold ${
                                                                    isAnswered 
                                                                        ? question.matches[leftIdx] === matchedItemIdx
                                                                            ? 'bg-green-500 text-white'
                                                                            : 'bg-red-500 text-white'
                                                                        : 'bg-green-500 text-white'
                                                                }`}>
                                                                    {String.fromCharCode(97 + matchedItemIdx)}
                                                                </div>
                                                                <span className="text-green-800 font-semibold">
                                                                    {question.rightItems?.[matchedItemIdx] || 'Unknown'}
                                                                </span>
                                                                {isAnswered && (
                                                                    <div className="ml-auto">
                                                                        {question.matches[leftIdx] === matchedItemIdx ? (
                                                                            <CheckCircle size={20} className="text-green-600" />
                                                                        ) : (
                                                                            <XCircle size={20} className="text-red-600" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    </Draggable>
                                                </div>
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column - Optimized Available Items */}
                <div className="py-4">
                    <div className="flex items-center justify-center gap-2 mt-2 mb-5">
                        <RefreshCcw size={20} className="text-[#2C3E50]" />
                        <h5 className="font-bold text-[#2C3E50] text-center">
                            Drag to Match!
                        </h5>
                    </div>
                    <Droppable droppableId={`available-items-${qId}`}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`space-y-3 min-h-[300px] transition-colors duration-150 ${
                                    snapshot.isDraggingOver && !isAnswered
                                    ? 'bg-transparent' 
                                    : ''
                                } ${isAnswered ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {availableMatchingItems.map(({item, rightIdx}: {item: string; rightIdx: number}, consecutiveIdx: number) => (
                                        <Draggable
                                            key={`right-${rightIdx}`}
                                            draggableId={`right-${rightIdx}`}
                                            index={consecutiveIdx}
                                            isDragDisabled={isAnswered}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`bg-[#2C3E50] rounded-xl px-4 py-6 border-2 border-[#2C3E50] shadow-sm transition-transform duration-150 ${
                                                    snapshot.isDragging && !isAnswered
                                                        ? 'scale-105 shadow-xl z-50'
                                                        : !isAnswered ? 'hover:scale-102 hover:shadow-md cursor-grab' : 'cursor-not-allowed opacity-50'
                                                    }`}
                                                    style={provided.draggableProps.style}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <GripVertical size={16} className="text-white" />
                                                        <div className="bg-white text-[#2C3E50] rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                                            {String.fromCharCode(97 + rightIdx)}
                                                        </div>
                                                        <span className="text-white font-semibold">
                                                            {item}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>
        </div>
    );
});

export default MatchingType;