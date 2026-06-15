import { useState, useEffect, useCallback, useRef } from 'react';
import { doGetAllBigkasLevels } from '../../api/functions';
import { useAuth } from '../../hooks/authContext';
import { useBigkasContext } from '../../hooks/bigkasContext';

interface LevelsState {
    levels: { [yunitNumber: string]: any[] };
    isLoading: boolean;
    error: string | null;
    selectedYunitNumber: string;
    pickMode: string;
}

export const useBigkasLevels = () => {
    const { currentUser, gradeLevel, setLoading } = useAuth();
    const { selectedGradeLevel } = useBigkasContext();
    const [state, setState] = useState<LevelsState>({
        levels: {},
        isLoading: true,
        error: null,
        selectedYunitNumber: "",
        pickMode: "normal",
    });
    const currentUserRef = useRef(currentUser?.uid);

    const updateState = useCallback((updates: Partial<LevelsState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const fetchLevels = useCallback(async (showLoading = true) => {
        if (!currentUser?.uid || !(selectedGradeLevel || gradeLevel)) {
            updateState({ isLoading: false, error: null, levels: {} });
            return;
        }
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllBigkasLevels(currentUser.uid, gradeLevel || selectedGradeLevel) as any;
            const levelsData = response?.levelsByYunit || {};
            const yunitNumbers = Object.keys(levelsData);
            updateState({
                levels: levelsData,
                selectedYunitNumber: state.selectedYunitNumber || (yunitNumbers?.length > 0 ? yunitNumbers[0] : ""),
                isLoading: false,
                error: null
            });
        } catch (err) {
            updateState({
                error: "Failed to fetch levels",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, selectedGradeLevel, gradeLevel, state.selectedYunitNumber, updateState]);

    // Initial fetch
    useEffect(() => {
        fetchLevels();
    }, []);

    // Refresh levels (with loading indicator)
    const refreshLevels = useCallback(() => {
        return fetchLevels(true);
    }, [fetchLevels]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
        return fetchLevels(false);
    }, [fetchLevels]);

    // Update selected yunit
    const setSelectedYunitNumber = useCallback((yunitNumber: string) => {
        updateState({ selectedYunitNumber: yunitNumber });
    }, []);

    // Navigation helpers
    const yunitNumbers = Object.keys(state.levels);
    const handlePrevYunit = useCallback(() => {
        const idx = yunitNumbers.indexOf(state.selectedYunitNumber);
        if (idx > 0) {
            setSelectedYunitNumber(yunitNumbers[idx - 1]);
        }
    }, [yunitNumbers, state.selectedYunitNumber, setSelectedYunitNumber]);
    const handleNextYunit = useCallback(() => {
        const idx = yunitNumbers.indexOf(state.selectedYunitNumber);
        if (idx < yunitNumbers.length - 1) {
            setSelectedYunitNumber(yunitNumbers[idx + 1]);
        }
    }, [yunitNumbers, state.selectedYunitNumber, setSelectedYunitNumber]);

    // Check if navigation is available
    const canGoPrev = yunitNumbers.indexOf(state.selectedYunitNumber) > 0;
    const canGoNext = yunitNumbers.indexOf(state.selectedYunitNumber) < yunitNumbers.length - 1 && 
        !!state.levels[yunitNumbers[yunitNumbers.indexOf(state.selectedYunitNumber) + 1]]?.length;

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
        yunitNumbers,
        refreshLevels,
        silentRefresh,
        setSelectedYunitNumber,
        handlePrevYunit,
        handleNextYunit,
        canGoPrev,
        canGoNext,
    };
};