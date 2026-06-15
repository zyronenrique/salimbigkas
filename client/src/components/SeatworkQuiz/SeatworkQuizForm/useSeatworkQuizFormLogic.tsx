import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import CustomToast from '../../Toast/CustomToast';
import { model } from '../../../firebase/firebase';
import { getPdfFileName, urlToFile, shuffleArray, fileToGenerativePart, getMaxQuestionsByGrade, toFirestoreQuestions, processQuestionImages, filterEmptyQuestions } from '../../../utils/helpers';
import { splitIntoSyllables } from './SyllabificationRules';
import { defaultQuestion } from './QuizConstants';
import { useClassContext } from '../../../hooks/classContext';
import { useAuth } from '../../../hooks/authContext';
import { doCreateSeatworkorQuiz } from '../../../api/functions';
import { useNavigate } from 'react-router-dom';
import { useLogReg } from '../../Modals/LogRegProvider';

interface UseQuizFormLogicState {
    quizList: QuizInfo[];
    categoryQuestions: Record<string, any[]>;
    generatedQuestions: any[];
    percentage: Record<string, number>;
    selectedCategory: string;
    selectedType: string;
    isRegister: boolean;
    isAiQuiz: boolean;
    typeValue: string;
    selectedQuizzes: string[];
    selectedTypes: Record<string, string[]>;
    counts: Record<string, Record<string, number>>;
    isDeleteModalOpen: boolean;
    isPercentageModalOpen: boolean;
}

type QuizInfo = {
    id: string;
    name: string;
};

export const useQuizFormLogic = () => {
    const navigate = useNavigate();
    const { currentUser, role, setLoading } = useAuth();
    const { formattedGradeLevel } = useLogReg();
    const { selectedClass, selectedYunit, selectedLesson, isSeatWork } = useClassContext();
    const nextQuizNumber = selectedLesson.quizCount || 0;
    const nextSeatworkNumber = selectedLesson.seatworkCount || 0;
    const defaultQuizId = crypto.randomUUID();
    const defaultQuizName = `${isSeatWork ? "Seatwork" : "Quiz"} ${isSeatWork ? nextSeatworkNumber + 1 : nextQuizNumber + 1}`;

    const [state, setState] = useState<UseQuizFormLogicState>({
        quizList: [
            { id: defaultQuizId, name: defaultQuizName }
        ],
        categoryQuestions: {
            [defaultQuizId]: [defaultQuestion("multiple")],
        },
        generatedQuestions: [],
        percentage: {},
        selectedCategory: defaultQuizId,
        selectedType: 'multiple',
        isRegister: false,
        isAiQuiz: false,
        typeValue: '',
        selectedQuizzes: [defaultQuizId],
        selectedTypes: { [defaultQuizId]: ['multiple'] },
        counts: { [defaultQuizId]: { multiple: 1 } },
        isDeleteModalOpen: false,
        isPercentageModalOpen: false,
    });
    
    const updateState = useCallback(
        (updates: Partial<UseQuizFormLogicState> | ((prev: UseQuizFormLogicState) => Partial<UseQuizFormLogicState>)) => {
            setState(prev =>
                typeof updates === "function"
                    ? { ...prev, ...updates(prev) }
                    : { ...prev, ...updates }
            );
        },
        []
    );

    const maxQuestions = getMaxQuestionsByGrade(selectedClass.gradeLevel);

    const addQuiz = useCallback(() => {
        if (state.quizList.length >= 3) return;
        setLoading(true);
        const newId = crypto.randomUUID();
        const nextQN = nextQuizNumber + state.quizList.length + 1;
        const nextSN = nextSeatworkNumber + state.quizList.length + 1;
        const newName = `${isSeatWork ? "Seatwork" : "Quiz"} ${isSeatWork ? nextSN : nextQN}`;
        setState(prev => ({
            ...prev,
            quizList: [...prev.quizList, { id: newId, name: newName }],
            categoryQuestions: {
                ...prev.categoryQuestions,
                [newId]: [defaultQuestion("multiple")],
            },
            selectedTypes: {
                ...prev.selectedTypes,
                [newId]: [prev.selectedType || "multiple"],
            },
            counts: {
                ...prev.counts,
                [newId]: { [prev.selectedType || "multiple"]: 1 },
            },
            selectedQuizzes: [...prev.selectedQuizzes, newId],
        }));
        setLoading(false);
    }, [state.quizList, selectedLesson, isSeatWork]);

    const removeQuiz = useCallback((quizId: string) => {
        if (state.quizList.length <= 1) return;
        setLoading(true);
        setState(prev => {
            const updatedQuizList = prev.quizList.filter((q) => q.id !== quizId);
            const renumberedQuizList = updatedQuizList.map((q, idx) => ({
                ...q,
                name: `${isSeatWork ? "Seatwork" : "Quiz"} ${isSeatWork ? nextSeatworkNumber + idx + 1 : nextQuizNumber + idx + 1}`,
            }));
            const newCategoryQuestions: Record<string, any[]> = {};
            renumberedQuizList.forEach((q) => {
                newCategoryQuestions[q.id] = prev.categoryQuestions[q.id];
            });
            const newSelectedTypes = { ...prev.selectedTypes };
            delete newSelectedTypes[quizId];
            const newCounts = { ...prev.counts };
            delete newCounts[quizId];
            const prevSelectedQuizzes = Array.isArray(prev.selectedQuizzes)
                ? prev.selectedQuizzes
                : [prev.selectedQuizzes].filter(Boolean);
            const filteredSelected = prevSelectedQuizzes.filter(id => id !== quizId);
            const nextQuizId = renumberedQuizList.length > 0 ? renumberedQuizList[0].id : undefined;
            const newSelectedQuizzes = filteredSelected.length > 0
                ? filteredSelected
                : nextQuizId
                    ? [nextQuizId]
                    : [];
            return {
                ...prev,
                quizList: renumberedQuizList,
                categoryQuestions: newCategoryQuestions,
                selectedQuizzes: newSelectedQuizzes,
                selectedCategory: prev.selectedCategory === quizId ? renumberedQuizList[0].id : prev.selectedCategory,
                selectedTypes: newSelectedTypes,
                counts: newCounts,
            };
        });
        setLoading(false);
    }, [state.quizList, state.categoryQuestions, selectedLesson, isSeatWork, nextQuizNumber, nextSeatworkNumber]);

    const setSelectedTypes = useCallback(
        (updater: (prev: Record<string, string[]>) => Record<string, string[]>) =>
            updateState(prev => ({
                selectedTypes: updater(prev.selectedTypes)
            })),
        [updateState]
    );

    const setCounts = useCallback(
        (updater: (prev: Record<string, Record<string, number>>) => Record<string, Record<string, number>>) =>
            updateState(prev => ({
                counts: updater(prev.counts)
            })),
        [updateState]
    );

    const setSelectedCategory = useCallback((categoryId: string) => {
        updateState({ selectedCategory: categoryId });
    }, [updateState]);

    const setSelectedType = useCallback((type: string) => {
        updateState({ selectedType: type });
    }, [updateState]);

    const setSelectedQuizzes = useCallback(
        (updater: ((prev: string[]) => string[]) | string[]) => {
            updateState(prev => ({
            selectedQuizzes:
                typeof updater === "function"
                ? updater(Array.isArray(prev.selectedQuizzes) ? prev.selectedQuizzes : [prev.selectedQuizzes].filter(Boolean))
                : updater,
            }));
        },
        [updateState]
    );

    // const setPercentage = useCallback((perc: Record<string, number>) => {
    //     updateState({ percentage: perc });
    // }, [updateState]);

    const setIsAiQuiz = useCallback((isAi: boolean) => {
        updateState({ isAiQuiz: isAi });
    }, [updateState]);

    const setIsRegister = useCallback((isReg: boolean) => {
        updateState({ isRegister: isReg });
    }, [updateState]);

    const setIsDeleteModalOpen = useCallback((isOpen: boolean) => {
        updateState({ isDeleteModalOpen: isOpen });
    }, [updateState]);

    const setIsPercentageModalOpen = useCallback((isOpen: boolean) => {
        updateState({ isPercentageModalOpen: isOpen });
    }, [updateState]);

    const questions = useMemo(() => 
        state.categoryQuestions[state.selectedCategory] || [], 
        [state.categoryQuestions, state.selectedCategory]
    );

    const setCategoryQuestions = useCallback(
        (updater: (prev: Record<string, any[]>) => Record<string, any[]>) =>
            updateState(prev => ({
                categoryQuestions: updater(prev.categoryQuestions)
            })),
        [updateState]
    );

    const setGeneratedQuestions = useCallback((qs: any[]) => {
        updateState({ generatedQuestions: qs });
    }, [updateState]);

    const setQuestions = useCallback((qs: any[]) => {
        setCategoryQuestions((prev) => ({
            ...prev,
            [state.selectedCategory]: qs,
        }));
    }, [state.selectedCategory, setCategoryQuestions]);

    // Basic handlers
    const handleQuestionChange = useCallback((idx: number, value: string) => {
        setQuestions(
            questions.map((q, i) => (i === idx ? { ...q, question: value } : q))
        );
    }, [questions, setQuestions]);

    const handleOptionChange = useCallback((qIdx: number, optIdx: number, value: string) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx
                ? {
                    ...q,
                    options: q.options.map((opt: string, oi: number) =>
                        oi === optIdx ? value : opt
                    ),
                    }
                : q
            )
        );
    }, [questions, setQuestions]);

    const handleAnswerChange = useCallback((qIdx: number, ansIdx: number) => {
        setQuestions(
            questions.map((q, i) => (i === qIdx ? { ...q, numAnswer: ansIdx } : q))
        );
    }, [questions, setQuestions]);

    const handleImageChange = useCallback((qIdx: number, file: File | null) => {
        if (!file) {
            setQuestions(
                questions.map((q, i) =>
                i === qIdx ? { ...q, image: null, imageFile: null } : q
                )
            );
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setQuestions(
                questions.map((q, i) =>
                i === qIdx ? { ...q, image: reader.result, imageFile: file } : q
                )
            );
        };
        reader.readAsDataURL(file);
    }, [questions, setQuestions]);

    // Question management
    const addQuestion = useCallback(() => {
        if (questions.length >= maxQuestions) return;
        setLoading(true);
        setQuestions([...questions, defaultQuestion(state.selectedType)]);
        setLoading(false);
    }, [questions, state.selectedType, setQuestions, maxQuestions]);

    const removeQuestion = useCallback((idx: number) => {
        setLoading(true);
        setQuestions(
            questions.length > 1 ? questions.filter((_, i) => i !== idx) : questions
        );
        setLoading(false);
    }, [questions, setQuestions]);

    // Multiple choice handlers
    const shuffleOptions = useCallback((qIdx: number) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx
                ? {
                    ...q,
                    shuffledOptions: shuffleArray(q.options),
                    }
                : q
            )
        );
    }, [questions, setQuestions]);

    // Identification handlers
    const generateLetterBank = useCallback((qIdx: number, correctAnswer: string) => {
        const letters = correctAnswer.toLowerCase().split('');
        const decoyLetters = ['a', 'e', 'i', 'o', 'u', 'n', 's', 't', 'r'];
        const extraLetters = decoyLetters.filter(l => !letters.includes(l)).slice(0, 3);
        const allLetters = [...letters, ...extraLetters];
        setQuestions(
            questions.map((q, i) =>
                i === qIdx
                ? {
                    ...q,
                    letterBank: shuffleArray(allLetters),
                    }
                : q
            )
        );
    }, [questions, setQuestions]);

    const handleIdentificationTextChange = useCallback((qIdx: number, value: string) => {
        setQuestions(
            questions.map((q, i) => (i === qIdx ? { ...q, answer: value } : q))
        );
    }, [questions, setQuestions]);

    // Enumeration handlers
    const handleEnumerationTextChange = useCallback((qIdx: number, ansIdx: number, value: string) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== qIdx) return q;
                const oldCategoryName = q.categories[ansIdx];
                const newCategories = q.categories.map((a: string, ai: number) =>
                    ai === ansIdx ? value : a
                );
                let newCorrectItems = { ...(q.correctItems || {}) };
                if (oldCategoryName && oldCategoryName !== value && newCorrectItems[oldCategoryName]) {
                    if (value && value.trim()) {
                        newCorrectItems[value.trim()] = newCorrectItems[oldCategoryName];
                    }
                    delete newCorrectItems[oldCategoryName];
                }
                return {
                    ...q,
                    categories: newCategories,
                    correctItems: newCorrectItems,
                };
            })
        );
    }, [questions, setQuestions]);

    const addEnumerationAnswer = useCallback((qIdx: number) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx ? { ...q, categories: [...q.categories, ""] } : q,
            ),
        );
    }, [questions, setQuestions]);

    const removeEnumerationAnswer = useCallback((qIdx: number, ansIdx: number) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx && q.categories.length > 1
                ? {
                    ...q,
                    categories: q.categories.filter(
                        (_: string, ai: number) => ai !== ansIdx,
                    ),
                    }
                : q,
            ),
        );
    }, [questions, setQuestions]);

    const addItemToBank = useCallback((qIdx: number, item: string, categoryIdx?: number) => {
        if (!item.trim()) return;
        const trimmedItem = item.trim();
        const currentQuestion = questions[qIdx];
        if (currentQuestion.itemBank?.some((existingItem: string) => 
            existingItem.toLowerCase() === trimmedItem.toLowerCase()
        )) {
            toast.error(
                <CustomToast
                    title="Duplicate Item!"
                    subtitle={`"${trimmedItem}" already exists in the item bank.`}
                />
            );
            return;
        }
        setQuestions(
            questions.map((q, i) => {
                if (i !== qIdx) return q;
                const newItemBank = [...(q.itemBank || []), trimmedItem];
                let newCorrectItems = { ...(q.correctItems || {}) };
                if (typeof categoryIdx === 'number' && q.categories[categoryIdx]) {
                    const categoryName = q.categories[categoryIdx];
                    if (!newCorrectItems[categoryName]) {
                        newCorrectItems[categoryName] = [];
                    }
                    newCorrectItems[categoryName] = [...newCorrectItems[categoryName], trimmedItem];
                }
                return {
                    ...q,
                    itemBank: newItemBank,
                    correctItems: newCorrectItems,
                };
            })
        );
    }, [questions, setQuestions]);

    const updateItemContent = useCallback((qIdx: number, categoryName: string, itemIdx: number, newValue: string, oldValue: string) => {
        const updatedQuestions = questions.map((question, i) => {
        if (i !== qIdx) return question;
        const newCorrectItems = { ...(question.correctItems || {}) };
        if (newCorrectItems[categoryName]) {
            if (newValue.trim() === '') {
                newCorrectItems[categoryName] = newCorrectItems[categoryName].filter(
                    (_: string, idx: number) => idx !== itemIdx
                );
            } else {
                newCorrectItems[categoryName] = newCorrectItems[categoryName].map(
                    (currentItem: string, idx: number) => idx === itemIdx ? newValue : currentItem
                );
            }
        }
        const oldItemBank = question.itemBank || [];
        const newItemBank = oldItemBank.map((bankItem: string) => 
            bankItem === oldValue ? newValue : bankItem
        );
        return { 
            ...question, 
            correctItems: newCorrectItems,
            itemBank: newItemBank
        };
        });
        
        setQuestions(updatedQuestions);
    }, [questions, setQuestions]);

    const setupEnumerationDragDrop = useCallback((qIdx: number) => {
        const q = questions[qIdx];
        const shuffledItems = q.itemBank ? shuffleArray([...q.itemBank]) : [];
        setQuestions(
            questions.map((question, i) =>
                i === qIdx
                ? {
                    ...question,
                    itemBank: shuffledItems,
                    }
                : question,
            ),
        );
    }, [questions, setQuestions]);

    const handleEnumerationDragEnd = useCallback((qIdx: number, result: any) => {
        if (!result.destination) return;
        const { source, destination } = result;
        const sourceIndex = parseInt(source.droppableId);
        const destIndex = parseInt(destination.droppableId);
        if (sourceIndex === destIndex && source.index === destination.index) return;
        const q = questions[qIdx];
        const sourceCategory = q.categories[sourceIndex];
        const destCategory = q.categories[destIndex];
        const sourceItems = q.correctItems?.[sourceCategory] || [];
        const itemToMove = sourceItems[source.index];
        if (!itemToMove) return;
        setQuestions(
            questions.map((question, i) => {
                if (i !== qIdx) return question;
                    const newCorrectItems = { ...(question.correctItems || {}) };
                if (sourceIndex === destIndex) {
                    const newItems = [...sourceItems];
                    newItems.splice(source.index, 1);
                    newItems.splice(destination.index, 0, itemToMove);
                    newCorrectItems[sourceCategory] = newItems;
                } else {
                    newCorrectItems[sourceCategory] = sourceItems.filter((_: string, idx: number) => idx !== source.index);
                    const destItems = [...(newCorrectItems[destCategory] || [])];
                    destItems.splice(destination.index, 0, itemToMove);
                    newCorrectItems[destCategory] = destItems;
                }
                return { ...question, correctItems: newCorrectItems };
            })
        );
    }, [questions, setQuestions]);

    const clearAllItems = useCallback((qIdx: number) => {
        setQuestions(
            questions.map((question, i) => 
                i === qIdx ? { ...question, correctItems: {}, itemBank: [] } : question
            )
        );
    }, [questions, setQuestions]);

    // Matching handlers
    const handleLeftItemChange = useCallback((qIdx: number, itemIdx: number, value: string) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx
                ? {
                    ...q,
                    leftItems: q.leftItems?.map((item: any, li: number) =>
                        li === itemIdx ? value : item,
                    ),
                    }
                : q,
            ),
        );
    }, [questions, setQuestions]);

    const handleRightItemChange = useCallback((qIdx: number, itemIdx: number, value: string) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx
                ? {
                    ...q,
                    rightItems: q.rightItems?.map((item: any, ri: number) =>
                        ri === itemIdx ? value : item,
                    ),
                    }
                : q,
            ),
        );
    }, [questions, setQuestions]);

    const handleMatchChange = useCallback((qIdx: number, leftIdx: number, rightIdx: number) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx
                ? {
                    ...q,
                    matches: q.matches?.map((match: any, mi: number) =>
                        mi === leftIdx ? rightIdx : match,
                    ),
                    }
                : q,
            ),
        );
    }, [questions, setQuestions]);

    const addMatchingPair = useCallback((qIdx: number) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx
                ? {
                    ...q,
                    leftItems: [...(q.leftItems || []), ""],
                    rightItems: [...(q.rightItems || []), ""],
                    matches: [...(q.matches || []), (q.rightItems?.length || 0)],
                    }
                : q,
            ),
        );
    }, [questions, setQuestions]);

    const removeMatchingPair = useCallback((qIdx: number, pairIdx: number) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx && (q.leftItems?.length || 0) > 1
                ? {
                    ...q,
                    leftItems: q.leftItems?.filter((_: any, li: number) => li !== pairIdx),
                    rightItems: q.rightItems?.filter((_: any, ri: number) => ri !== pairIdx),
                    matches: q.matches
                        ?.filter((_: any, mi: number) => mi !== pairIdx)
                        .map((match: number) => (match > pairIdx ? match - 1 : match)),
                    }
                : q,
            ),
        );
    }, [questions, setQuestions]);

    const handleShufflePreview = useCallback((qIdx: number) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx
                ? {
                    ...q,
                    shuffledRightItems: shuffleArray(q.rightItems || []),
                    }
                : q,
            ),
        );
    }, [questions, setQuestions]);

    // Syllable handlers
    const handleTargetWordChange = useCallback((qIdx: number, value: string) => {
        setQuestions(
            questions.map((q, i) =>
                i === qIdx
                ? {
                    ...q,
                    targetWord: value,
                    }
                : q,
            ),
        );
    }, [questions, setQuestions]);

    const handleSyllablePartChange = useCallback((qIdx: number, partIdx: number, value: string) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== qIdx) return q;
                const currentSyllables = q.syllableParts || [];
                const newSyllables = [...currentSyllables];
                
                while (newSyllables.length <= partIdx) {
                newSyllables.push("");
                }
                
                newSyllables[partIdx] = value;
                
                return {
                ...q,
                syllableParts: newSyllables,
                };
            }),
        );
    }, [questions, setQuestions]);

    const addSyllablePart = useCallback((qIdx: number) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== qIdx) return q;
                const currentSyllables = q.syllableParts || [];
                const newSyllables = [...currentSyllables, ""];
                
                return {
                ...q,
                syllableParts: newSyllables,
                };
            }),
        );
    }, [questions, setQuestions]);

    const removeSyllablePart = useCallback((qIdx: number, partIdx: number) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== qIdx) return q;
                const currentSyllables = q.syllableParts || [];
                if (currentSyllables.length <= 1) return q;
                
                const newSyllables = currentSyllables.filter((_: any, pi: number) => pi !== partIdx);
                
                return {
                ...q,
                syllableParts: newSyllables,
                };
            }),
        );
    }, [questions, setQuestions]);

    const autoGenerateSyllables = useCallback((qIdx: number, word: string) => {
        const originalWord = word.trim();
        if (!originalWord || originalWord.includes(' ') || !/^[a-zA-ZÀ-ÿ\u00f1\u00d1\-]+$/.test(originalWord)) return;
        let syllables: string[];
        if (originalWord.includes('-')) {
            const parts = originalWord.split('-');
            syllables = [];
            parts.forEach((part, index) => {
                if (part) {
                    const partSyllables = splitIntoSyllables(part);
                    syllables.push(...partSyllables);
                    if (index < parts.length - 1) {
                        syllables[syllables.length - 1] += '-';
                    }
                }
            });
        } else {
            syllables = splitIntoSyllables(originalWord);
        }
        setQuestions(
            questions.map((q, i) => {
                if (i !== qIdx) return q;
                return {
                ...q,
                syllableParts: syllables.length > 0 ? syllables : [""],
                };
            }),
        );
    }, [questions, setQuestions]);

    const getNonEmptyCount = useCallback((questions: any[]) =>
        questions.filter(q => {
            if (q.type === "multiple") {
                return (
                    q.question && q.question.trim() &&
                    Array.isArray(q.options) &&
                    q.options.length === 4 &&
                    q.options.every((opt: string) => opt && opt.trim())
                );
            }
            if (q.type === "identification") {
                return q.answer && q.answer.trim();
            }
            if (q.type === "enumeration") {
                const categories = Array.isArray(q.categories) ? q.categories.filter((c: string) => c && c.trim()) : [];
                const correctItems = q.correctItems || {};
                if (categories.length < 2) return false;
                return !categories.some((cat: string) =>
                    !Array.isArray(correctItems[cat]) ||
                    correctItems[cat].length === 0 ||
                    correctItems[cat].every((item: string) => !item || !item.trim())
                );
            }
            if (q.type === "matching") {
                return (
                    Array.isArray(q.leftItems) && q.leftItems.some((item: string) => item && item.trim()) &&
                    Array.isArray(q.rightItems) && q.rightItems.some((item: string) => item && item.trim())
                );
            }
            if (q.type === "syllable") {
                return (
                    q.targetWord && q.targetWord.trim() &&
                    Array.isArray(q.syllableParts) &&
                    q.syllableParts.some((part: string) => part && part.trim())
                );
            }
            return q.question && q.question.trim();
        }).length
    , [questions]);

    const getExistingNonEmptyCount = useCallback((quizIds: string[]) => {
        return quizIds.reduce((sum, quizId) => {
            const questions = state.categoryQuestions[quizId] || [];
            return sum + getNonEmptyCount(questions);
        }, 0);
    }, [state.categoryQuestions, getNonEmptyCount]);

    const getTotalItems = useCallback((quizId?: string) => {
        if (quizId) {
            const questions = state.categoryQuestions[quizId] || [];
            return getNonEmptyCount(questions);
        }
        return Object.values(state.categoryQuestions).reduce((total, qs) => total + getNonEmptyCount(qs), 0);
    }, [state.categoryQuestions, getNonEmptyCount]);

    const getMaxItems = useCallback(() => maxQuestions, [maxQuestions]);

    const generatePromptForType = (type: string, category: string, gradeLevel: string, count: number): string => {
        const basePrompt = `Gamit ang PDF na ito bilang inspirasyon, gumawa ng ${count} BAGONG ${type} na tanong para sa ${category} na angkop sa ${gradeLevel}. `;
        let prompt = "";
        switch (type) {
            case "multiple":
                prompt = basePrompt + `
                    Gumawa ng multiple choice questions na may:
                    - Malinaw na tanong (question)
                    - 4 na pagpipilian (options array)
                    - Tamang sagot (answer - index ng tamang sagot, 0-3)
                    
                    Halimbawa:
                    {
                        "type": "multiple",
                        "question": "Ano ang pangunahing tauhan sa kwento?",
                        "options": ["Juan", "Maria", "Pedro", "Ana"],
                        "numAnswer": 0,
                        "isCopied": false
                    }

                    IMPORTANTE:
                    - Siguraduhing ang mga tanong ay tungkol sa comprehension, vocabulary, o mga konsepto sa aralin.
                    - Gumawa ng mahirap na distractors para sa options
                    - Iwas sa obvious answers
                `;
                break;
            case "identification":
                prompt = basePrompt + `
                    Gumawa ng identification questions na may:
                    - Tanong na humihingi ng isang salitang sagot (question)
                    - Isang tamang sagot na salita (answers array - isang salita lang, hanggang 10 letra/characters lang)
                    
                    Halimbawa:
                    {
                        "type": "identification",
                        "question": "Ano ang tawag sa lugar kung saan nakatira ang pamilya?",
                        "answer": "BAHAY",
                        "isCopied": false
                    }
                    
                    IMPORTANTE:
                    - Gumawa ng mga tanong na ang sagot ay isang salitang Pilipino.
                    - Iwas sa mga salitang may special characters, numbers, o spaces.
                    - Siguraduhing ang sagot ay madaling hulaan base sa tanong.
                    - Mga tanong tungkol sa mga tao, lugar, bagay, o konsepto sa aralin.
                    - Ang sagot ay dapat na common words na kilala ng mga bata
                    - Ang sagot ay dapat hanggang 10 letra/characters lang
                `;
                break;
            case "enumeration":
                prompt = basePrompt + `
                    Gumawa ng enumeration/categorization exercises na may:
                    - Instruction o tanong (question)
                    - Mga kategorya (categories array - 2-3 categories)
                    - Mga items para sa bawat category (categoryItems array - array of arrays)
                    
                    IMPORTANTE: 
                    - categories[0] corresponds to categoryItems[0]
                    - categories[1] corresponds to categoryItems[1]
                    - categories[2] corresponds to categoryItems[2], etc.

                    Halimbawa:
                    {
                        "type": "enumeration",
                        "question": "Paghiwalayin ang mga hayop ayon sa kanilang tirahan:",
                        "categories": ["Hayop sa Lupa", "Hayop sa Tubig"],
                        "categoryItems": [
                            ["aso", "pusa", "kabayo", "manok"],
                            ["isda", "hipon", "pusit", "alimango"]
                        ],
                        "isCopied": false
                    }
                    Meaning:
                    - "Hayop sa Lupa" (categories[0]) contains ["aso", "pusa", "kabayo", "manok"] (categoryItems[0])
                    - "Hayop sa Tubig" (categories[1]) contains ["isda", "hipon", "pusit", "alimango"] (categoryItems[1])
                    
                    IMPORTANTE:
                    - Gumawa ng 2-3 categories na may kaugnayan sa aralin
                    - Bawat category ay dapat may 2-4 items
                    - Categories ay dapat clear at distinct
                    - categoryItems array length MUST equal categories array length
                    - categoryItems[index] always belongs to categories[index]
                    - NO overlapping items between categories
                `;
                break;
            case "matching":
                prompt = basePrompt + `
                    Gumawa ng matching type questions na may:
                    - Instruction (question)
                    - Left column items (leftItems array - 3-4 items, **isang salita lang bawat item**)
                    - Right column items (rightItems array - same number as left, **isang salita lang bawat item**)  
                    - Correct matches (matches array - indices na tumutugma sa rightItems)
                    
                    Halimbawa:
                    {
                        "type": "matching",
                        "question": "Itugma ang salita sa kahulugan:",
                        "leftItems": ["bahay", "puno", "araw"],
                        "rightItems": ["tahanan", "halaman", "bituin"],
                        "matches": [0, 1, 2],
                        "isCopied": false
                    }
                    
                    IMPORTANTE:
                    - Gumawa ng matching na may kaugnayan sa vocabulary o concepts sa aralin.
                    - Gumawa ng 3-4 pairs na may logical connection
                    - Left items ay mga tanong/items na need ng match (**isang salita lang bawat item**)
                    - Right items ay mga sagot/matches (**isang salita lang bawat item**)
                    - Matches array: leftItems[0] matches rightItems[matches[0]]
                    - Iwas sa obvious connections, make it challenging
                `;
                break;
            case "syllable":
                prompt = basePrompt + `
                    Gumawa ng syllable splitting exercises na may:
                    - Instruction (question)
                    - Target word (targetWord string)
                    - Syllable parts (syllableParts array - comma-separated syllables per word)
                    
                    Halimbawa:
                    {
                        "type": "syllable",
                        "question": "Ito ay isang lugar kung saan tayo nakatira.",
                        "targetWord": "bahay",
                        "syllableParts": ["ba", "hay"],
                        "isCopied": false
                    }
                    
                    IMPORTANTE:
                    - Piliin ang mga salitang Filipino na angkop sa grade level
                    - Clear syllable divisions na sunod sa Filipino phonetics
                    - Syllables ay comma-separated sa array
                    - Target word ay dapat familiar sa mga bata
                    - Iwas sa mga salitang may dashes o special characters
                `;
                break;
            default:
                prompt = basePrompt + "Gumawa ng mga tanong na angkop sa aralin.";
        }
        prompt += `
            IMPORTANT:
            - For each generated question, add a field "isCopied": true if copied verbatim from the PDF, false if original.
            - At the end, add a field "percentage": percentage of questions that are original (not copied).
        `;
        return prompt;
    };

    const handleGenerateQuiz = useCallback(
        async function ({
        selectedQuizzes, selectedTypes, counts,
    }: {
        selectedQuizzes: string[];
        selectedTypes: Record<string, string[]>;
        counts: Record<string, Record<string, number>>;
    }) {
        if (!selectedQuizzes.length || Object.values(selectedTypes).every(arr => !arr.length)) {
            toast.error(
                <CustomToast
                    title="Selection Required"
                    subtitle="Please select at least one quiz and one type." 
                />
            );
            return;
        }
        if (!selectedYunit?.id || !selectedLesson?.id) {
            toast.error(
                <CustomToast
                    title="No Lesson Selected"
                    subtitle="Please select a lesson first." 
                />
            );
            return;
        }
        const invalidQuiz = selectedQuizzes.find(quizId => {
            const quizCounts = counts[quizId] || {};
            const quizTypes = selectedTypes[quizId] || [];
            const missingCount = quizTypes.some(type => !quizCounts[type] || quizCounts[type] < 1);
            const quizTotal = quizTypes.reduce((sum, type) => sum + (quizCounts[type] || 0), 0);
            const currentCount = getNonEmptyCount(state.categoryQuestions[quizId] || []);
            if (quizTypes.length === 0) {
                const quizName = state.quizList.find(q => q.id === quizId)?.name || "Quiz";
                toast.error(
                    <CustomToast
                        title="Type Required"
                        subtitle={`Please select at least one type for ${quizName}.`}
                    />
                );
                return true;
            }
            if (missingCount || quizTotal === 0) {
                const quizName = state.quizList.find(q => q.id === quizId)?.name || "Quiz";
                toast.error(
                    <CustomToast
                        title="Invalid Count"
                        subtitle={`Please enter at least 1 question for ${quizName}.`}
                    />
                );
                return true;
            }
            if (quizTotal + currentCount > maxQuestions) {
                const quizName = state.quizList.find(q => q.id === quizId)?.name || "Quiz";
                toast.error(
                    <CustomToast
                        title="Too Many Questions"
                        subtitle={`"${quizName}" already has ${currentCount} questions. Max is ${maxQuestions}.`}
                    />
                );
                return true;
            }
            return false;
        });
        if (invalidQuiz) return;
        setIsRegister(true);
        setLoading(true);
        try {
            const urls = selectedLesson?.fileUrls;
            const files = await Promise.all(
                urls.map((url: string) => {
                    const filename = getPdfFileName(url);
                    const mimeType = "application/pdf";
                    return urlToFile(url, filename, mimeType);
                })
            );
            const pdfParts = await Promise.all(files.map(fileToGenerativePart));
            const requests: any = [];
            selectedQuizzes.forEach((quizId) => {
                const quizName = state.quizList.find(q => q.id === quizId)?.name || "";
                const quizTypes = selectedTypes[quizId] || [];
                quizTypes.forEach((type) => {
                    const count = Number(counts[quizId]?.[type]);
                    if (!count || count < 1) return;
                    const prompt = generatePromptForType(type, quizName, selectedClass.gradeLevel, count);
                    requests.push({
                        quizId,
                        type,
                        promise: model.generateContent([prompt, ...pdfParts]),
                    });
                });
            });
            const results = await Promise.all(requests.map((r: any) => r.promise));
            let percentage: Record<string, number> = {};
            setCategoryQuestions(prev => {
                const mergedCategoryQuestions: Record<string, any[]> = { ...prev };
                const quizTypeSummary: Record<string, { [type: string]: number; }> = {};
                results.forEach((result, idx) => {
                    const { quizId, type } = requests[idx];
                    const response = result.response;
                    const data = response.text();
                    let parsedData;
                    try {
                        parsedData = JSON.parse(data);
                    } catch {
                        toast.error(
                            <CustomToast
                                title="Generation Failed"
                                subtitle="AI response could not be parsed." />
                        );
                        return;
                    }
                    if (typeof parsedData.percentage === "number") {
                        percentage[quizId] = parsedData.percentage;
                    }
                    if (parsedData.quizzes && Array.isArray(parsedData.quizzes)) {
                        const generatedQuestions = parsedData.quizzes.map((quiz: any) => {
                            const baseQuestion = {
                                ...defaultQuestion(type),
                                ...quiz,
                                type,
                                id: crypto.randomUUID(),
                            };
                            if (type === "enumeration" && quiz.categories && quiz.categoryItems) {
                                const correctItems: Record<string, string[]> = {};
                                const allItems: string[] = [];
                                quiz.categories.forEach((category: string, index: number) => {
                                    if (quiz.categoryItems[index]) {
                                        correctItems[category] = quiz.categoryItems[index];
                                        allItems.push(...quiz.categoryItems[index]);
                                    } else {
                                        correctItems[category] = [];
                                    }
                                });
                                return {
                                    ...baseQuestion,
                                    answers: quiz.categories,
                                    correctItems: correctItems,
                                    itemBank: allItems,
                                };
                            }
                            return baseQuestion;
                        });
                        const existingQuestions = mergedCategoryQuestions[quizId] || [];
                        const filteredQuestions = filterEmptyQuestions(existingQuestions, getNonEmptyCount);
                        mergedCategoryQuestions[quizId] = [
                            ...filteredQuestions,
                            ...generatedQuestions,
                        ];
                        if (!quizTypeSummary[quizId]) quizTypeSummary[quizId] = {};
                        quizTypeSummary[quizId][type] = generatedQuestions.length;
                    } else {
                        toast.error(
                            <CustomToast
                                title="Generation Failed"
                                subtitle="Invalid response format." />
                        );
                    }
                });
                Object.entries(quizTypeSummary).forEach(([quizId, typeCounts]) => {
                    const quizName = state.quizList.find(q => q.id === quizId)?.name || "Quiz";
                    const summary = Object.entries(typeCounts)
                        .map(([type, count]) => `${count} ${type}`)
                        .join(", ");
                    toast.success(
                        <CustomToast
                            title="Quiz Generated!"
                            subtitle={`Added ${summary} questions to ${quizName}.`} />
                    );
                });
                // setPercentage(percentage);
                return mergedCategoryQuestions;
            });
        } catch (error) {
            toast.error(
                <CustomToast
                    title="Generation Failed"
                    subtitle="Failed to generate quiz questions. Please try again." />
            );
        } finally {
            setIsRegister(false);
            setIsAiQuiz(false);
            // setIsPercentageModalOpen(true);
            setLoading(false);
        }
    }, [selectedYunit, selectedLesson, selectedClass, updateState, setCategoryQuestions, state.quizList, maxQuestions]);

    const handleSubmitQuiz = useCallback(async () => {
        const hasInvalid = Object.values(state.categoryQuestions).some((qs) => {
            return getNonEmptyCount(qs) !== qs.length;
        });
        if (hasInvalid) {
            toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle="Please make sure every question in every category has valid content before submitting."
                />,
            );
            return;
        }
        if (!state.isRegister) {
            setIsRegister(true);
            setLoading(true);
            try {
                let allSuccess = true;
                const quizPromises = state.quizList.map(async (quiz) => {
                    let qs = state.categoryQuestions[quiz.id];
                    // Compress and upload images for each question
                    qs = await processQuestionImages(qs);
                    // Convert to Firestore format
                    const firestoreQuestions = toFirestoreQuestions(qs);
                    // Submit to backend
                    const response = await doCreateSeatworkorQuiz(
                        currentUser?.uid || "",
                        selectedClass.id,
                        selectedYunit.id,
                        selectedYunit.yunitnumber,
                        selectedLesson.aralinNumero,
                        selectedLesson.id,
                        selectedClass.gradeLevel,
                        firestoreQuestions,
                        quiz.name,
                        isSeatWork ? "seatwork" : "quiz",
                    ) as any;
                    if (!response?.success) allSuccess = false;
                });
                await Promise.all(quizPromises);
                if (allSuccess) {
                    toast.success(
                        <CustomToast
                        title={isSeatWork ? "Seatwork Created!" : "Quiz Created!"}
                        subtitle={`Your ${isSeatWork ? "seatwork" : "quiz"} has been successfully created.`}
                        />,
                    );
                    setIsRegister(false);
                    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons`);
                } else {
                    toast.error(
                        <CustomToast
                        title="Error!"
                        subtitle={`Failed to create ${isSeatWork ? "seatwork" : "quiz"}. Please try again.`}
                        />,
                    );
                    setIsRegister(false);
                }
            } catch (error) {
                toast.error(
                    <CustomToast
                        title="Error!"
                        subtitle={`An unexpected error occurred while creating the ${isSeatWork ? "seatwork" : "quiz"}.`}
                    />,
                );
                setIsRegister(false);
            } finally {
                setIsRegister(false);
                setLoading(false);
            }
        }
    }, [state.categoryQuestions, getNonEmptyCount, currentUser, isSeatWork, updateState, navigate, state.quizList, role, selectedClass, selectedLesson, selectedYunit]);

    return {
        state,
        updateState,
        generatedQuestions: state.generatedQuestions,
        percentage: state.percentage,
        isPercentageModalOpen: state.isPercentageModalOpen,
        isDeleteModalOpen: state.isDeleteModalOpen,
        quizList: state.quizList,
        categoryQuestions: state.categoryQuestions,
        selectedCategory: state.selectedCategory,
        selectedType: state.selectedType,
        selectedQuizzes: state.selectedQuizzes,
        selectedTypes: state.selectedTypes,
        counts: state.counts,
        isRegister: state.isRegister,
        isAiQuiz: state.isAiQuiz,
        typeValue: state.typeValue,
        setIsAiQuiz,
        setSelectedCategory,
        setGeneratedQuestions,
        setSelectedType,
        setSelectedQuizzes,
        setSelectedTypes,
        setCounts,
        setCategoryQuestions,
        setIsDeleteModalOpen,
        setIsPercentageModalOpen,
        addQuiz,
        removeQuiz,
        questions,
        setQuestions,
        nextQuizNumber,
        nextSeatworkNumber,
        maxQuestions,
        getNonEmptyCount,
        getExistingNonEmptyCount,
        // Basic handlers
        handleQuestionChange,
        handleOptionChange,
        handleAnswerChange,
        handleImageChange,
        addQuestion,
        removeQuestion,
        
        // Multiple choice
        shuffleOptions,
        
        // Identification
        generateLetterBank,
        handleIdentificationTextChange,
        
        // Enumeration
        handleEnumerationTextChange,
        addEnumerationAnswer,
        removeEnumerationAnswer,
        addItemToBank,
        updateItemContent,
        setupEnumerationDragDrop,
        handleEnumerationDragEnd,
        clearAllItems,
        
        // Matching
        handleLeftItemChange,
        handleRightItemChange,
        handleMatchChange,
        addMatchingPair,
        removeMatchingPair,
        handleShufflePreview,
        
        // Syllable
        handleTargetWordChange,
        handleSyllablePartChange,
        addSyllablePart,
        removeSyllablePart,
        autoGenerateSyllables,
        
        // Utilities
        getTotalItems,
        getMaxItems,
        handleGenerateQuiz,
        handleSubmitQuiz,
    };
};