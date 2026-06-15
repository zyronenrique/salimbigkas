import { useState, useEffect, useCallback, useRef } from 'react';
import { doGetAdminStats } from '../../api/functions';
import { useAuth } from '../../hooks/authContext';
import { fetchCurrentMonthActivities } from '../../utils/helpers';

interface AdminDashboardState {
    stats: { [key: string]: any };
    fiveAct: any[];
    isLoading: boolean;
    error: string | null;
}

export const useAdminDbState = () => {
    const { currentUser, setLoading } = useAuth();
    const [state, setState] = useState<AdminDashboardState>({
        stats: {},
        fiveAct: [],
        isLoading: true,
        error: null
    });
    const currentUserRef = useRef(currentUser?.uid);

    const updateState = useCallback((updates: Partial<AdminDashboardState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);
    
    const userId = currentUser?.uid;
    const fetchStats = useCallback(async (showLoading = true) => {
        if (!userId) return;
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAdminStats() as any;
            const data = await fetchCurrentMonthActivities(userId);
            updateState({
                stats: response?.stats || {},
                fiveAct: data.five || [],
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch Stats",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchStats();
    }, []);

    const refreshStats = useCallback(() => {
       return fetchStats(true);
    }, [fetchStats]);

    const silentStatsRefresh = useCallback(() => {
        return fetchStats(false);
    }, [fetchStats]);

    // Auto-refresh on page visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && currentUserRef.current) {
                silentStatsRefresh();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [silentStatsRefresh]);

    return {
        state,
        updateState,
        refreshStats,
        silentStatsRefresh,
        error: state.error,
    };
};