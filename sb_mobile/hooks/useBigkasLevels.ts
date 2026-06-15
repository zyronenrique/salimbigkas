import { useState, useEffect, useCallback, useRef } from 'react';
import { doGetAllBigkasLevels } from '../api/functions';
import { useAuth } from '../hooks/authContext';

interface LevelsState {
  levels: { [yunitNumber: string]: any[] };
  isLoading: boolean;
  error: string | null;
  selectedYunitNumber: string;
  pickMode: string;
  isModalOpen: boolean;
}

export const useBigkasLevels = () => {
    const { currentUser, gradeLevel, gradeLevels } = useAuth();
    const [state, setState] = useState<LevelsState>({
        levels: {},
        isLoading: true,
        error: null,
        selectedYunitNumber: "",
        pickMode: "normal",
        isModalOpen: false
    });
    const currentUserRef = useRef(currentUser?.uid);
    const gradeLevelRef = useRef(gradeLevel || gradeLevels?.[0] || "");
    currentUserRef.current = currentUser?.uid;
    gradeLevelRef.current = gradeLevel || gradeLevels?.[0] || "";

    const updateState = useCallback((updates: Partial<LevelsState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const fetchLevels = useCallback(async (showLoading = true) => {
        if (!currentUserRef.current || !gradeLevelRef.current) return;
        if (showLoading) {
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllBigkasLevels(currentUserRef.current, gradeLevelRef.current) as any;
            const levelsData = response?.levelsByYunit || {};
            const yunitNumbers = Object.keys(levelsData);
            updateState({
                levels: levelsData,
                selectedYunitNumber: state.selectedYunitNumber || (yunitNumbers.length > 0 ? yunitNumbers[0] : ""),
                isLoading: false,
                error: null
            });
        } catch (err) {
            console.error("Error fetching levels:", err);
            updateState({
                error: "Failed to fetch levels",
                isLoading: false
            });
        }
    }, [gradeLevels]);

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