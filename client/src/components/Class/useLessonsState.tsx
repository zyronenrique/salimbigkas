import { useState, useEffect, useCallback, useRef } from 'react';
import { doArchiveorUnarchiveLesson, doDeleteLesson, doGetAllYunitLessons } from '../../api/functions';
import { useAuth } from '../../hooks/authContext';
import { useClassContext } from '../../hooks/classContext';
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { useNavigate } from 'react-router-dom';
import { useLogReg } from '../Modals/LogRegProvider';

interface LessonsState {
    lessons: any[];
    lessonsDraft: any[];
    archivedLessons: any[];
    isLoading: boolean;
    showDeleteModal: boolean;
    showMgaAralin: boolean;
    showIsDraft: boolean;
    isArchive: boolean;
    showArchive: boolean;
    error: string | null;
}

export const useLessonsState = () => {
    const navigate = useNavigate();
    const { currentUser, role, gradeLevel, classId, setLoading } = useAuth();
    const { formattedGradeLevel } = useLogReg();
    const { selectedYunit, selectedClass, setIsEditMode, setSelectedLesson, setNextLessonNumber, setIsQuiz, setIsSeatWork } = useClassContext();
    const [state, setState] = useState<LessonsState>({
        lessons: [],
        lessonsDraft: [],
        archivedLessons: [],
        isLoading: true,
        showDeleteModal: false,
        showMgaAralin: true,
        showIsDraft: true,
        isArchive: false,
        showArchive: true,
        error: null
    });
    const currentUserRef = useRef(currentUser?.uid);

    const updateState = useCallback((updates: Partial<LessonsState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);
    
    const fetchLessons = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllYunitLessons(
                currentUser?.uid || "",
                classId || selectedClass.id,
                selectedYunit.id,
                gradeLevel || selectedClass.gradeLevel,
            ) as any;
            const draftLessons = response.lessons.filter(
                (lesson: any) => !lesson.isArchived && lesson.isDraft === true,
            );
            const notDraftLessons = response.lessons.filter(
                (lesson: any) => !lesson.isArchived && lesson.isDraft === false,
            );
            const archivedLessons = response.lessons.filter(
                (lesson: any) => lesson.isArchived === true,
            );
            updateState({
                lessons: notDraftLessons,
                lessonsDraft: draftLessons,
                archivedLessons: archivedLessons,
                isLoading: false,
                error: null
            });
            const highestLessonNumber = response.lessons.reduce((max: number, lesson: any) => {
                const num = parseInt(lesson.aralinNumero, 10);
                return num > max ? num : max;
            }, 0);
            setNextLessonNumber(highestLessonNumber + 1);
            setLoading(false);
        } catch (error) {
            updateState({
                error: "Failed to fetch lessons",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, classId, selectedClass?.id, selectedYunit?.id, gradeLevel, updateState]);

    // Initial fetch
    useEffect(() => {
        fetchLessons();
    }, []);

    // Refresh yunits (with loading indicator)
    const refreshLessons = useCallback(() => {
        return fetchLessons(true);
    }, [fetchLessons]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
        return fetchLessons(false);
    }, [fetchLessons]);

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
    
    const deleteLesson = useCallback(async (lessonId: string) => {
        if (!currentUser?.uid) return;
        updateState({ isLoading: true, error: null });
        setLoading(true);
        try {
            await doDeleteLesson(currentUser.uid, selectedClass.id, selectedYunit.id, lessonId, selectedClass.gradeLevel);
            toast.success(
                <CustomToast
                    title="Lesson deleted!"
                    subtitle="The lesson has been successfully deleted."
                />,
            );
            silentRefresh();
            updateState({ isLoading: false, showDeleteModal: false });
        } catch (error) {
            toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle="Failed to delete this lesson. Please try again."
                />,
            );
            updateState({ isLoading: false, showDeleteModal: false });
        } finally {
            setLoading(false);
        }
    }, [currentUser, selectedYunit, selectedClass]);

    const ArchiveorUnarchiveLesson = useCallback(async (lessonId: string, isArchive: boolean) => {
        if (!currentUser?.uid) return;
        updateState({ isLoading: true, error: null });
        setLoading(true);
        try {
            await doArchiveorUnarchiveLesson(currentUser.uid, selectedClass.id, selectedYunit.id, lessonId, selectedClass?.gradeLevel, isArchive);
            toast.success(
                <CustomToast
                    title={isArchive ? "Lesson archived!" : "Lesson unarchived!"}
                    subtitle={`The lesson has been successfully ${isArchive ? "archived" : "unarchived"}.`}
                />,
            );
            silentRefresh();
            updateState({ isLoading: false, showDeleteModal: false });
        } catch (error) {
            toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle="Failed to archive/unarchive this lesson. Please try again."
                />,
            );
            updateState({ isLoading: false, showDeleteModal: false });
        } finally {
            setLoading(false);
        }
    }, [currentUser, selectedYunit, selectedClass]);

    const handleArchive = useCallback(async () => {
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons/archive`);
    }, [navigate, role, formattedGradeLevel, selectedClass, selectedYunit]);

    const handleAddLesson = useCallback(() => {
        setIsEditMode(false);
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass.id}/my-courses/yunit-${selectedYunit.yunitnumber}/lessons/add`);
    }, [navigate, role, formattedGradeLevel, selectedClass, selectedYunit, setIsEditMode]);

    const handleEditLesson = useCallback((lesson: any) => {
        setIsEditMode(true);
        setSelectedLesson(lesson);
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons/lesson/${lesson.id}/edit`);
    }, [navigate, role, formattedGradeLevel, selectedClass, selectedYunit, setSelectedLesson, setIsEditMode]);

    const handleShowLesson = useCallback((lesson: any) => {
        setSelectedLesson(lesson);
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons/lesson/${lesson.id}/about`);
    }, [navigate, role, formattedGradeLevel, selectedClass, selectedYunit, setSelectedLesson]);

    const handleLessonDraft = useCallback((lesson: any) => {
        setSelectedLesson(lesson);
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons/select-type`);
    }, [navigate, role, formattedGradeLevel, selectedClass, selectedYunit, setSelectedLesson]);

    const handleAddQuiz = useCallback((lesson: any) => {
        setIsQuiz(true);
        setIsSeatWork(false);
        setSelectedLesson(lesson);
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons/quiz/add`);
    }, [navigate, role, formattedGradeLevel, selectedClass, selectedYunit, setSelectedLesson]);

    const handleSeatWork = useCallback((lesson: any) => {
        setIsSeatWork(true);
        setIsQuiz(false);
        setSelectedLesson(lesson);
        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons/quiz/add`);
    }, [navigate, role, formattedGradeLevel, selectedClass, selectedYunit, setSelectedLesson]);

    return {
        state,
        updateState,
        refreshLessons,
        silentRefresh,
        deleteLesson,
        ArchiveorUnarchiveLesson,
        handleArchive,
        handleAddLesson,
        handleEditLesson,
        handleShowLesson,
        handleLessonDraft,
        handleAddQuiz,
        handleSeatWork,
        error: state.error,
    };
};