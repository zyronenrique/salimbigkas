import { useCallback, useEffect, useMemo, useState } from "react";
import { areAllItemsPlaced, combineUserAnswerWithClues, getUserOnlyLetters, isAllFilled, shuffleArray } from "../utils/helpers";

interface SeatworkQuizLogicProps {
  currentQuestion: any;
  answers: any;
  setAnswers: (updater: any) => void;
  isAnswered: boolean;
  onAnswer: (answers: any) => void;
}

export function useSeatworkQuizLogic({
  currentQuestion,
  answers,
  setAnswers,
  isAnswered,
  onAnswer,
}: SeatworkQuizLogicProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedEnumerationItem, setSelectedEnumerationItem] = useState<string | null>(null);
  const handleEnumerationItemTap = useCallback((item: string) => {
    setSelectedEnumerationItem(item);
  }, []);
  const qId = currentQuestion?.id;

  const cluePositions = useMemo(() => {
    return answers?.[`${qId}-cluePositions`] || answers?.[`${qId}-syllableCluePositions`] || [];
  }, [answers, qId]);

  // MultipleChoice Items
  const availableOptions = useMemo(() => (
    (currentQuestion?.options || [])
      .map((opt: string, optIdx: number) => ({ opt, optIdx }))
      .filter(({ optIdx }: { optIdx: number }) => answers[qId] !== optIdx)
  ), [currentQuestion?.options, answers, qId]);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    if (isAnswered) return;
    if (answers[qId] === optionIndex) return;
    const updatedAnswers = { ...answers, [qId]: optionIndex };
    setAnswers(updatedAnswers);
    onAnswer(updatedAnswers);
  }, [qId, setAnswers, isAnswered, onAnswer, answers]);

  // Identification Items
  const letterBank = useMemo(() => {
    if (currentQuestion?.letterBank?.length > 0) {
      return currentQuestion.letterBank;
    } else if (currentQuestion?.answer) {
      const answer = currentQuestion.answer;
      const letters = answer.split('');
      const decoyLetters = ['a', 'e', 'i', 'o', 'u', 'n', 's', 't', 'r', 'l', 'm'];
      const availableLetters = letters.filter((_: any, index: number) => !cluePositions.includes(index));
      const uniqueDecoys = decoyLetters.filter(l => !letters.includes(l.toLowerCase()) && !letters.includes(l.toUpperCase()));
      let numDecoys = availableLetters.length <= 2 ? 2 : availableLetters.length <= 4 ? 3 : Math.min(4, Math.floor(availableLetters.length * 0.6));
      const extraLetters = uniqueDecoys.slice(0, numDecoys);
      return shuffleArray([...availableLetters, ...extraLetters]);
    }
    return [];
  }, [currentQuestion?.answer, currentQuestion?.letterBank, cluePositions]);

  const availableLetters = useMemo(() => (
    letterBank
      .map((letter: string, letterIdx: number) => ({ letter, letterIdx }))
      .filter(({ letterIdx }: { letterIdx: number }) => !(answers[`${qId}-slots`] || []).includes(letterIdx))
  ), [letterBank, answers, qId]);

  const handleLetterPlace = useCallback((slotIndex: number, letterIndex: number) => {
    if (isAnswered || cluePositions.includes(slotIndex)) return;
    const currentSlots = answers[`${qId}-slots`] || new Array(currentQuestion.answer?.length || 0).fill(null);
    const newSlots = [...currentSlots];
    const currentPosition = newSlots.indexOf(letterIndex);
    const targetSlotContent = newSlots[slotIndex];
    if (currentPosition !== -1) {
      newSlots[currentPosition] = null;
    }
    if (targetSlotContent !== null && currentPosition !== -1) {
      newSlots[currentPosition] = targetSlotContent;
    }
    newSlots[slotIndex] = letterIndex;
    const userOnlyLetters = getUserOnlyLetters(newSlots, letterBank, cluePositions);
    const updatedAnswers = {
      ...answers,
      [`${qId}-slots`]: newSlots,
      [qId]: userOnlyLetters
    };
    setAnswers(updatedAnswers);
    if (isAllFilled(newSlots, cluePositions)) {
      onAnswer(updatedAnswers);
    }
  }, [qId, letterBank, currentQuestion, cluePositions, setAnswers, isAnswered, answers, onAnswer]);

  const handleSlotTap = useCallback((slotIdx: number) => {
    if (isAnswered || cluePositions.includes(slotIdx)) return;
    const currentSlots = answers[`${qId}-slots`] || [];
    if (currentSlots[slotIdx]) {
      const newSlots = [...currentSlots];
      newSlots[slotIdx] = null;
      const userOnlyLetters = getUserOnlyLetters(newSlots, letterBank, cluePositions);
      const updatedAnswers = {
        ...answers,
        [`${qId}-slots`]: newSlots,
        [qId]: userOnlyLetters
      };
      setAnswers(updatedAnswers);
    }
  }, [isAnswered, cluePositions, answers, qId, letterBank, setAnswers]);

  const getSlotStyle = useCallback((slotIdx: number, hasLetter: boolean) => {
    if (isAnswered) {
        const userInput = answers[qId] || '';
        const combinedAnswer = combineUserAnswerWithClues(userInput, currentQuestion.answer, cluePositions);
        const isCorrectPosition = combinedAnswer[slotIdx]?.toLowerCase() === currentQuestion.answer[slotIdx]?.toLowerCase();
        if (cluePositions.includes(slotIdx)) {
            return { borderColor: '#facc15', backgroundColor: '#fef3c7' };
        } else if (isCorrectPosition) {
            return { borderColor: '#4ade80', backgroundColor: '#dcfce7' };
        } else {
            return { borderColor: '#f87171', backgroundColor: '#fee2e2' };
        }
    }
    return hasLetter ? { borderColor: '#fb923c', backgroundColor: 'rgba(255,255,255,0.3)' } : { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.2)' };
  }, [isAnswered, answers, qId, currentQuestion.answer, cluePositions]);

  // Enumeration Items
  const itemBank = useMemo(() => {
    if (!currentQuestion?.correctItems) return [];
    const allItems: string[] = [];
    Object.values(currentQuestion.correctItems).forEach((items: any) => {
      if (Array.isArray(items)) allItems.push(...items);
    });
    return shuffleArray(allItems);
  }, [currentQuestion?.correctItems]);

  const availableEnumerationItems = useMemo(() => {
    const boxesObj = answers[`${qId}-boxes`] || {};
    const boxArrays = Object.values(boxesObj);
    return itemBank.filter((item: string) =>
      !boxArrays.some((box) => Array.isArray(box) && box.includes(item))
    );
  }, [itemBank, answers, qId]);

  const handleEnumerationItemDrop = useCallback((categoryIndex: number, item: string) => {
    if (isAnswered) return;
    let newBoxes: { [catIdx: string]: string[] } = { ...(answers[`${qId}-boxes`] || {}) };
    Object.keys(newBoxes).forEach((catIdx) => {
      newBoxes[catIdx] = newBoxes[catIdx].filter(boxItem => boxItem !== item);
    });
    if (!newBoxes[categoryIndex]) newBoxes[categoryIndex] = [];
    if (!newBoxes[categoryIndex].includes(item)) {
      newBoxes[categoryIndex].push(item);
    }
    const boxAnswers = Object.keys(newBoxes).reduce((acc: any, idx: string) => {
      acc[`${qId}-${idx}`] = newBoxes[idx].join(', ');
      return acc;
    }, {});
    const updatedAnswers = {
      ...answers,
      [`${qId}-boxes`]: newBoxes,
      ...boxAnswers
    };
    setAnswers(updatedAnswers);
    const allCategoriesFilled = (currentQuestion?.categories || []).every((_: any, idx: number) => newBoxes[idx] && newBoxes[idx].length > 0);
    const allItemsPlaced = areAllItemsPlaced(itemBank, Object.values(newBoxes));
    if (allCategoriesFilled && allItemsPlaced) {
      onAnswer(updatedAnswers);
    }
  }, [qId, setAnswers, isAnswered, currentQuestion?.categories, answers, itemBank, onAnswer]);

  const handleEnumerationItemRemove = useCallback((categoryIndex: number, item: string) => {
    if (isAnswered) return;
    let newBoxes: { [catIdx: string]: string[] } = { ...(answers[`${qId}-boxes`] || {}) };
    if (newBoxes[categoryIndex]) {
      newBoxes[categoryIndex] = newBoxes[categoryIndex].filter(boxItem => boxItem !== item);
    }
    const boxAnswers = Object.keys(newBoxes).reduce((acc: any, idx: string) => {
      acc[`${qId}-${idx}`] = newBoxes[idx].join(', ');
      return acc;
    }, {});
    const updatedAnswers = {
      ...answers,
      [`${qId}-boxes`]: newBoxes,
      ...boxAnswers
    };
    setAnswers(updatedAnswers);
  }, [qId, setAnswers, isAnswered, answers]);

  const getItemStyle = useCallback((item: string, catIdx: number) => {
    if (!isAnswered) {
      return { backgroundColor: '#dcfce7', borderColor: '#4ade80', color: '#15803d' };
    }
    const correctItems = currentQuestion.correctItems[currentQuestion.categories[catIdx]] || [];
    const isCorrectlyPlaced = correctItems.includes(item);
    return isCorrectlyPlaced 
      ? { backgroundColor: '#bbf7d0', borderColor: '#16a34a', color: '#15803d' }
      : { backgroundColor: '#fecaca', borderColor: '#dc2626', color: '#991b1b' };
  }, [isAnswered, currentQuestion.correctItems, currentQuestion.categories]);
  
  const getCategoryStyle = useCallback((catIdx: number) => {
    if (!isAnswered) {
      return { backgroundColor: '#003311', borderColor: '#8a3903' };
    }
    const userItems = answers[`${qId}-boxes`]?.[catIdx] || [];
    const correctItems = currentQuestion.correctItems[currentQuestion.categories[catIdx]] || [];
    const allCorrect = userItems.length === correctItems.length && 
      userItems.every((item: string) => correctItems.includes(item));
    return allCorrect 
      ? { backgroundColor: '#bbf7d0', borderColor: '#16a34a' }
      : { backgroundColor: '#fecaca', borderColor: '#dc2626' };
  }, [isAnswered, answers, qId, currentQuestion.correctItems, currentQuestion.categories]);

  useEffect(() => {
    if (selectedEnumerationItem) {
      setShowCategoryModal(true);
    }
  }, [selectedEnumerationItem]);

  // Handle category selection from modal
  const handleCategorySelect = useCallback((categoryIndex: number) => {
    if (selectedEnumerationItem) {
      handleEnumerationItemDrop(categoryIndex, selectedEnumerationItem);
      setSelectedEnumerationItem(null);
      setShowCategoryModal(false);
    }
  }, [selectedEnumerationItem, handleEnumerationItemDrop]);

  const handleModalCancel = useCallback(() => {
    setSelectedEnumerationItem(null);
    setShowCategoryModal(false);
  }, [setSelectedEnumerationItem, setShowCategoryModal]);

  // Matching Items
  const availableMatchingItems = useMemo(() => (
    (currentQuestion?.rightItems || [])
      .map((item: string, rightIdx: number) => ({ item, rightIdx }))
      .filter(({ rightIdx }: { rightIdx: number }) => !(answers[qId] || []).includes(rightIdx))
  ), [currentQuestion?.rightItems, answers, qId]);

  const handleMatchingItemMatch = useCallback((leftIndex: number, rightIndex: number) => {
    if (isAnswered) return;
    const currentMatches = answers[qId] || Array(currentQuestion?.leftItems?.length || 0).fill(null);
    let newMatches = [...currentMatches];
    const prevPosition = newMatches.indexOf(rightIndex);
    if (prevPosition !== -1) newMatches[prevPosition] = null;
    newMatches[leftIndex] = rightIndex;
    const updatedAnswers = {
      ...answers,
      [qId]: newMatches
    };
    setAnswers(updatedAnswers);
    if (newMatches.every((match: any) => match !== null)) {
      onAnswer(updatedAnswers);
    }
  }, [qId, answers, setAnswers, isAnswered, currentQuestion, onAnswer]);

  const handleMatchingItemRemove = useCallback((leftIndex: number) => {
    if (isAnswered) return;
    const currentMatches = answers[qId] || Array(currentQuestion?.leftItems?.length || 0).fill(null);
    let newMatches = [...currentMatches];
    newMatches[leftIndex] = null;
    const updatedAnswers = {
      ...answers,
      [qId]: newMatches
    };
    setAnswers(updatedAnswers);
  }, [qId, answers, setAnswers, isAnswered, currentQuestion]);

  const handleMatchingItemSwap = useCallback((leftIdxA: number, leftIdxB: number) => {
    if (isAnswered) return;
    const currentMatches = answers[qId] || Array(currentQuestion?.leftItems?.length || 0).fill(null);
    let newMatches = [...currentMatches];
    const temp = newMatches[leftIdxA];
    newMatches[leftIdxA] = newMatches[leftIdxB];
    newMatches[leftIdxB] = temp;
    const updatedAnswers = {
      ...answers,
      [qId]: newMatches
    };
    setAnswers(updatedAnswers);
  }, [qId, answers, setAnswers, isAnswered, currentQuestion]);

  const getMatchStyle = useCallback((leftIdx: number, rightIdx: number) => {
    if (!isAnswered) {
      return { backgroundColor: '#dcfce7', borderColor: '#4ade80', textColor: '#15803d' };
    }
    const correctMatches = currentQuestion.matches || [];
    const isCorrectMatch = correctMatches[leftIdx] === rightIdx;
    return isCorrectMatch 
      ? { backgroundColor: '#bbf7d0', borderColor: '#16a34a', textColor: '#15803d' }
      : { backgroundColor: '#fecaca', borderColor: '#dc2626', textColor: '#991b1b' };
  }, [isAnswered, currentQuestion.matches]);

  // Syllables Items
  const shuffledSyllableIndexes: number[] = useMemo(() => {
    if (!currentQuestion.syllableParts) return [];
    const allIndexes: number[] = currentQuestion.syllableParts.map((_: any, index: number) => index);
    return shuffleArray<number>(allIndexes);
  }, [currentQuestion.syllableParts]);

  const handleSyllableRemove = useCallback((orderIndex: number) => {
    if (isAnswered) return;
    const currentOrder = answers[`${qId}-0`] || [];
    const newOrder = currentOrder.filter((_: number, idx: number) => idx !== orderIndex);
    const updatedAnswers = {
      ...answers,
      [`${qId}-0`]: newOrder
    };
    setAnswers(updatedAnswers);
  }, [qId, answers, setAnswers, isAnswered]);

  const handleSyllableReorder = useCallback((newOrder: number[]) => {
    if (isAnswered) return;
    const updatedAnswers = {
      ...answers,
      [`${qId}-0`]: newOrder
    };
    setAnswers(updatedAnswers);
    if (newOrder.length === currentQuestion?.syllableParts.length) {
      onAnswer(updatedAnswers);
    }
  }, [qId, answers, setAnswers, isAnswered, currentQuestion?.syllableParts, onAnswer]);

  const getSyllableStyle = useCallback((syllableIdx: number, isInAnswer: boolean) => {
    if (!isAnswered) {
      const isClue = cluePositions.includes(syllableIdx);
      return isClue 
        ? { backgroundColor: '#fef3c7', textColor: '#a16207', borderColor: '#eab308' }
        : { backgroundColor: '#2C3E50', textColor: '#FFF9C4', borderColor: '#2C3E50' };
    }
    const userSyllableOrder = answers[`${qId}-0`] || [];
    const targetWord = currentQuestion.targetWord || "";
    const correctSyllableParts = currentQuestion.syllableParts || [];
    const userArrangedSyllables = userSyllableOrder.map((index: number) => 
      correctSyllableParts[index] || ''
    );
    const userArrangement = userArrangedSyllables.join('');
    const correctArrangement = targetWord.toLowerCase().trim();
    if (isInAnswer) {
      const correctPosition = correctSyllableParts.findIndex((syl: string) => syl === currentQuestion.syllableParts[syllableIdx]);
      const userPosition = userSyllableOrder.indexOf(syllableIdx);
      if (userPosition === correctPosition && userArrangement === correctArrangement) {
        return { backgroundColor: '#bbf7d0', textColor: '#15803d', borderColor: '#16a34a' };
      } else {
        return { backgroundColor: '#fecaca', textColor: '#991b1b', borderColor: '#dc2626' };
      }
    }
    return { backgroundColor: '#d1d5db', textColor: '#6b7280', borderColor: '#9ca3af' };
  }, [isAnswered, answers, qId, currentQuestion.targetWord, currentQuestion.syllableParts, cluePositions]);

  return {
    cluePositions,
    availableOptions,
    handleOptionSelect,
    letterBank,
    availableLetters,
    handleLetterPlace,
    handleSlotTap,
    getSlotStyle,
    availableEnumerationItems,
    handleEnumerationItemDrop,
    handleEnumerationItemRemove,
    getItemStyle,
    getCategoryStyle,
    handleEnumerationItemTap,
    showCategoryModal,
    selectedEnumerationItem,
    handleCategorySelect,
    handleModalCancel,
    availableMatchingItems,
    handleMatchingItemMatch,
    handleMatchingItemRemove,
    handleMatchingItemSwap,
    getMatchStyle,
    shuffledSyllableIndexes,
    handleSyllableRemove,
    handleSyllableReorder,
    getSyllableStyle,
  };
}