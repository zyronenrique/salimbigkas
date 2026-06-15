import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import { CreateAudioForJob, checkAllBadges, getClueLettersByGrade, getQuestionTimeByType, getSyllableClues, getUserHistory, quizStepAudios } from "@/utils/helpers";
import useTimer from "./Timer/useTimer";
import { usePartialScoring } from "@/hooks/usePartialScoring";
import useSpeedScoring from "@/hooks/useSpeedScoring";
import { doSubmitSeatworkorQuizAnswers } from "@/api/functions";
import { useAuth } from "@/hooks/authContext";
import QuestionWrapper from "@/components/question_types/QuestionWrapper";
import { useSeatworkQuizLogic } from "@/hooks/useSeatworkQuizLogic";
import QuizHeader from "@/components/question_types/Header";
import Characters from "@/components/Characters";
import { useQuizContext } from "@/hooks/quizContext";
import {  useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import LottieModal from "./modals/lottieModal";
import { useQuizzesState } from "@/hooks/useQuizzesState";
import { useSeatworkContext } from "@/hooks/seatworkContext";
import { useSeatworksState } from "@/hooks/useSeatworksState";
import { useClassContext } from "@/hooks/classContext";
import useAudioQueue from "@/hooks/useAudioQueue";
import SelectCategoryModal from "@/components/question_types/SelectCategoryModal";
import { imageSrc } from "@/Icons/icons";
import { useLogRegContext } from "@/hooks/logRegContext";
import { Toast } from "toastify-react-native";
import { useCopilot } from "react-native-copilot";
import { useStepAudio } from "@/hooks/useStepAudio";

const takeSeatworkQuiz = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { currentUser, role, gradeLevel } = useAuth();
  const { setIcon } = useLogRegContext();
  const { mode } = useClassContext();
  const { selectedSeatwork, setResults: setSeatworkResults } = useSeatworkContext();
  const { state: seatworksState } = useSeatworksState();
  const { selectedQuiz, setResults: setQuizResults } = useQuizContext();
  const { state: quizzesState } = useQuizzesState();
  const [showLottie, setShowLottie] = useState(false);
  const [openImage, setOpenImage] = useState<boolean>(false);

  const selected = mode === "seatwork" ? selectedSeatwork : selectedQuiz;
  const results = mode === "seatwork" ? setSeatworkResults : setQuizResults;
  const yunits = mode === "seatwork" ? seatworksState.seatworksByYunit : quizzesState.quizzesByYunit;

  const getInitialAnswers = () => {
    const initialAnswers: { [key: string]: any } = {};
    if (selected?.questions && Array.isArray(selected.questions)) {
      selected.questions.forEach((question: any) => {
        if (question.type === 'identification') {
          const cluePositions = getClueLettersByGrade(question.answer, selected.gradeLevel);
          initialAnswers[`${question.id}-cluePositions`] = cluePositions;
        }
        if (question.type === 'syllable') {
          const syllableCluePositions = getSyllableClues(question.syllableParts || [], selected.gradeLevel);
          initialAnswers[`${question.id}-syllableCluePositions`] = syllableCluePositions;
        }
      });
    }
    return initialAnswers;
  };

  const [answers, setAnswersState] = useState<{ [key: string]: any }>(getInitialAnswers());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [pendingShowResults, setPendingShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const memoizedQuestions = useMemo(() => selected?.questions || [], [selected?.questions]);
  const currentQuestion = memoizedQuestions[currentQuestionIndex] || null;
  const isLastQuestion = currentQuestionIndex === memoizedQuestions?.length - 1;
  const QUESTION_TIME = useMemo(() => getQuestionTimeByType(currentQuestion.type), [currentQuestion?.type]);
  const [timer, setTimer] = useState(QUESTION_TIME);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionResults, setQuestionResults] = useState<
    Array<{ correct: boolean; answerTime: number }>
  >([]);
  const audioQueue = useAudioQueue(CreateAudioForJob);
  const isTimerActiveRef = useRef(false);
  const { start, currentStepNumber, visible } = useCopilot();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (currentQuestion) {
      setTimer(QUESTION_TIME);
      setQuestionAnswered(false);
      setQuestionStartTime(Date.now());
      isTimerActiveRef.current = true;
    }
  }, [currentQuestionIndex, currentQuestion]);

  const answersRef = useRef(answers);
  const totalScoreRef = useRef(totalScore);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { totalScoreRef.current = totalScore; }, [totalScore]);

  const setAnswers = useCallback((updater: any) => {
    setAnswersState(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      answersRef.current = updated;
      return updated;
    });
  }, []);

  const { calculateScoreForQuestion } = usePartialScoring(memoizedQuestions);
  const { calculateScore: calculateSpeedScore } = useSpeedScoring();

  const handleTimeUp = useCallback(() => {
    if (!questionAnswered) {
      setQuestionAnswered(true);
      isTimerActiveRef.current = false;
      const accuracyScore = calculateScoreForQuestion(currentQuestionIndex, answersRef.current);
      const isCorrect = accuracyScore === 1;
      setQuestionResults((prev) => [
        ...prev,
        { correct: isCorrect, answerTime: QUESTION_TIME * 1000 }
      ]);
      const questionScore = Math.round(accuracyScore * 1000);
      setTotalScore((prev) => prev + questionScore);
      setTimeout(() => {
        if (isLastQuestion) {
          handleQuizComplete();
        } else {
          handleNextQuestion();
        }
      }, 1500);
    }
  }, [
    questionAnswered,
    answersRef.current,
    currentQuestion,
    currentQuestionIndex,
    isLastQuestion,
    calculateScoreForQuestion,
  ]);

  const { clearTimer } = useTimer({
    timer,
    isActive: isTimerActiveRef.current && !questionAnswered && currentQuestion && !visible,
    onTick: () => setTimer((t) => t - 1),
    onTimeout: handleTimeUp,
  });

  const handleNextQuestion = useCallback(() => {
    audioQueue.stop();
    clearTimer();
    isTimerActiveRef.current = false;
    setCurrentQuestionIndex((prev) => prev + 1);
  }, [clearTimer, audioQueue]);

  const handleAnswer = useCallback((answers: any) => {
    if (questionAnswered) return;
    setQuestionAnswered(true);
    isTimerActiveRef.current = false;
    const answerTime = Date.now() - questionStartTime;
    const accuracyScore = calculateScoreForQuestion(currentQuestionIndex, answers);
    const isCorrect = accuracyScore === 1;
    setQuestionResults((prev) => [
      ...prev,
      { correct: isCorrect, answerTime }
    ]);
    const speedBonus = accuracyScore > 0
      ? calculateSpeedScore(answerTime, true, QUESTION_TIME)
      : 0;
    const questionScore = Math.round(accuracyScore * 1000) + speedBonus;
    setTotalScore((prev) => prev + questionScore);
    setTimeout(() => {
      if (isLastQuestion) {
        handleQuizComplete();
      } else {
        handleNextQuestion();
      }
    }, 1500);
  }, [questionAnswered, questionStartTime, currentQuestionIndex, isLastQuestion, calculateSpeedScore, calculateScoreForQuestion, currentQuestion?.id, handleNextQuestion]);

  const { 
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
  } = useSeatworkQuizLogic({
    currentQuestion,
    answers: answersRef.current,
    setAnswers,
    isAnswered: questionAnswered,
    onAnswer: handleAnswer,
  });

  useEffect(() => {
    if (pendingShowResults) {
      setPendingShowResults(false);
    }
  }, [answers, pendingShowResults]);

  const totalScorePossible = useMemo(() => {
    if (!memoizedQuestions) return 0;
    return memoizedQuestions.length * 2000;
  }, [memoizedQuestions]);

  const handleQuizComplete = useCallback(async () => {
    audioQueue.stop();
    clearTimer();
    isTimerActiveRef.current = false;
    setIsSubmitting(true);
    setPendingShowResults(true);
    setShowLottie(true);
    // const syllableQuestions = memoizedQuestions.filter((q: any) => q.type === "syllable");
    // const syllableCount = syllableQuestions.length;
    // let syllablePerfect = false;
    // if (syllableCount > 0) {
    //   syllablePerfect = syllableQuestions.every((q: any) => {
    //     const qIdx = memoizedQuestions.findIndex((qq: any) => qq.id === q.id);
    //     return calculateScoreForQuestion(qIdx, answersRef.current) === 1;
    //   });
    // }
    // const userHistory = useMemo(() => getUserHistory(yunits, mode === "seatwork" ? "seatworks" : "quizzes"), [yunits, mode]);
    // const attempts = useMemo(() => {
    //   let attempts = 0;
    //   yunits.forEach((yunit: any) => {
    //     (yunit.lessons || []).forEach((lesson: any) => {
    //       const items = mode === "seatwork" ? (lesson.seatworks || []) : (lesson.quizzes || []);
    //       items.forEach((item: any) => {
    //         if (item.id === selected.id && item.response) {
    //           attempts += 1;
    //         }
    //       });
    //     });
    //   });
    //   return attempts + 1;
    // }, [yunits, selected.id, mode]);
    // let earnedBadges: string[] = checkAllBadges({
    //   questionResults,
    //   memoizedQuestions,
    //   answers: answersRef.current,
    //   totalScore: totalScoreRef.current,
    //   totalScorePossible,
    //   selected,
    //   attempts,
    //   history: userHistory,
    //   calculateScoreForQuestion,
    // });
    try {
      if (role === "Student") {
        await doSubmitSeatworkorQuizAnswers(
          currentUser?.uid || "",
          mode,
          selected.category,
          selected.classId,
          selected.id,
          answersRef.current,
          totalScoreRef.current,
          totalScorePossible,
          memoizedQuestions.length,
          gradeLevel || "",
        ) as any;
      }
      setTimeout(() => {
        results({
          score: totalScoreRef.current, 
          [mode === "seatwork" ? "totalSeatworkScore" : "totalQuizScore"]: totalScorePossible,
          totalQuestions: memoizedQuestions.length,
          answers: answersRef.current, 
        });
        setShowLottie(false);
        router.replace('/results');
      }, 3000);
    } catch (error) {
      setIcon('errorBox');
      Toast.show({
        type: ('custom' as any),
        text1: 'Submission Failed',
        text2: 'Failed to submit quiz. Please try again.',
        autoHide: false,
        progressBarColor: '#8a3903',
      });
      setShowLottie(false);
      router.replace('/quiz/Quizzes');
    } finally {
      setIsSubmitting(false);
    }
  }, [clearTimer, answersRef.current, totalScoreRef.current, memoizedQuestions, questionResults, selected, gradeLevel, currentUser, role, router, results, yunits, mode, calculateScoreForQuestion, audioQueue]);

  useEffect(() => {
    return () => {
      audioQueue.stop();
      clearTimer();
      isTimerActiveRef.current = false;
    };
  }, []);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        start();
      }
    }, 0);
    return () => {
      clearTimeout(startTimer);
    };
  }, [start]);

  useStepAudio({
    visible,
    currentStepNumber,
    audioSources: quizStepAudios,
    keyPrefix: 'quizStep',
  });

  const headerProps = useMemo(() => ({
    question: currentQuestion,
    cluePositions,
    currentQuestionIndex,
    totalQuestions: memoizedQuestions.length,
    totalScore,
    timer,
    questionTime: QUESTION_TIME,
    isAnswered: questionAnswered,
    availableEnumerationItems,
    onItemTap: handleEnumerationItemTap,
    setOpenImage,
    visible,
  }), [
    currentQuestion?.id,
    cluePositions, 
    currentQuestionIndex, 
    memoizedQuestions.length, 
    totalScore, 
    timer, 
    QUESTION_TIME, 
    questionAnswered, 
    availableEnumerationItems?.length, 
    handleEnumerationItemTap,
    visible,
  ]);

  const questionWrapperProps = useMemo(() => ({
    question: currentQuestion,
    answers: answersRef.current,
    isAnswered: questionAnswered,
    cluePositions,
    availableOptions,
    letterBank,
    availableLetters,
    onSlotTap: handleSlotTap,
    getSlotStyle,
    availableMatchingItems,
    shuffledSyllableIndexes,
    onOptionSelect: handleOptionSelect,
    onLetterPlace: handleLetterPlace,
    onEnumerationItemDrop: handleEnumerationItemDrop,
    onEnumerationItemRemove: handleEnumerationItemRemove,
    getItemStyle,
    getCategoryStyle,
    onMatchingItemMatch: handleMatchingItemMatch,
    onMatchingItemRemove: handleMatchingItemRemove,
    onMatchingItemSwap: handleMatchingItemSwap,
    getMatchStyle,
    onSyllableRemove: handleSyllableRemove,
    onSyllableReorder: handleSyllableReorder,
    getSyllableStyle,
    audioQueue,
    visible,
  }), [
    currentQuestion?.id,
    questionAnswered,
    cluePositions,
    availableOptions,
    letterBank,
    availableLetters,
    handleSlotTap,
    getSlotStyle,
    availableMatchingItems,
    shuffledSyllableIndexes,
    handleOptionSelect,
    handleLetterPlace,
    handleEnumerationItemDrop,
    handleEnumerationItemRemove,
    getItemStyle,
    getCategoryStyle,
    handleMatchingItemMatch,
    handleMatchingItemRemove,
    handleMatchingItemSwap,
    getMatchStyle,
    handleSyllableRemove,
    handleSyllableReorder,
    getSyllableStyle,
    audioQueue,
    start,
    visible,
  ]);

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: '#FFA600'
    }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <QuizHeader {...headerProps} />
        <QuestionWrapper key={currentQuestion?.id} {...questionWrapperProps} />
      </View>
      {openImage && currentQuestion?.image && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 20 }}>
          <Image
            source={imageSrc.leaderboardBg} 
            style={{ width: width, height: height }} 
            resizeMode="contain" 
          />
          <View style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }}>
            <TouchableOpacity onPress={() => setOpenImage(false)}>
              <Image source={imageSrc.gameX} style={{ width: 40, height: 40 }} resizeMode='contain' />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showCategoryModal && selectedEnumerationItem && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 20 }}>
          <SelectCategoryModal
            question={currentQuestion}
            selectedItem={selectedEnumerationItem}
            visible={showCategoryModal}
            onRequestClose={handleModalCancel}
            categorySelect={handleCategorySelect}
          />
        </View>
      )}
      {showLottie && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 20 }}>
          <LottieModal
            visible={showLottie}
            onClose={() => setShowLottie(false)}
            type="both"
            isSubmitting={isSubmitting}
          />
        </View>
      )}
      {role !== "Student" && <Characters />}
    </SafeAreaView>
  );
};

export default takeSeatworkQuiz;