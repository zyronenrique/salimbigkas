import { memo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, X, GripVertical, Gamepad2, RefreshCcw } from 'lucide-react';
import { Question } from './QuizConstants';

interface EnumerationQuestionProps {
  question: Question;
  questionIndex: number;
  onCategoryChange?: (ansIdx: number, value: string) => void;
  onAddCategory?: () => void;
  onRemoveCategory?: (ansIdx: number) => void;
  onAddItemToBank?: (item: string, categoryIdx?: number) => void;
  onDragEnd?: (result: any) => void;
  onClearAllItems?: () => void;
  onSetupDragDrop?: () => void;
  disabled: boolean;
}

const EnumerationQuestion = memo(({ 
  question,
  onCategoryChange,
  onAddCategory,
  onRemoveCategory,
  onAddItemToBank,
  onDragEnd,
  onClearAllItems,
  onSetupDragDrop,
  disabled 
}: EnumerationQuestionProps) => {
  return (
    <div className="mt-1">
      <DragDropContext onDragEnd={() => onDragEnd && onDragEnd}>
        {/* Improved Item Management with DragDropContext */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-300 mb-6">
          <div className="flex items-center justify-between mb-4 ">
            <h4 className="font-bold text-[#2C3E50] flex items-center gap-2">
              <Plus size={20} />
              Add Items & Assign Categories
            </h4>
            {/* Add Category Button */}
            <div className="flex items-center justify-center hover:scale-105 transition-colors">
              <button
                type="button"
                className="flex items-center gap-2 text-gray-500 hover:text-[#2C3E50] transition-colors"
                onClick={onAddCategory}
                disabled={disabled}
              >
                <Plus size={24} className="rounded-full border-2 border-dashed border-[#2C3E50]"/>
                <span className="text-base font-bold">Add Category</span>
              </button>
            </div>
          </div>
          
          {/* Dynamic Category Grid with Droppable Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {question.categories.map((categoryName: string, catIdx: number) => (
              <div key={catIdx} className="bg-white rounded-lg p-4 border border-[#2C3E50] transition-all duration-200 hover:shadow-md">
                {/* Category Header with Inline Edit */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-1 bg-[#2C3E50] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {catIdx + 1}
                  </div>
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-[#2C3E50] rounded focus:ring-2 focus:ring-[#2C3E50] focus:outline-none font-semibold text-[#2C3E50]"
                    placeholder={`Category ${catIdx + 1}`}
                    value={categoryName}
                    onChange={(e) => onCategoryChange && onCategoryChange(catIdx, e.target.value)}
                    disabled={disabled}
                  />
                  <button
                    type="button"
                    className="text-red-500 hover:bg-red-100 hover:scale-105 rounded px-0.5 py-2 transition-colors"
                    onClick={() => onRemoveCategory && onRemoveCategory(catIdx)}
                    disabled={question.categories.length === 1 || disabled}
                    title="Remove category"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {/* Quick Add Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-[#2C3E50] rounded focus:ring-2 focus:ring-[#2C3E50] focus:outline-none text-sm"
                    placeholder={`Add item to ${categoryName || `Category ${catIdx + 1}`}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        if (target.value.trim()) {
                          onAddItemToBank && onAddItemToBank(target.value, catIdx);
                          target.value = '';
                        }
                      }
                    }}
                    disabled={disabled}
                  />
                  <button
                    type="button"
                    className="bg-[#2C3E50] text-white px-3 py-2 rounded text-sm hover:bg-[#2C3E50] hover:scale-105 transition-all duration-150"
                    onClick={(e) => {
                      const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        onAddItemToBank && onAddItemToBank(input.value, catIdx);
                        input.value = '';
                      }
                    }}
                    disabled={disabled}
                  >
                    Add
                  </button>
                </div>
                
                {/* Droppable Area for Items */}
                <Droppable droppableId={catIdx.toString()}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[100px] rounded-lg transition-all duration-200 ${
                        snapshot.isDraggingOver 
                          ? 'bg-transparent'
                          : ''
                      }`}
                    >
                      <p className="text-base text-gray-600 mb-2">Items in this {categoryName}</p>
                      {(question.correctItems?.[categoryName] || []).length > 0 ? (
                        (question.correctItems?.[categoryName] || []).map((item: string, itemIdx: number) => {
                          const draggableId = `item-${catIdx}-${itemIdx}`;
                          return (
                          <Draggable 
                            key={draggableId} 
                            draggableId={draggableId} 
                            index={itemIdx}
                            isDragDisabled={disabled}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  transform: snapshot.isDragging 
                                    ? provided.draggableProps.style?.transform
                                    : 'translate(0px, 0px)'
                                }}
                                className={`flex items-center gap-2 bg-[#2C3E50] rounded px-2 py-4 shadow-sm border border-[#2C3E50] transition-all duration-200 ${
                                  snapshot.isDragging
                                    ? 'shadow-lg'
                                    : 'hover:shadow-md'
                                }`}
                              >
                                <div {...provided.dragHandleProps} className="flex items-center gap-1 flex-1 cursor-grab active:cursor-grabbing">
                                  <GripVertical size={18} className="text-white" />
                                  <input
                                    title="Edit item"
                                    type="text"
                                    className="w-full px-0.5 py-1 bg-transparent border-none focus:outline-none focus:bg-blue-50 focus:border focus:border-[#2C3E50] focus:rounded text-base font-medium text-white focus:text-[#2C3E50]"
                                    value={item}
                                    onChange={(e) => {
                                      // This would need to be passed as a prop
                                      console.log('Item change:', e.target.value);
                                    }}
                                    disabled={disabled || snapshot.isDragging}
                                    onFocus={(e) => e.target.select()}
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="text-red-500 hover:bg-red-100 rounded p-1 transition-colors text-sm hover:scale-105"
                                  onClick={() => {
                                    // This would need to be handled through props
                                    console.log('Remove item:', item);
                                  }}
                                  disabled={disabled}
                                  title="Remove item"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                          </Draggable>
                          );
                        })
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-400 italic text-xs">Drop items here or use the add button above</p>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))} 
          </div>
          
          {/* Bulk Operations */}
          <div className="border-t border-blue-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#2C3E50]">
                Total items: {Object.values(question.correctItems || {}).flat().length}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-red-500 text-sm hover:bg-red-100 px-3 py-1 rounded border border-red-300 hover:scale-105 transition-colors"
                  onClick={onClearAllItems}
                  disabled={disabled}
                >
                  Clear All Items
                </button>
              </div>
            </div>
          </div>
        </div>
      </DragDropContext>
      
      {/* Student Preview */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-300">
        <h4 className="font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
          <Gamepad2 size={24} />
          Student Preview
        </h4>
        
        {/* Category Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {question.categories.map((category: string, catIdx: number) => (
            <div
              key={catIdx}
              className="bg-white border-2 border-[#2C3E50] rounded-xl p-4 min-h-[120px]"
            >
              <h5 className="truncate font-bold text-[#2C3E50] mb-2 text-center">
                {category || `Category ${catIdx + 1}`}
              </h5>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 min-h-[80px] flex items-center justify-center">
                <span className="text-gray-400 text-sm">Drop items here</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Item Bank Preview */}
        <div className="bg-white rounded-xl p-4">
          <h5 className="font-bold text-[#2C3E50] mb-3 text-center">Item Bank</h5>
          {question.itemBank && question.itemBank.length > 0 ? (
            <div className="flex gap-2 justify-center flex-wrap">
              {question.itemBank.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#2C3E50] text-white px-4 py-2 rounded-lg font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <GripVertical className="inline mr-1" size={16} />
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-lg font-semibold mb-2">No items to display</p>
              <p className="text-sm">Add items above to see the student preview</p>
            </div>
          )}
          <div className="mt-4 text-center">
            <button
              type="button"
              className="bg-[#2C3E50] text-white px-4 py-2 rounded-lg hover:bg-[#34495e] transition-all duration-150"
              onClick={onSetupDragDrop}
              disabled={disabled}
            >
              <RefreshCcw size={16} className="inline mr-2" />
              Refresh Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

EnumerationQuestion.displayName = 'EnumerationQuestion';

export default EnumerationQuestion;