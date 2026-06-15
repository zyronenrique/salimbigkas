import { useState, useEffect, useCallback, useRef } from 'react';
import {  doGetAllVideos, doGetAllYunitLessons, doGetUserAnalytics, doGetUserOpenLessons } from '../api/functions';
import { useAuth } from './authContext';
import { useClassContext } from './classContext';
import { model } from '../firebase/firebase';
import { Toast } from 'toastify-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LessonsState {
    lessons: any[];
    openLessons: any[];
    videos: any[];
    analytics: any[];
    recommendations: any[];
    isLoading: boolean;
    error: string | null;
}

export const useLessonsState = () => {
    const { currentUser, classId, gradeLevel } = useAuth();
    const { selectedYunit, selectedLesson, setAiRecommendations, aiRecommendations } = useClassContext();
    const [state, setState] = useState<LessonsState>({
        lessons: [],
        openLessons: [],
        videos: [],
        analytics: [],
        recommendations: [],
        isLoading: true,
        error: null
    });

    const updateState = useCallback((updates: Partial<LessonsState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);
    
    const fetchOpenLessons = useCallback(async (showLoading = true) => {
        if (!currentUser?.uid) {
            updateState({ openLessons: [], isLoading: false });
            return;
        }
        if (showLoading) {
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetUserOpenLessons(currentUser.uid) as any;
            updateState({
                openLessons: response?.lessons,
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch open lessons",
                isLoading: false
            });
        }
    }, [currentUser?.uid]);

    const fetchLessons = useCallback(async (showLoading = true) => {
        if (!selectedYunit || !currentUser?.uid || !gradeLevel || !classId) {
            updateState({ lessons: [], isLoading: false });
            return;
        }
        if (showLoading) {
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllYunitLessons(
                currentUser.uid,
                classId,
                selectedYunit.id,
                gradeLevel,
            ) as any;
            const notDraftLessons = response.lessons.filter(
                (lesson: any) => !lesson.isArchived && lesson.isDraft === false,
            );
            updateState({
                lessons: notDraftLessons,
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch lessons",
                isLoading: false
            });
        }
    }, [currentUser?.uid, selectedYunit, gradeLevel, classId]);

    const fetchUserAnalytics = useCallback(async (showLoading = true) => {
        if (!currentUser?.uid) {
            updateState({ analytics: [], isLoading: false });
            return;
        }
        if (showLoading) {
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetUserAnalytics(currentUser.uid) as any;
            updateState({
                analytics: response?.data,
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch user analytics",
                isLoading: false
            });
        }
    }, [currentUser?.uid]);

    const fetchandSetVideos = useCallback(async (showLoading = true) => {
        if (!selectedLesson?.id || !gradeLevel) {
            updateState({ videos: [], isLoading: false });
            return;
        }
        if (showLoading) {
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllVideos(selectedLesson?.id, gradeLevel) as any;
            updateState({ videos: response?.videos || [] });
        } catch (error) {
            console.error("Failed to fetch videos:", error);
            Toast.error("Error: Failed to fetch videos.");
        }
    }, [selectedLesson?.id, gradeLevel]);

    // Initial fetch
    useEffect(() => {
        fetchLessons();
    }, []);

    useEffect(() => {
        fetchOpenLessons();
    }, [currentUser?.uid]);

    useEffect(() => {
        fetchUserAnalytics();
    }, []);

    useEffect(() => {
        fetchandSetVideos();
    }, []);

    // Refresh yunits (with loading indicator)
    const refreshLessons = useCallback(() => {
        return fetchLessons(true);
    }, [fetchLessons]);

    // Silent refresh (without loading indicator)
    const silentLessonsRefresh = useCallback(() => {
        return fetchLessons(false);
    }, [fetchLessons]);

    // Refresh open lessons (with loading indicator)
    const refreshOpenLessons = useCallback(() => {
        return fetchOpenLessons(true);
    }, [fetchOpenLessons]);

    // Silent refresh (without loading indicator)
    const silentOpenLessonsRefresh = useCallback(() => {
        return fetchOpenLessons(false);
    }, [fetchOpenLessons]);

    const refreshUserAnalytics = useCallback(() => {
        return fetchUserAnalytics(true);
    }, [fetchUserAnalytics]);

    const silentUserAnalyticsRefresh = useCallback(() => {
        return fetchUserAnalytics(false);
    }, [fetchUserAnalytics]);

    const refreshVideos = useCallback(() => {
        return fetchandSetVideos(true);
    }, [fetchandSetVideos]);

    const silentVideosRefresh = useCallback(() => {
        return fetchandSetVideos(false);
    }, [fetchandSetVideos]);

    const prevLessonsRef = useRef<any[]>([]);
    const prevAnalyticsRef = useRef<any>(null);
    
    const getAIRecommendations = useCallback(async () => {
        const cacheKey = `aiRecommendations_${currentUser?.uid}_${gradeLevel}`;
        if (aiRecommendations && Array.isArray(aiRecommendations) && aiRecommendations.length > 0) {
            updateState({ recommendations: aiRecommendations });
            return aiRecommendations;
        }
        try {
            const cached = await AsyncStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                setAiRecommendations(parsed);
                updateState({ recommendations: parsed });
                return parsed;
            }
        } catch {}
        const prompt = `
            Batay sa datos ng mag-aaral: ${JSON.stringify(state.analytics)}
            at antas: ${gradeLevel}, at mga aralin: ${JSON.stringify(state.lessons)},
            pumili ng 5 aralin mula sa mga aralin na pinaka-akmang irekomenda
            upang mapabuti ang pagkatuto ng mag-aaral.
            Ibalik bilang recommendations array na may id, title, at isang maikling reason ng pangungusap para sa bawat aralin.
            Sagutin sa Filipino.
        `;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const data = response.text();
        const parsedData = JSON.parse(data);
        const recommendations = parsedData.recommendations || [];
        const recommendedLessons = state.lessons.filter((lesson) =>
            recommendations.some((rec: { id: string }) => rec.id === lesson.id)
        ).map((lesson) => {
            const rec = recommendations.find((r: { id: string }) => r.id === lesson.id);
            return {
                ...lesson,
                recommendationReason: rec?.reason || "",
            };
        });
        setAiRecommendations(recommendedLessons);
        updateState({ recommendations: recommendedLessons });
        try {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(recommendedLessons));
        } catch {}
        return recommendedLessons;
    }, [state.analytics, state.lessons, gradeLevel, currentUser?.uid, aiRecommendations, setAiRecommendations]);

    useEffect(() => {
        const lessonsChanged = JSON.stringify(prevLessonsRef.current) !== JSON.stringify(state.lessons);
        const analyticsChanged = JSON.stringify(prevAnalyticsRef.current) !== JSON.stringify(state.analytics);
        if ((lessonsChanged || analyticsChanged) && state.lessons.length > 0 && state.analytics) {
            (async () => {
                try {
                    await getAIRecommendations();
                    prevLessonsRef.current = state.lessons;
                    prevAnalyticsRef.current = state.analytics;
                } catch (error) {
                    updateState({ error: "Failed to get AI recommendations" });
                }
            })();
        }
    }, [state.lessons, state.analytics, gradeLevel, getAIRecommendations]);

    return {
        state,
        updateState,
        refreshLessons,
        silentLessonsRefresh,
        refreshOpenLessons,
        silentOpenLessonsRefresh,
        refreshUserAnalytics,
        silentUserAnalyticsRefresh,
        refreshVideos,
        silentVideosRefresh,
        getAIRecommendations,
        error: state.error,
    };
};