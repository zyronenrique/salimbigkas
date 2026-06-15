import { useCallback, useMemo } from "react";
import { areAllItemsPlaced, getUserOnlyLetters, isAllFilled, shuffleArray } from "../../../utils/helpers";

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

  const handleMultipleDrop = useCallback((droppedOptionIndex: number) => {
    if (isAnswered) return;
    if (answers[qId] === droppedOptionIndex) return;
    const updatedAnswers = { ...answers, [qId]: droppedOptionIndex };
    setAnswers(updatedAnswers);
    onAnswer(updatedAnswers);
  }, [qId, setAnswers, isAnswered, currentQuestion, onAnswer]);

  const handleMultipleChoiceDragEnd = useCallback((result: any) => {
    if (!result.destination || isAnswered) return;
    const sourceId = result.draggableId;
    const destId = result.destination.droppableId;
    let optionIndex: number | undefined;
    if (sourceId.startsWith('placed-option-')) {
      optionIndex = parseInt(sourceId.replace('placed-option-', ''));
    } else if (sourceId.startsWith('option-')) {
      const parts = sourceId.split('-');
      optionIndex = parseInt(parts[parts.length - 1], 10);
    }
    if (destId === `answer-zone-${qId}` && typeof optionIndex === 'number' && !isNaN(optionIndex)) {
      handleMultipleDrop(optionIndex);
    } else if (destId === `options-bank-${qId}`) {
      setAnswers((prev: any) => {
        const newAnswers = { ...prev };
        delete newAnswers[qId];
        return newAnswers;
      });
    }
  }, [qId, setAnswers, isAnswered, handleMultipleDrop]);

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
  }, [currentQuestion?.answer, currentQuestion?.letterBank, cluePositions, shuffleArray]);

  const availableLetters = useMemo(() => (
    letterBank
      .map((letter: string, letterIdx: number) => ({ letter, letterIdx }))
      .filter(({ letterIdx }: { letterIdx: number }) => !(answers[`${qId}-slots`] || []).includes(letterIdx))
  ), [letterBank, answers, qId]);

  const handleLetterDrop = useCallback((slotIndex: number, letterIndex: number) => {
    if (isAnswered) return;
    const currentSlots = answers[`${qId}-slots`] || new Array(currentQuestion.answer?.length || 0).fill(null);
    const newSlots = [...currentSlots];
    const currentPosition = newSlots.indexOf(letterIndex);
    if (currentPosition !== -1) newSlots[currentPosition] = null;
    const targetSlotContent = newSlots[slotIndex];
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

  const handleIdentificationDragEnd = useCallback((result: any) => {
    if (!result.destination || isAnswered) return;
    const sourceId = result.draggableId;
    const destId = result.destination.droppableId;
    let letterIndex: number | undefined;
    if (sourceId.startsWith('placed-letter-')) {
      const parts = sourceId.split('-');
      letterIndex = parseInt(parts[parts.length - 1]);
    } else if (sourceId.startsWith('letter-')) {
      letterIndex = parseInt(sourceId.replace('letter-', ''));
    }
    if (typeof letterIndex !== 'number' || isNaN(letterIndex)) return;
    if (destId.startsWith('slot-')) {
      const slotIndex = parseInt(destId.split('-')[1]);
      if (!cluePositions.includes(slotIndex)) {
        handleLetterDrop(slotIndex, letterIndex);
      }
    } else if (destId === `letter-bank-${qId}`) {
      setAnswers((prev: any) => {
        const currentSlots = prev[`${qId}-slots`] || [];
        const newSlots = currentSlots.map((slot: number | null) =>
          slot === letterIndex ? null : slot
        );
        const userOnlyLetters = getUserOnlyLetters(newSlots, letterBank, cluePositions);
        return {
          ...prev,
          [`${qId}-slots`]: newSlots,
          [qId]: userOnlyLetters
        };
      });
    }
  }, [qId, cluePositions, letterBank, setAnswers, isAnswered, handleLetterDrop]);

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

  const handleEnumerationDragEnd = useCallback((result: any) => {
    if (!result.destination || isAnswered) return;
    const sourceId = result.draggableId;
    const destId = result.destination.droppableId;
    const item = sourceId.replace(/^item-/, '').replace(new RegExp(`-${qId}.*$`), '');
    let newBoxes: { [catIdx: string]: string[] } = { ...(answers[`${qId}-boxes`] || {}) };
    if (destId.startsWith('category-')) {
      const categoryIndex = destId.split('-')[1];
      if (!newBoxes[categoryIndex]) newBoxes[categoryIndex] = [];
      Object.keys(newBoxes).forEach((catIdx) => {
        newBoxes[catIdx] = newBoxes[catIdx].filter(boxItem => boxItem !== item);
      });
      if (!newBoxes[categoryIndex].includes(item)) {
        newBoxes[categoryIndex].push(item);
      }
    } else if (destId === `item-bank-${qId}`) {
      Object.keys(newBoxes).forEach((catIdx) => {
        newBoxes[catIdx] = newBoxes[catIdx].filter(boxItem => boxItem !== item);
      });
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
  }, [qId, setAnswers, isAnswered, currentQuestion?.categories, answers, itemBank]);

  // Matching Items

  const availableMatchingItems = useMemo(() => (
    (currentQuestion?.rightItems || [])
      .map((item: string, rightIdx: number) => ({ item, rightIdx }))
      .filter(({ rightIdx }: { rightIdx: number }) => !(answers[qId] || []).includes(rightIdx))
  ), [currentQuestion?.rightItems, answers, qId]);

  const handleMatchingDragEnd = useCallback((result: any) => {
    if (!result.destination || isAnswered) return;
    const currentMatches = answers[qId] || Array(currentQuestion?.leftItems?.length || 0).fill(null);
    const sourceId = result.draggableId;
    const sourceIdx = parseInt(sourceId.split('-')[1]);
    const destIdx = parseInt(result.destination.droppableId.split('-')[1]);
    const sourceDropZoneId = result.source.droppableId;
    let newMatches = [...currentMatches];
    if (result.destination.droppableId.startsWith('left-')) {
      if (sourceDropZoneId.startsWith('left-')) {
        const sourceSlotIdx = parseInt(sourceDropZoneId.split('-')[1]);
        [newMatches[destIdx], newMatches[sourceSlotIdx]] = [newMatches[sourceSlotIdx], newMatches[destIdx]];
      } else {
        const prevPosition = newMatches.indexOf(sourceIdx);
        if (prevPosition !== -1) newMatches[prevPosition] = null;
        newMatches[destIdx] = sourceIdx;
      }
    } else if (result.destination.droppableId.startsWith('available-items')) {
      if (sourceDropZoneId.startsWith('left-')) {
        const sourceSlotIdx = parseInt(sourceDropZoneId.split('-')[1]);
        newMatches[sourceSlotIdx] = null;
      }
    }
    const updatedAnswers = {
      ...answers,
      [qId]: newMatches
    };
    setAnswers(updatedAnswers);
    if (newMatches.every((match: any) => match !== null)) {
      onAnswer(updatedAnswers);
    }
  }, [qId, answers, setAnswers, isAnswered, currentQuestion, onAnswer]);

  // Syllables Items
  
  const shuffledSyllableIndexes: number[] = useMemo(() => {
    if (!currentQuestion.syllableParts) return [];
    const allIndexes: number[] = currentQuestion.syllableParts.map((_: any, index: number) => index);
    // const availableIndexes: number[] = allIndexes.filter((index: number) => !cluePositions.includes(index));
    return shuffleArray<number>(allIndexes);
  }, [currentQuestion.syllableParts, cluePositions]);

  const handleSyllableDragEnd = useCallback((result: any) => {
    if (!result.destination || isAnswered) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    let newOrder = [...(answers[`${qId}-0`] || [])];

    if (result.destination.droppableId === `syllable-drop-${qId}-0`) {
      if (result.source.droppableId === `syllable-drop-${qId}-0`) {
        const [movedItem] = newOrder.splice(sourceIndex, 1);
        newOrder.splice(destIndex, 0, movedItem);
      } else {
        const syllableIdx = parseInt(result.draggableId.split('-').pop() || '0');
        newOrder.splice(destIndex, 0, syllableIdx);
      }
    } else if (result.destination.droppableId === `syllable-source-${qId}-0`) {
      if (result.source.droppableId === `syllable-drop-${qId}-0`) {
        newOrder.splice(sourceIndex, 1);
      }
    }
    const updatedAnswers = {
      ...answers,
      [`${qId}-0`]: newOrder
    };
    setAnswers(updatedAnswers);
    if (newOrder.length === currentQuestion?.syllableParts.length) {
      onAnswer(updatedAnswers);
    }
  }, [qId, answers, setAnswers, isAnswered, currentQuestion?.syllableParts, onAnswer]);

  const handleDragEnd = useCallback((result: any) => {
    switch (currentQuestion.type) {
      case "multiple":
        handleMultipleChoiceDragEnd(result);
        break;
      case "identification":
        handleIdentificationDragEnd(result);
        break;
      case "enumeration":
        handleEnumerationDragEnd(result);
        break;
      case "matching":
        handleMatchingDragEnd(result);
        break;
      case "syllable":
        handleSyllableDragEnd(result);
        break;
      default:
        break;
    }
  }, [
    currentQuestion,
    handleMultipleChoiceDragEnd,
    handleIdentificationDragEnd,
    handleEnumerationDragEnd,
    handleMatchingDragEnd,
    handleSyllableDragEnd,
  ]);

  return {
    handleDragEnd,
    cluePositions,
    handleMultipleChoiceDragEnd,
    availableOptions,
    handleIdentificationDragEnd,
    letterBank,
    availableLetters,
    handleEnumerationDragEnd,
    availableEnumerationItems,
    handleMatchingDragEnd,
    availableMatchingItems,
    handleSyllableDragEnd,
    shuffledSyllableIndexes,
  };
}