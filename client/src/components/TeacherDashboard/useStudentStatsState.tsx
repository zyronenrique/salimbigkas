import { useState, useEffect, useCallback, useRef } from 'react';
import {  doGetAllClassStudentStats } from '../../api/functions';
import { useAuth } from '../../hooks/authContext';
import { useClassContext } from '../../hooks/classContext';

interface StudentStatsState {
    stats: any[];
    searchQuery: string;
    gradeLevel: string;
    isLoading: boolean;
    error: string | null;
}

export const useStudentStatsState = () => {
    const { currentUser, setLoading } = useAuth();
    const { selectedStudent } = useClassContext();
    const [state, setState] = useState<StudentStatsState>({
        stats: [],
        searchQuery: '',
        gradeLevel: '',
        isLoading: true,
        error: null
    });
    const currentUserRef = useRef(currentUser?.uid);

    const updateState = useCallback((updates: Partial<StudentStatsState>) => {
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
            const response = await doGetAllClassStudentStats(userId) as any;
            updateState({
                stats: response?.studentStats || [],
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
        fetchStats(true);
    }, [fetchStats]);

    const silentStatsRefresh = useCallback(() => {
        fetchStats(false);
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

    const filteredStats = state.stats.filter((student) => {
        const matchesSearch = state.searchQuery.trim()
            ? (
                (student.displayName || "").toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                (student.email || "").toLowerCase().includes(state.searchQuery.toLowerCase())
            )
            : true;
        const matchesGrade = state.gradeLevel
            ? (student.gradeLevel === state.gradeLevel ||
                (Array.isArray(student.gradeLevels) && student.gradeLevels.includes(state.gradeLevel)))
            : true;
        return matchesSearch && matchesGrade;
    });

    const TimeSpentData = (selectedStudent?.stats?.lessonTimeSpent || []).map(
        (obj: any) => ({
            lessonId: obj.lessonId,
            lessonNumber: obj.lessonNumber,
            lessonName: obj.lessonName,
            timeSpent: Math.round(obj.timeSpent / 60),
        })
    );

    const TimeTooltip = useCallback(({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const { lessonName, timeSpent } = payload[0].payload;
            const minutes = Math.floor(timeSpent);
            return (
                <div className="bg-[#2C3E50] p-3 rounded shadow text-white border">
                    <h2>{lessonName}</h2>
                    <h1 className="text-lg font-bold">
                        Time: {minutes} min
                    </h1>
                </div>
            );
        }
        return null;
    }, []);

    return {
        state,
        updateState,
        refreshStats,
        silentStatsRefresh,
        filteredStats,
        TimeSpentData,
        TimeTooltip,
        error: state.error,
    };
};
