import { useMemo, useEffect, memo } from "react";
import { getWordImages } from "../../../utils/helpers";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  PlusCircle,
  CheckCircle2,
  ImagePlus,
  XCircle,
} from "lucide-react";
import { SpinLoadingColored } from "../../Icons/icons";
import { imageSrc } from "../../Icons/icons";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// Import the modular components
import { useQuizFormLogic } from './useSeatworkQuizFormLogic';
import MultipleChoiceQuestion from './MutltipleChoiceQuestion';
import IdentificationQuestion from './IdentificationQuestion';
import EnumerationQuestion from './EnumerationQuestion';
import MatchingQuestion from './MatchingQuestion';
import SyllableQuestion from './SyllableQuestion';
import QuestionFormWrapper from './QuestionFormWrapper';
import SeatworkQuizFormProgress from './SeatworkQuizFormProgress';
import SeatworkQuizModal from './SeatworkQuizModal';
import { useClassContext } from "../../../hooks/classContext";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../Modals/DeleteModal";
import PercentageModalModal from "./PercentageModal";
import NavButton from "./NavButton";

const QuizForm = memo(() => {
  const navigate = useNavigate();
  const { selectedLesson, isQuiz, isSeatWork } = useClassContext();
  const logic = useQuizFormLogic();
  // Use the logic hook
  const {
    quizList,
    selectedCategory,
    selectedType,
    isRegister,
    isAiQuiz,
    setIsAiQuiz,
    setSelectedCategory,
    setSelectedType,
    addQuiz,
    removeQuiz,
    categoryQuestions,
    questions,
    nextQuizNumber,
    nextSeatworkNumber,
    maxQuestions,
    isDeleteModalOpen,
    isPercentageModalOpen,
    setIsPercentageModalOpen,
    setIsDeleteModalOpen,
    getNonEmptyCount,
    handleQuestionChange,
    handleImageChange,
    addQuestion,
    removeQuestion,
    handleOptionChange,
    handleAnswerChange,
    shuffleOptions,
    handleIdentificationTextChange,
    generateLetterBank,
    handleEnumerationTextChange,
    addEnumerationAnswer,
    removeEnumerationAnswer,
    addItemToBank,
    handleEnumerationDragEnd,
    clearAllItems,
    setupEnumerationDragDrop,
    handleShufflePreview,
    handleLeftItemChange,
    handleRightItemChange,
    handleMatchChange,
    addMatchingPair,
    removeMatchingPair,
    handleTargetWordChange,
    handleSyllablePartChange,
    addSyllablePart,
    removeSyllablePart,
    autoGenerateSyllables,
    getTotalItems,
    getMaxItems,
    handleSubmitQuiz,
  } = logic;

  useEffect(() => {
    setTimeout(() => {
      if (quizList?.length > 0 && !quizList.some((q: any) => q.id === selectedCategory)) {
        setSelectedCategory(quizList[quizList.length - 1].id);
      }
    }, 300);
  }, [quizList, selectedCategory]);

  const selectedQuizQuestions = categoryQuestions[selectedCategory] || [];
  const nonEmptyCount = getNonEmptyCount(selectedQuizQuestions);
  const emptyCount = selectedQuizQuestions.length - nonEmptyCount;

  const renderSummary = useMemo(() => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-[#2C3E50] flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-gradient-to-b from-[#2C3E50] to-[#34495e] rounded-full mr-2" />
        {isSeatWork ? "Seatwork" : "Quiz"} Overview
      </h2>
      <div className="flex gap-6">
        {quizList.map((quiz: any) => {
          const questions = categoryQuestions[quiz.id] || [];
          const validCount = getNonEmptyCount(questions);
          const hasQuestions = questions.length > 0;
          const hasContent = validCount > 0;
          return (
            <motion.div
              key={quiz.id}
              title={quiz.name}
              className={`relative flex flex-col items-center p-6 rounded-2xl border-2 shadow-md w-full transition-all duration-200 cursor-pointer group
                ${
                  selectedCategory === quiz.id
                    ? "border-[#2C3E50] bg-gradient-to-br from-[#f4f7fa] to-[#e8ecf1] shadow-lg"
                    : "border-gray-200 bg-white hover:border-[#2C3E50]/40"
                }
              `}
              onClick={() => setSelectedCategory(quiz.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`flex mb-2 ${selectedCategory === quiz.id ? "text-[#2C3E50]" : "text-gray-400 group-hover:text-[#2C3E50]"}`}>
                {getWordImages(quiz.name, true).map((imageSrc, index) => (
                  <img 
                    loading="lazy"
                    key={index} 
                    src={imageSrc || ""} 
                    alt={`Letter ${index}`} 
                    className={`block ${isSeatWork ? "h-6" : "h-8"} w-auto object-contain 
                        ${isQuiz && index > 3 ? "ml-2" : isSeatWork && index > 7 ? "ml-2" : "-ml-1"}
                    `}
                  />
                ))}
              </div>
              <span className="text-sm font-bold mb-1">
                {categoryQuestions[quiz.id].length} question
                {categoryQuestions[quiz.id].length !== 1 ? "s" : ""}
              </span>
              {hasContent && (
                <CheckCircle2 className="text-green-500 mt-1" size={20} />
              )}
              {!hasQuestions && (
                <span className="text-xs text-red-400 mt-1">No questions</span>
              )}
              {quizList.length > 1 && (
                <motion.button
                  type="button"
                  title={`Remove ${isSeatWork ? "Seatwork" : "Quiz"}`}
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="absolute top-2 right-2 text-xs text-[#2C3E50] hover:text-red-600 ml-2"
                  disabled={isRegister}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <XCircle className="inline-block mr-1" size={24} />
                </motion.button>
              )}
            </motion.div>
          );
        })}
        {quizList.length < 3 && (
          <motion.button
            type="button"
            title={`Add ${isSeatWork ? "Seatwork" : "Quiz"}`}
            onClick={addQuiz}
            className="flex flex-col items-center justify-center gap-1 px-6 py-4 rounded-2xl border-dashed border-2 border-gray-300 hover:border-[#2C3E50] shadow-md w-full transition-all duration-200 cursor-pointer"
            disabled={isRegister}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle size={24} />
            <span className="text-sm font-bold text-gray-500">Add {isSeatWork ? "Seatwork" : "Quiz"}</span>
          </motion.button>
        )}
      </div>
    </div>
  ), [categoryQuestions, selectedCategory, quizList, addQuiz, removeQuiz, isRegister]);

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between border-b-2 border-[#BDC3C7] bg-[#2C3E50] text-white shadow-sm">
        <motion.button
          type="button"
          className="flex items-center p-6 transition-colors duration-200 group"
          onClick={() => navigate(-1)}
          aria-label="Bumalik sa mga Yunit"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          disabled={isRegister}
        >
          <ChevronLeft className="mr-2" size={26} />
          <span className="text-lg font-semibold">Back</span>
        </motion.button>
        <div className="flex">
          <h2 className="text-lg font-bold tracking-tight">Aralin {selectedLesson?.aralinNumero}</h2>
          <span className="mx-2 font-extrabold">•</span>
          <h1 className="text-xl font-bold truncate max-w-lg">{selectedLesson?.aralinPamagat}</h1>
        </div>
        <motion.button
          type="button"
          className="bg-white text-[#2C3E50] font-extrabold text-lg px-8 py-6"
          onClick={handleSubmitQuiz}
          disabled={isRegister}
          aria-label={`Submit ${isSeatWork ? "seatwork" : "quiz"}`}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
        >
          {isRegister ? (
            <div className="flex items-center justify-center gap-2">
              <SpinLoadingColored size={6}/>
              Publishing...
            </div>
          ) : (
            isSeatWork ? "Publish Seatwork" : "Publish Quiz"
          )}
        </motion.button>
      </div>
      <div className="w-full flex items-center justify-center py-2 bg-gray-300">
        {/* Floating left nav for quiz categories */}
        <div className="flex flex-col items-center justify-center h-full z-30">
          <nav className="bg-gradient-to-b bg-[#2C3E50] w-20 rounded-l-3xl shadow-2xl p-12 flex flex-col items-center border border-[#2C3E50]/30">
            <div className="flex flex-col gap-6 w-full items-center">
              {quizList.map((quiz: any) => (
                <NavButton
                  key={quiz.id}
                  label={quiz.name}
                  selected={selectedCategory === quiz.id}
                  onClick={() => setSelectedCategory(quiz.id)}
                  children={
                    <span className="text-xl font-bold">{`${isSeatWork ? "S" : "Q"} ${isSeatWork ? nextSeatworkNumber + quizList.indexOf(quiz) + 1 : nextQuizNumber + quizList.indexOf(quiz) + 1}`}</span>
                  }
                  disabled={isRegister}
                />
              ))}
              {/* Insert image button */}
              <NavButton
                asLabel
                label="Insert Image"
                icon={<ImagePlus size={28} />}
                inputProps={{
                  type: "file",
                  accept: "image/*",
                  onChange: (e: any) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      handleImageChange(questions.length - 1, file);
                    }
                    e.target.value = "";
                  },
                  disabled: isRegister,
                }}
                disabled={isRegister}
              />
              <NavButton
                label="Add Question"
                icon={<PlusCircle size={28} />}
                onClick={addQuestion}
                disabled={questions.length >= maxQuestions || isRegister}
              />
              <NavButton
                label={`Generate ${isSeatWork ? "seatwork" : "quiz"}`}
                imageSrc={imageSrc.aiQuiz}
                onClick={() => setIsAiQuiz(!isAiQuiz)}
                disabled={isRegister}
              />
            </div>
          </nav>
        </div>
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave" } }}
          defer
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 space-y-10 max-h-screen overflow-y-auto transition-all duration-300"
        >
          {/* Quiz summary */}
          {renderSummary}
          {/* Floating question type nav */}
          <div className="sticky top-0 z-20 flex justify-center mb-8">
            <nav className="inline-flex bg-gradient-to-r from-[#2C3E50]/90 to-[#34495e]/90 rounded-full shadow-lg px-2 py-2 gap-2">
              {["multiple", "identification", "enumeration", "matching", "syllable"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200
                    ${
                      selectedType === type
                        ? "bg-white text-[#2C3E50] shadow"
                        : "bg-transparent text-white hover:bg-white/20"
                    }`}
                  onClick={() => setSelectedType(type)}
                  aria-label={`Set new questions to ${type}`}
                >
                  {type === "multiple" && "Multiple Choice"}
                  {type === "identification" && "Identification"}
                  {type === "enumeration" && "Enumeration"}
                  {type === "matching" && "Match-up"}
                  {type === "syllable" && "Syllable Split"}
                </button>
              ))}
            </nav>
          </div>
          {questions.map((q: any, qIdx: number) => (
            <QuestionFormWrapper
              key={q.id}
              questionIndex={qIdx}
              question={q}
              onQuestionChange={(value) => handleQuestionChange(qIdx, value)}
              onRemoveQuestion={() => removeQuestion(qIdx)}
              canRemove={questions.length > 1}
              disabled={isRegister}
            >
              {/* Image Display */}
              {q.image && (
                <div className="flex flex-col items-center">
                  <div className="relative group w-full flex justify-center">
                    <img
                      loading="lazy"
                      src={q.image as string}
                      alt={`Preview for question ${qIdx + 1}`}
                      className="max-h-56 max-w-full rounded-xl border-2 border-[#2C3E50]/10 shadow-lg object-contain transition-all duration-200"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 transition">
                      {/* Change Image Button */}
                      <label title="Change image" className="bg-white/80 hover:bg-blue-500 hover:text-white text-blue-500 rounded-full p-2 shadow-lg cursor-pointer transition-all duration-150">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) handleImageChange(qIdx, file);
                            e.target.value = "";
                          }}
                          aria-label="Change image"
                          title="Change image"
                          disabled={isRegister}
                        />
                        <span className="text-xs font-bold">Change</span>
                      </label>
                      {/* Remove Image Button */}
                      <button
                        type="button"
                        className="bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full p-2 shadow-lg transition-all duration-150"
                        onClick={() => handleImageChange(qIdx, null)}
                        aria-label="Remove image"
                        title="Remove image"
                        disabled={isRegister}
                      >
                        <span className="text-lg font-bold">×</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Question Type Content */}
              {q.type === "multiple" && (
                <MultipleChoiceQuestion
                  question={q}
                  questionIndex={qIdx}
                  onOptionChange={(optIdx, value) => handleOptionChange(qIdx, optIdx, value)}
                  onAnswerChange={(ansIdx) => handleAnswerChange(qIdx, ansIdx)}
                  onShuffleOptions={() => shuffleOptions(qIdx)}
                  disabled={isRegister}
                />
              )}
              {q.type === "identification" && (
                <IdentificationQuestion
                  question={q}
                  onAnswerChange={(value) => handleIdentificationTextChange(qIdx, value)}
                  onGenerateLetterBank={() => generateLetterBank(qIdx, q.answer || "")}
                  disabled={isRegister}
                />
              )}
              {q.type === "enumeration" && (
                <EnumerationQuestion
                  question={q}
                  questionIndex={qIdx}
                  onCategoryChange={(ansIdx, value) => handleEnumerationTextChange(qIdx, ansIdx, value)}
                  onAddCategory={() => addEnumerationAnswer(qIdx)}
                  onRemoveCategory={(ansIdx) => removeEnumerationAnswer(qIdx, ansIdx)}
                  onAddItemToBank={(item, categoryIdx) => addItemToBank(qIdx, item, categoryIdx)}
                  onDragEnd={(result) => handleEnumerationDragEnd(qIdx, result)}
                  onClearAllItems={() => clearAllItems(qIdx)}
                  onSetupDragDrop={() => setupEnumerationDragDrop(qIdx)}
                  disabled={isRegister}
                />
              )}
              {q.type === "matching" && (
                <MatchingQuestion
                  question={q}
                  onLeftItemChange={(itemIdx, value) => handleLeftItemChange(qIdx, itemIdx, value)}
                  onRightItemChange={(itemIdx, value) => handleRightItemChange(qIdx, itemIdx, value)}
                  onMatchChange={(leftIdx, rightIdx) => handleMatchChange(qIdx, leftIdx, rightIdx)}
                  onAddPair={() => addMatchingPair(qIdx)}
                  onRemovePair={() => removeMatchingPair(qIdx, (q.leftItems?.length || 1) - 1)}
                  onShufflePreview={() => handleShufflePreview(qIdx)}
                  disabled={isRegister}
                />
              )}
              {q.type === "syllable" && (
                <SyllableQuestion
                  question={q}
                  onTargetWordChange={(value) => handleTargetWordChange(qIdx, value)}
                  onSyllablePartChange={(partIdx, value) => handleSyllablePartChange(qIdx, partIdx, value)}
                  onAddSyllablePart={() => addSyllablePart(qIdx)}
                  onRemoveSyllablePart={(partIdx) => removeSyllablePart(qIdx, partIdx)}
                  onAutoGenerateSyllables={(word) => autoGenerateSyllables(qIdx, word)}
                  disabled={isRegister}
                />
              )}
            </QuestionFormWrapper>
          ))}
          <SeatworkQuizFormProgress
            currentItems={getTotalItems(selectedCategory)}
            maxItems={getMaxItems()}
            questionsCount={getTotalItems(selectedCategory)}
          />
        </OverlayScrollbarsComponent>
      </div>
      {isAiQuiz && (
        <div className={"fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"}>
          <SeatworkQuizModal
            type={`${isSeatWork ? "seatwork" : "quiz"}`}
            isOpen={isAiQuiz}
            onClose={() => setIsAiQuiz(!isAiQuiz)}
            logic={logic}
          />
        </div>
      )}
      {isPercentageModalOpen && (
        <div className={"fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"}>
          <PercentageModalModal
            // type={`${isSeatWork ? "seatwork" : "quiz"}`}
            isOpen={isPercentageModalOpen}
            onClose={() => setIsPercentageModalOpen(false)}
            logic={logic}
          />
        </div>
      )}
      {isDeleteModalOpen && (
        <div className={"fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"}>
          <DeleteModal
            entityType={isSeatWork ? "seatwork" : "quiz"}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={async () => {
              removeQuiz(selectedCategory);
              setIsDeleteModalOpen(false);
            }}
            message={
              <span>
                This {isSeatWork ? "seatwork" : "quiz"} has <b>{nonEmptyCount}</b> non-empty question{nonEmptyCount !== 1 ? "s" : ""} and <b>{emptyCount}</b> empty question{emptyCount !== 1 ? "s" : ""}.<br />
              </span>
            }
          />
        </div>
      )}
    </motion.div>
  );
});

export default QuizForm;