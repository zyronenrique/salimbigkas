import { useState, useEffect, useCallback, useRef } from 'react';
import { doGetDescriptiveAnalytics } from '../../api/functions';
import { useAuth } from '../../hooks/authContext';

interface AnalyticsState {
  analytics: any;
  activeIndex: number;
  isLoading: boolean;
  error: string | null;
}

export const useAnalyticsState = () => {
    const { currentUser, setLoading } = useAuth();
    const [state, setState] = useState<AnalyticsState>({
        analytics: {},
        activeIndex: 0,
        isLoading: true,
        error: null,
    });
    const currentUserRef = useRef(currentUser?.uid);

    const updateState = useCallback((updates: Partial<AnalyticsState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const fetchAnalytics = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetDescriptiveAnalytics() as any;
            updateState({
                analytics: response?.data || [],
                isLoading: false,
                error: null
            });
        } catch (err) {
            updateState({
                error: "Failed to fetch analytics",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Refresh analytics (with loading indicator)
    const refreshAnalytics = useCallback(() => {

        fetchAnalytics(true);
    }, [fetchAnalytics]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
        fetchAnalytics(false);
    }, [fetchAnalytics]);

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

    const lessonsCompletedData = Object.entries(state.analytics?.lessonsCompletedPerStudent ?? {}).map(
        ([uid, count]) => ({
            uid,
            count: Number(count),
        }),
    );

    const dailyActiveData = Object.entries(state.analytics?.dailyActive || {})
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, count]) => ({
            date,
            count: Number(count),
        }));

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
        
    const avgTimeSpentData = Object.entries(state.analytics?.avgTimeSpentPerLesson ?? {}).map(
        ([lessonId, obj]) => {
            const { title, avg } = obj as { title: string; avg: number };
            const avgInMinutes = avg / 60;
            return {
                lessonId,
                title,
                avg: avgInMinutes,
            };
        },
    );

    const AvgTimeTooltip = useCallback(({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const avgInMinutes = payload[0].value;
            const totalSeconds = avgInMinutes * 60;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = (totalSeconds % 60).toFixed(1);
            return (
                <div className="bg-[#2C3E50] p-3 rounded shadow text-white border">
                    <h2>{label}</h2>
                    <h1 className="text-lg font-bold">
                        Avg Time: {minutes} min {seconds} sec
                    </h1>
                </div>
            );
        }
        return null;
    }, []);

    return {
        state,
        updateState,
        refreshAnalytics,
        silentRefresh,
        lessonsCompletedData,
        dailyActiveData,
        formatDate,
        avgTimeSpentData,
        AvgTimeTooltip,
        error: state.error,
    };
};