import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { doGetAllQuizzes } from '../../../api/functions';
import { useAuth } from '../../../hooks/authContext';
import { useSeatworkQuizContext } from '../../../hooks/seatworkQuizContext';

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
    selectedYunitIndex: number;
    selectedLessonIndex: number;
}

export const useQuizzesState = () => {
    const { currentUser, classId, setLoading } = useAuth();
    const { selectedClassId } = useSeatworkQuizContext();
    const [state, setState] = useState<QuizzesState>({
        quizzesByYunit: [],
        isLoading: true,
        error: null,
        selectedYunitIndex: 0,
        selectedLessonIndex: 0,
    });
    const currentUserRef = useRef(currentUser?.uid);
    const updateState = useCallback((updates: Partial<QuizzesState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);
    
    const fetchQuizzes = useCallback(async (showLoading = true) => {
        if (!currentUser?.uid || !(selectedClassId || classId)) {
            updateState({ isLoading: false, error: null, quizzesByYunit: [] });
            return;
        }
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllQuizzes(currentUser.uid, selectedClassId || (classId || "")) as any;
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
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, selectedClassId, classId, updateState]);

    // Initial fetch
    useEffect(() => {
        fetchQuizzes();
    }, []);

    // Refresh quizzes (with loading indicator)
    const refreshQuizzes = useCallback(() => {
        fetchQuizzes(true);
    }, [fetchQuizzes]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
        fetchQuizzes(false);
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
    const lessons = useMemo(() => {
        return state.quizzesByYunit[state.selectedYunitIndex]?.lessons || [];
    }, [state.quizzesByYunit, state.selectedYunitIndex]);

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

    // Auto-refresh on page visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && currentUserRef.current) {
                silentRefresh();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [silentRefresh]);

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
    };
};