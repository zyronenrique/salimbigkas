import { useState, useEffect, useCallback, useRef } from 'react';
import { doGetAllQuizzes } from '../api/functions';
import { useAuth } from './authContext';

interface Lesson {
  lessonNumber: string;
  quizzes: any[];
  isCompleted: boolean;
  isUnlocked: boolean;
  progress: number;
}

interface Yunit {
  yunitNumber: string;
  lessons: Lesson[];
}

interface QuizzesState {
  quizzesByYunit: Yunit[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  selectedYunitIndex: number;
  selectedLessonIndex: number;
}

export const useQuizzesState = () => {
    const { currentUser, classId } = useAuth();
    const [state, setState] = useState<QuizzesState>({
        quizzesByYunit: [],
        isLoading: true,
        error: null,
        isModalOpen: false,
        selectedYunitIndex: 0,
        selectedLessonIndex: 0,
    });
    const updateState = useCallback((updates: Partial<QuizzesState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);
    
    const fetchQuizzes = useCallback(async (showLoading = true) => {
        if (!currentUser?.uid || !classId) {
            updateState({ quizzesByYunit: [], isLoading: false, error: null});
            return;
        }
        if (showLoading) {
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllQuizzes(currentUser.uid, classId) as any;
            const quizzesByYunit = response?.quizzesByYunit || [];
            updateState({
                quizzesByYunit,
                selectedYunitIndex: 0,
                selectedLessonIndex: 0,
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch quizzes",
                isLoading: false
            });
        }
    }, [currentUser?.uid, classId]);

    // Initial fetch
    useEffect(() => {
        fetchQuizzes();
    }, []);

    // Refresh quizzes (with loading indicator)
    const refreshQuizzes = useCallback(() => {
        return fetchQuizzes(true);
    }, [fetchQuizzes]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
        return fetchQuizzes(false);
    }, [fetchQuizzes]);

    const setSelectedYunitIndex = useCallback((idx: number) => {
        updateState({
            selectedYunitIndex: idx,
            selectedLessonIndex: 0
        });
    }, []);

    const setSelectedLessonIndex = useCallback((idx: number) => {
        updateState({ selectedLessonIndex: idx });
    }, []);

    // Navigation helpers for yunitNumber
    const yunitCount = state.quizzesByYunit.length;
    const handlePrevYunit = useCallback(() => {
        if (state.selectedYunitIndex > 0) {
            setSelectedYunitIndex(state.selectedYunitIndex - 1);
        }
    }, [state.selectedYunitIndex, setSelectedYunitIndex]);
    const handleNextYunit = useCallback(() => {
        if (state.selectedYunitIndex < yunitCount - 1) {
            setSelectedYunitIndex(state.selectedYunitIndex + 1);
        }
    }, [state.selectedYunitIndex, yunitCount, setSelectedYunitIndex]);

    // Navigation helpers for lessonNumber within selected yunit
    const lessons = state.quizzesByYunit[state.selectedYunitIndex]?.lessons || [];
    const lessonCount = lessons.length;
    const handlePrevQuizzes = useCallback(() => {
        if (state.selectedLessonIndex > 0) {
            setSelectedLessonIndex(state.selectedLessonIndex - 1);
        }
    }, [state.selectedLessonIndex, setSelectedLessonIndex]);
    const handleNextQuizzes = useCallback(() => {
        if (state.selectedLessonIndex < lessonCount - 1) {
            setSelectedLessonIndex(state.selectedLessonIndex + 1);
        }
    }, [state.selectedLessonIndex, lessonCount, setSelectedLessonIndex]);

    const canGoPrevYunit = state.selectedYunitIndex > 0;
    const canGoNextYunit = state.selectedYunitIndex < yunitCount - 1;
    const canGoPrevLesson = state.selectedLessonIndex > 0;
    const canGoNextLesson = state.selectedLessonIndex < lessonCount - 1;

    const unlockedQuizzes = lessons
        .map((lesson, lIdx) =>
            lesson.isUnlocked
            ? lesson.quizzes.map((quiz, qIdx) => ({
                quiz,
                lesson,
                lIdx,
                qIdx,
                prevQuizResponse: qIdx === 0 ? true : lesson.quizzes[qIdx - 1]?.response,
                }))
            : []
        )
        .flat();
    const nextQuiz = unlockedQuizzes.find(
        (item) => !item.quiz.response && item.prevQuizResponse
    );

    return {
        state,
        updateState,
        error: state.error,
        lessons,
        refreshQuizzes,
        silentRefresh,
        setSelectedYunitIndex,
        setSelectedLessonIndex,
        handlePrevYunit,
        handleNextYunit,
        handlePrevQuizzes,
        handleNextQuizzes,
        canGoPrevYunit,
        canGoNextYunit,
        canGoPrevLesson,
        canGoNextLesson,
        nextQuiz,
    };
};