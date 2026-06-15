import { useState, useEffect, useCallback, useRef } from 'react';
import { doGetAllYunits } from '../api/functions';
import { useAuth } from './authContext';
import { useClassContext } from './classContext';

interface YunitsState {
  yunits: any[];
  isLoading: boolean;
  error: string | null;
}

export const useYunitsState = () => {
    const { classId } = useAuth();
    const { setAllYunits, allYunits } = useClassContext();
    const [state, setState] = useState<YunitsState>({
        yunits: [],
        isLoading: true,
        error: null
    });
    const updateState = useCallback((updates: Partial<YunitsState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);
    
    const fetchYunits = useCallback(async (showLoading = true) => {
        if (showLoading) {
            updateState({ isLoading: true, error: null });
        }
        if (allYunits) {
            updateState({ yunits: allYunits, isLoading: false, error: null });
            return;
        }
        try {
            const response = await doGetAllYunits(classId || "") as any;
            updateState({
                yunits: response?.yunits || [],
                isLoading: false,
                error: null
            });
            setAllYunits(response?.yunits || []);
        } catch (error) {
            updateState({
                error: "Failed to fetch yunits",
                isLoading: false
            });
            setAllYunits(null);
        }
    }, [ classId, allYunits, setAllYunits ]);

    // Initial fetch
    useEffect(() => {
        fetchYunits();
    }, [fetchYunits]);

    // Refresh yunits (with loading indicator)
    const refreshYunits = useCallback(() => {
        return fetchYunits(true);
    }, [fetchYunits]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
        return fetchYunits(false);
    }, [fetchYunits]);

    return {
        state,
        updateState,
        refreshYunits,
        silentRefresh,
        error: state.error,
    };
};