import { memo, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { imageSrc, SpinLoadingWhite } from "../../Icons/icons";
import { X, PlusCircle, CheckCircle2 } from "lucide-react";
import { toast } from 'react-toastify';
import CustomToast from "../../Toast/CustomToast";

const typeOptions = [
  { value: "multiple", label: "Multiple Choice" },
  { value: "identification", label: "Identification" },
  { value: "enumeration", label: "Enumeration" },
  { value: "matching", label: "Match-up" },
  { value: "syllable", label: "Syllable Split" },
];

interface QuizModalProps {
  type: "quiz" | "seatwork";
  isOpen: boolean;
  onClose: () => void;
  logic: any;
}

const QuizModal = memo(({ type, isOpen, onClose, logic }: QuizModalProps) => {
    const isQuiz = type === "quiz";
    const {
        quizList,
        isRegister,
        selectedQuizzes,
        selectedTypes,
        counts,
        maxQuestions,
        getExistingNonEmptyCount,
        addQuiz,
        removeQuiz,
        setSelectedQuizzes,
        setSelectedTypes,
        setCounts,
        typeValue,
        updateState,
        handleGenerateQuiz,
        setIsDeleteModalOpen,
    } = logic;

    const quizzesArray = Array.isArray(selectedQuizzes) ? selectedQuizzes : [selectedQuizzes].filter(Boolean);
    const currentQuizId = quizzesArray[0];
    const quizTypes = Array.isArray(selectedTypes?.[currentQuizId]) ? selectedTypes[currentQuizId] : [];
    
    const quizCounts = counts[currentQuizId] || {};
    const existingCount = getExistingNonEmptyCount([currentQuizId]);
    const quizTotal = quizTypes.reduce((sum: number, type: string) => sum + (quizCounts[type] || 0), 0);
    const maxReached = (quizTotal + existingCount) >= maxQuestions;

    const handleHelp = useCallback(() => {
        toast.info(
            <CustomToast 
                title="Follow these guidelines:" 
                subtitle={
                    <ul className="font-bold list-disc list-inside space-y-1 pl-6">
                        <li className="-indent-5">Select/ Unselect one <b>{isQuiz ? "quiz" : "seatwork"}</b> to configure its question types and counts.</li>
                        <li className="-indent-5">You can add up to <b>3</b> {isQuiz ? "quizzes" : "seatworks"}.</li>
                        <li className="-indent-5">Each {isQuiz ? "quiz" : "seatwork"} can have multiple question types.</li>
                        <li className="-indent-5">Ensure that the total number of questions does not exceed <b>{maxQuestions}</b>.</li>
                        <li className="-indent-5">Existing non-empty questions are counted towards this limit.</li>
                        <li className="-indent-5">Select/ Unselect one or more {isQuiz ? "quizzes" : "seatworks"} to generate.</li>
                    </ul>
                } 
            />
        );
    }, [isQuiz, maxQuestions]);
    
    const quizSelection = useMemo(() => (
        <div className="mb-6">
            <motion.button 
                type="button"
                title="Help"
                onClick={handleHelp}
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <img loading="lazy" src={imageSrc.gameInfo} alt="Game Info" className="size-8" />
                <span className="font-bold text-lg">Help</span>
            </motion.button>
            <div className="flex gap-4">
                {quizList.map((quiz: any) => (
                    <motion.div
                        key={quiz.id}
                        className={`relative flex flex-col items-center p-6 rounded-xl border-2 shadow w-full transition-all duration-200 cursor-pointer group
                            ${quizzesArray.includes(quiz.id)
                                ? "border-[#2C3E50] bg-gradient-to-br from-[#f4f7fa] to-[#e8ecf1] shadow-lg"
                                : "border-gray-200 bg-white hover:border-[#2C3E50]/40"
                            }
                            ${isRegister ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
                        `}
                        onClick={() => {
                            if (isRegister) return;
                            setSelectedQuizzes((prev: string[]) => {
                                if (prev.includes(quiz.id)) {
                                    return prev.filter(id => id !== quiz.id);
                                } else {
                                    return [...prev, quiz.id];
                                }
                            });
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className={`${isQuiz ? "" : "text-sm"} font-bold text-center`}>{quiz.name}</span>
                        <span className="text-xs text-gray-500">
                            {getExistingNonEmptyCount([quiz.id])} question
                            {getExistingNonEmptyCount([quiz.id]) !== 1 ? "s" : ""}
                        </span>
                        {quizzesArray.includes(quiz.id) && (
                            <CheckCircle2 size={20} className="absolute top-2 left-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        {quizList.length > 1 && (
                            <button
                                type="button"
                                title={`Remove ${isQuiz ? "Quiz" : "Seatwork"}`}
                                onClick={e => {
                                    e.stopPropagation();
                                    setIsDeleteModalOpen(true);
                                }}
                                className="absolute top-2 right-2 text-xs text-[#2C3E50] hover:text-red-600 ml-2"
                                disabled={isRegister}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </motion.div>
                ))}
                {quizList.length < 3 && (
                    <button
                        type="button"
                        title={`Add ${isQuiz ? "Quiz" : "Seatwork"}`}
                        onClick={addQuiz}
                        className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl border-dashed border-2 border-gray-300 hover:border-[#2C3E50] shadow w-full transition-all duration-200 cursor-pointer"
                        disabled={isRegister}
                    >
                        <PlusCircle size={24} className="text-gray-400 hover:text-[#2C3E50]" />
                        <span className="text-xs font-bold text-gray-500">Add {isQuiz ? "Quiz" : "Seatwork"}</span>
                    </button>
                )}
            </div>
        </div>
    ), [quizList, quizzesArray, isRegister, type, addQuiz, removeQuiz, getExistingNonEmptyCount, setSelectedQuizzes]);

    const anyInvalid = quizzesArray.some((quizId: string) => {
        const quizCounts = counts[quizId] || {};
        const quizTypes = selectedTypes[quizId] || [];
        const missingCount = quizTypes.some((type: string) => !quizCounts[type] || quizCounts[type] < 1);
        const quizTotal = quizTypes.reduce((sum: number, type: string) => sum + (quizCounts[type] || 0), 0);
        const existingCount = getExistingNonEmptyCount([quizId]);
        const maxReached = (quizTotal + existingCount) > maxQuestions;
        return quizTypes.length === 0 || missingCount || quizTotal === 0 || maxReached;
    });

    if (!isOpen) {
        return null;
    }

    return (
        <motion.div 
            className="relative flex flex-1 max-w-[450px]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
                duration: 0.3,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.4 },
            }}
        >
            <img loading="lazy" src={imageSrc.aiQuizPeeking} alt="AI Quiz" className="absolute top-1/2 -left-51 z-0 w-40 md:w-48 lg:w-56 transform -translate-y-1/2" />
            <div className={`flex-1 bg-white py-10 px-10 rounded-lg shadow-lg z-10`}>
                <motion.button
                    disabled={isRegister}
                    title="Close Modal"
                    className="absolute top-3 right-3 text-[#2C3E50] hover:text-red-600 cursor-pointer"
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <X size={28}/>
                </motion.button>
                {/* Modal content */}
                <div className="flex flex-col text-left mx-auto">
                    {quizSelection}
                    <div className="mt-2 text-left">
                        <div className="mb-2 text-left relative min-w-[180px]">
                            <label
                                className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 text-lg font-medium px-1
                                ${quizTypes.length > 0 ? "bg-white top-[-1px] text-[#2C3E50] text-sm" : "top-1/2 text-gray-500 text-base"}
                                `}
                                htmlFor="select-types"
                            >
                                Select type
                            </label>
                            <Select
                                inputId="select-types"
                                isMulti
                                isDisabled={isRegister || maxReached || quizzesArray.length === 0}
                                required
                                name="select-types"
                                options={typeOptions}
                                classNamePrefix="react-select"
                                value={typeOptions.filter((opt) => quizTypes.includes(opt.value))}
                                onChange={(opts) => {
                                    const types = Array.isArray(opts) ? opts.map((opt) => opt.value) : [];
                                    setSelectedTypes((prev: Record<string, string[]>) => {
                                        setCounts((prevCounts: Record<string, Record<string, number>>) => {
                                            const quizCounts = { ...(prevCounts[currentQuizId] || {}) };
                                            types.forEach(type => {
                                                if (!quizCounts[type]) quizCounts[type] = 1;
                                            });
                                            return { ...prevCounts, [currentQuizId]: quizCounts };
                                        });
                                        return {
                                            ...prev,
                                            [currentQuizId]: types
                                        };
                                    });
                                }}
                                onInputChange={(val) => updateState({ typeValue: val })}
                                inputValue={typeValue}
                                placeholder=" "
                                filterOption={(option, inputValue) => {
                                    if (!inputValue) return true;
                                    const label = option.label.toLowerCase();
                                    const input = inputValue.toLowerCase();
                                    return label.includes(input);
                                }}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        minHeight: "58px",
                                        padding: "8px",
                                        borderColor: quizTypes.length > 0 ? "#2C3E50" : "#d1d5db",
                                        boxShadow: state.isFocused
                                        ? "0 0 0 2px #2C3E50"
                                        : base.boxShadow,
                                        "&:hover": { borderColor: "#2C3E50" },
                                        backgroundColor: "#fff",
                                    }),
                                    option: (base: any, state: any) => ({
                                        ...base,
                                        backgroundColor: state.isSelected
                                        ? "#2C3E50"
                                        : state.isFocused
                                        ? "#34495e"
                                        : "#2C3E50",
                                        color: "#fff",
                                        fontWeight: state.isSelected ? "bold" : "normal",
                                        padding: 12,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }),
                                    noOptionsMessage: (base: any) => ({
                                        ...base,
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: "1rem",
                                        backgroundColor: "#2C3E50",
                                        padding: "12px",
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        width: "max-content",
                                        fontWeight: "bold",
                                        borderRadius: 5,
                                        backgroundColor: "#eaf0fa",
                                        color: "#2C3E50",
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: "#2C3E50",
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: "#2C3E50",
                                        ":hover": { backgroundColor: "#2C3E50", color: "white" },
                                    }),
                                    menu: (base: any) => ({
                                        ...base,
                                        backgroundColor: "#2C3E50",
                                    }),
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                    }),
                                }}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                closeMenuOnSelect={false}
                            />
                        </div>
                    </div>
                </div>
                <div className="text-left">
                    {quizTypes.length > 0 && currentQuizId && (
                        <>
                            <label className={`block text-center text-base font-medium text-[#2C3E50] mt-2 mb-6`}>
                                How many questions?
                            </label>
                            <div className={`grid gap-2 mx-auto`}>
                                <div className="mb-2">
                                    <div className={`grid gap-2 mx-auto grid-cols-2`}>
                                        {quizTypes.map((type: string, index: number) => {
                                            const value = quizCounts[type] || "";
                                            const otherTypesTotal = quizTypes
                                                .filter(t => t !== type)
                                                .reduce((sum, t) => sum + (quizCounts[t] || 0), 0);
                                            const maxForInput = Math.max(1, maxQuestions - existingCount - otherTypesTotal);
                                            const isLastOdd = quizTypes.length % 2 === 1 && index === quizTypes.length - 1;
                                            return (
                                                <div
                                                    key={type}
                                                    className={`relative mb-2 ${isLastOdd ? "col-span-2 flex justify-center" : ""}`}
                                                >
                                                    <input
                                                        disabled={isRegister}
                                                        title={`${type}`}
                                                        name={`${type}`}
                                                        type="number"
                                                        min={1}
                                                        max={maxForInput}
                                                        required
                                                        className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${value ? "border-[#2C3E50]" : "border-gray-300"}`}
                                                        value={value}
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value;
                                                            const newValue = parseInt(inputValue, 10) || 0;
                                                            const newQuizCounts = { ...quizCounts, [type]: newValue };
                                                            const newQuizTotal = quizTypes.reduce((sum: number, t: string) => sum + (newQuizCounts[t] || 0), 0);
                                                            if (
                                                                /^\d{0,2}$/.test(inputValue) &&
                                                                newQuizTotal + existingCount <= maxQuestions
                                                            ) {
                                                                setCounts((prev: Record<string, Record<string, number>>) => ({
                                                                ...prev,
                                                                [currentQuizId]: newQuizCounts,
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        className={`absolute text-lg font-bold left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${value ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                                                        htmlFor={`${currentQuizId}-${type}`}
                                                    >
                                                        {type}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className={`text-center text-sm font-bold mt-2 ${maxReached ? "text-red-600" : ""}`}>
                                        {maxReached
                                            ? `Maximum total of ${maxQuestions} questions reached.`
                                            : `${Math.max(0, maxQuestions - existingCount - quizTotal)} questions remaining (Max: ${maxQuestions})`}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    <motion.button
                        disabled={isRegister || quizzesArray.length === 0 || quizTypes.length === 0 || anyInvalid}
                        title={`Generate ${isQuiz ? "quiz" : "seatwork"}`}
                        type="button"
                        className={`flex items-center justify-center gap-2 w-full bg-[#2C3E50] text-white p-4 rounded-lg hover:bg-[#34495e]
                            ${isRegister || quizzesArray.length === 0 || quizTypes.length === 0 || anyInvalid ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                        `}
                        onClick={() => handleGenerateQuiz({ selectedQuizzes, selectedTypes, counts })}
                        whileHover={{ scale: isRegister || quizzesArray.length === 0 || quizTypes.length === 0 || anyInvalid ? 1 : 1.05 }}
                        whileTap={{ scale: isRegister || quizzesArray.length === 0 || quizTypes.length === 0 || anyInvalid ? 1 : 0.95 }}
                    >
                        {isRegister ? <SpinLoadingWhite size={6} /> : ""}
                        <span>{isRegister ? "Generating..." : "Generate"}</span>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
});

export default QuizModal;