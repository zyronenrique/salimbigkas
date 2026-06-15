import { useState, useEffect, useCallback, useRef } from 'react';
import { doGetAllDraftLessons, doGetAllTeacherClasses, doGetTeacherStats } from '../../api/functions';
import { useAuth } from '../../hooks/authContext';
import { useClassContext } from '../../hooks/classContext';
import { useNavigate } from 'react-router-dom';
import { useLogReg } from '../Modals/LogRegProvider';

interface TeacherDashboardState {
    stats: { [key: string]: any };
    classes: any[];
    draftLessons: any[];
    isLoading: boolean;
    error: string | null;
}

export const useTeacherDbState = () => {
    const navigate = useNavigate();
    const { currentUser, role, setLoading } = useAuth();
    const { formattedGradeLevel } = useLogReg();
    const { setSelectedClass } = useClassContext();
    const [state, setState] = useState<TeacherDashboardState>({
        stats: {},
        classes: [],
        draftLessons: [],
        isLoading: true,
        error: null
    });
    const currentUserRef = useRef(currentUser?.uid);

    const updateState = useCallback((updates: Partial<TeacherDashboardState>) => {
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
            const response = await doGetTeacherStats(userId) as any;
            updateState({
                stats: response?.stats || {},
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

    const fetchClasses = useCallback(async (showLoading = true) => {
        if (!userId) return;
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllTeacherClasses(userId) as any;
            updateState({
                classes: response?.classes || [],
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch classes",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDraftLessons = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllDraftLessons() as any;
            updateState({
                draftLessons: response?.lessons || [],
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch draft lessons",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Initial fetch
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    useEffect(() => {
        fetchDraftLessons();
    }, [fetchDraftLessons]);

    const refreshStats = useCallback(() => {
        fetchStats(true);
    }, [fetchStats]);

    const silentStatsRefresh = useCallback(() => {
        fetchStats(false);
    }, [fetchStats]);

    const refreshClasses = useCallback(() => {
        fetchClasses(true);
    }, [fetchClasses]);

    const silentClassRefresh = useCallback(() => {
        fetchClasses(false);
    }, [fetchClasses]);

    const refreshDraftLessons = useCallback(() => {
        fetchDraftLessons(true);
    }, [fetchDraftLessons]);

    const silentDraftLessonsRefresh = useCallback(() => {
        fetchDraftLessons(false);
    }, [fetchDraftLessons]);

    // Auto-refresh on page visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && currentUserRef.current) {
                silentStatsRefresh();
                silentClassRefresh();
                silentDraftLessonsRefresh();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [silentStatsRefresh, silentClassRefresh]);

    const handleShowClass = useCallback((classData: any) => {
        setSelectedClass(classData);
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${classData.id}/my-courses`);
    }, [setSelectedClass, navigate, role, formattedGradeLevel]);

    return {
        state,
        updateState,
        refreshStats,
        silentStatsRefresh,
        refreshClasses,
        silentClassRefresh,
        refreshDraftLessons,
        silentDraftLessonsRefresh,
        handleShowClass,
        error: state.error,
    };
};