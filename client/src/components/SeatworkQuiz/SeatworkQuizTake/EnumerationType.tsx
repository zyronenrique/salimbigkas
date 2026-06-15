import { memo, useCallback } from "react";
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckCircle, GripVertical, XCircle } from "lucide-react";

interface EnumerationTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    availableEnumerationItems: any[];
}

const EnumerationType = memo(({ 
    question,
    answers,
    isAnswered,
    availableEnumerationItems
}: EnumerationTypeProps) => {
    const qId = question.id;

    const getItemStyle = useCallback((item: string, catIdx: number) => {
        if (!isAnswered) {
            return "bg-green-100 border-green-300 text-green-800";
        }
        const correctItems = question.correctItems[question.categories[catIdx]] || [];
        const isCorrectlyPlaced = correctItems.includes(item);

        return isCorrectlyPlaced 
            ? "bg-green-200 border-green-400 text-green-800" 
            : "bg-red-200 border-red-400 text-red-800";
    }, [isAnswered, question.correctItems, question.categories]);

    const getCategoryStyle = useCallback((catIdx: number) => {
        if (!isAnswered) {
            return "bg-[#003311] border-[#8a3903]";
        }
        const userItems = answers[`${qId}-boxes`]?.[catIdx] || [];
        const correctItems = question.correctItems[question.categories[catIdx]] || [];
        const allCorrect = userItems.length === correctItems.length && 
                          userItems.every((item: string) => correctItems.includes(item));
        return allCorrect 
            ? "bg-green-200 border-green-400" 
            : "bg-red-200 border-red-400";
    }, [isAnswered, answers, qId, question.correctItems, question.categories]);

    return (
        <div className="mt-4">
                {/* Category Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                    {question.categories.map((category: string, catIdx: number) => (
                        <Droppable key={catIdx} droppableId={`category-${catIdx}`}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`border-4 rounded-xl p-4 min-h-[180px] transition-all duration-200 ${
                                        getCategoryStyle(catIdx)
                                    } ${
                                        snapshot.isDraggingOver && !isAnswered
                                        ? 'shadow-lg' 
                                        : ''
                                    } ${isAnswered ? 'opacity-75' : ''}`}
                                >
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <h5 className={`font-bold text-center text-lg ${
                                            isAnswered 
                                                ? getCategoryStyle(catIdx).includes('green') 
                                                    ? 'text-green-800' 
                                                    : 'text-red-800'
                                                : 'text-white'
                                        }`}>
                                            {category || `Category ${catIdx + 1}`}
                                        </h5>
                                        {isAnswered && (
                                            <div>
                                                {getCategoryStyle(catIdx).includes('green') ? (
                                                    <CheckCircle size={20} className="text-green-600" />
                                                ) : (
                                                    <XCircle size={20} className="text-red-600" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 min-h-[80px]">
                                        {(answers[`${qId}-boxes`] && answers[`${qId}-boxes`][catIdx] ? answers[`${qId}-boxes`][catIdx] : []).map((item: string, itemIdx: number) => (
                                            <Draggable
                                                key={`${qId}-${catIdx}-${item}-${itemIdx}`}
                                                draggableId={`item-${item}-${qId}-${catIdx}-${itemIdx}`}
                                                index={itemIdx}
                                                isDragDisabled={isAnswered}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`border-2 px-3 py-6 rounded-lg font-semibold transition-all duration-200 ${
                                                            getItemStyle(item, catIdx)
                                                        } ${
                                                            snapshot.isDragging && !isAnswered
                                                                ? 'shadow-xl z-50 rotate-3' 
                                                                : !isAnswered ? 'hover:shadow-md cursor-grab' : 'cursor-not-allowed'
                                                            }`}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            transform: snapshot.isDragging && !isAnswered
                                                                ? `${provided.draggableProps.style?.transform} rotate(3deg)` 
                                                                : provided.draggableProps.style?.transform
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 font-bold">
                                                            <GripVertical size={24} className={isAnswered ? 'text-gray-600' : 'text-green-500'} />
                                                            <span className="text-2xl">{item}</span>
                                                            {isAnswered && (
                                                                <div className="ml-auto">
                                                                    {getItemStyle(item, catIdx).includes('green') ? (
                                                                        <CheckCircle size={16} className="text-green-600" />
                                                                    ) : (
                                                                        <XCircle size={16} className="text-red-600" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {(answers[`${qId}-boxes`] && answers[`${qId}-boxes`][catIdx] ? answers[`${qId}-boxes`][catIdx].length : 0) === 0 && (
                                            <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                                                isAnswered 
                                                    ? 'text-gray-600 bg-gray-100' 
                                                    : 'text-white bg-white/20'
                                            } ${
                                                snapshot.isDraggingOver && !isAnswered ? 'border-orange-400' : 'border-white'
                                            }`}>
                                                <span className="text-sm italic">Drop items here</span>
                                            </div>
                                        )}
                                    </div>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>

                {/* Item Bank */}
                <Droppable droppableId={`item-bank-${qId}`} direction="horizontal">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`rounded-xl transition-all duration-200 min-h-[80px] ${
                                snapshot.isDraggingOver && !isAnswered ? 'bg-transparent' : ''
                            } ${isAnswered ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="grid grid-cols-2 gap-4 justify-center flex-wrap">
                                {availableEnumerationItems.map((item: string, consecutiveIdx: number) => (
                                        <Draggable
                                            key={`bank-${item}-${qId}`}
                                            draggableId={`item-${item}-${qId}-bank-${consecutiveIdx}`}
                                            index={consecutiveIdx}
                                            isDragDisabled={isAnswered}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`flex items-center bg-[#2C3E50] text-white min-h-[80px] px-6 rounded-lg font-semibold transition-all duration-200 ${
                                                        snapshot.isDragging && !isAnswered
                                                        ? 'shadow-xl z-50 rotate-6'
                                                        : !isAnswered ? 'hover:scale-105 hover:shadow-md hover:bg-orange-250 cursor-grab' : 'cursor-not-allowed opacity-50'
                                                    }`}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        transform: snapshot.isDragging && !isAnswered
                                                        ? `${provided.draggableProps.style?.transform} rotate(6deg)` 
                                                        : provided.draggableProps.style?.transform
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <GripVertical size={24} className="text-white" />
                                                        <span className="text-2xl">{item}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                {availableEnumerationItems.length === 0 && (
                                    <div className="text-center text-gray-500 py-8 w-full">
                                        <p className="text-lg font-semibold">No items available</p>
                                    </div>
                                )}
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
        </div>
    );
});

export default EnumerationType;