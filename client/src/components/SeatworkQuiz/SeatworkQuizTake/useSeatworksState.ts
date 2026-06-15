import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { doGetAllSeatworks } from '../../../api/functions';
import { useAuth } from '../../../hooks/authContext';
import { useSeatworkQuizContext } from '../../../hooks/seatworkQuizContext';

interface Lesson {
    lessonNumber: string;
    seatworks: any[];
    isCompleted: boolean;
    isUnlocked: boolean;
    progress: number;
}

interface Yunit {
    yunitNumber: string;
    lessons: Lesson[];
}

interface SeatworksState {
    seatworksByYunit: Yunit[];
    isLoading: boolean;
    error: string | null;
    selectedYunitIndex: number;
    selectedLessonIndex: number;
}

export const useSeatworksState = () => {
    const { currentUser, classId, setLoading } = useAuth();
    const { selectedClassId } = useSeatworkQuizContext();
    const [state, setState] = useState<SeatworksState>({
        seatworksByYunit: [],
        isLoading: true,
        error: null,
        selectedYunitIndex: 0,
        selectedLessonIndex: 0,
    });
    const currentUserRef = useRef(currentUser?.uid);
    const updateState = useCallback((updates: Partial<SeatworksState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);
    
    const fetchSeatworks = useCallback(async (showLoading = true) => {
        if (!currentUser?.uid || !(selectedClassId || classId)) {
            updateState({ isLoading: false, error: null, seatworksByYunit: [] });
            return;
        }
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllSeatworks(currentUser.uid, selectedClassId || (classId || "")) as any;
            const seatworksByYunit = response?.seatworksByYunit || [];
            updateState({
                seatworksByYunit,
                selectedYunitIndex: 0,
                selectedLessonIndex: 0,
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch seatworks",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, selectedClassId, classId, updateState]);

    // Initial fetch
    useEffect(() => {
        fetchSeatworks();
    }, []);

    // Refresh seatworks (with loading indicator)
    const refreshSeatworks = useCallback(() => {
        fetchSeatworks(true);
    }, [fetchSeatworks]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
        fetchSeatworks(false);
    }, [fetchSeatworks]);

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
    const yunitCount = state.seatworksByYunit.length;
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
        return state.seatworksByYunit[state.selectedYunitIndex]?.lessons || [];
    }, [state.seatworksByYunit, state.selectedYunitIndex]);

    const lessonCount = lessons.length;

    const handlePrevSeatworks = useCallback(() => {
        if (state.selectedLessonIndex > 0) {
        setSelectedLessonIndex(state.selectedLessonIndex - 1);
        }
    }, [state.selectedLessonIndex, setSelectedLessonIndex]);
    const handleNextSeatworks = useCallback(() => {
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
        refreshSeatworks,
        silentRefresh,
        setSelectedYunitIndex,
        setSelectedLessonIndex,
        handlePrevYunit,
        handleNextYunit,
        handlePrevSeatworks,
        handleNextSeatworks,
        canGoPrevYunit,
        canGoNextYunit,
        canGoPrevLesson,
        canGoNextLesson,
    };
};