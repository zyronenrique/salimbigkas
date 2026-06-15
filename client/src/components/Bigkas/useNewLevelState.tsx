import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/authContext';
import { useBigkasLevels } from './useBigkasLevels';
import { doGetAllGradeLevelLessons, doAddNewPhrases } from '../../api/functions';
import { toast } from 'react-toastify';
import CustomToast from '../Toast/CustomToast';
import { addPhrasesToMode, findOrCreateLevelGroup, updatePhraseList } from '../../utils/helpers';

interface NewLevelState {
    isLoading: boolean;
    isGenerating: boolean;
    isRegister: boolean;
    lessons: any[];
    count: number | null;
    selectedLessonId: string;
    phraseList: any[];
    phrase: string;
    mode: string;
    gradeLevel: string;
    editingKey: string | null;
    originalPhrase: string;
    originalMode: string;
    originalYunitNumber: number;
    originalLevelNumber: number;
    originalGradeLevel: string;
}

export const useNewLevelState = () => {
    const { currentUser, gradeLevels, setLoading } = useAuth();
    const { silentRefresh } = useBigkasLevels();
    const [state, setState] = useState<NewLevelState>({
        isLoading: true,
        isGenerating: false,
        isRegister: false,
        lessons: [],
        count: null,
        selectedLessonId: "",
        phraseList: [],
        phrase: "",
        mode: "normal",
        gradeLevel: gradeLevels?.[0] || "",
        editingKey: null,
        originalPhrase: "",
        originalMode: "",
        originalYunitNumber: 0,
        originalLevelNumber: 0,
        originalGradeLevel: "",
    });

    const modes = useMemo(() => ["easy", "normal", "hard"], []);
    
    const Points = useMemo(() => ({
        easy: 1,
        normal: 2,
        hard: 3,
    }), []);

    // Memoized selected lesson data
    const selectedLessonData = useMemo(() => {
        const lesson = state.lessons.find(l => l.id === state.selectedLessonId);
        return {
            yunitnumber: lesson?.yunitnumber,
            aralinNumero: lesson?.aralinNumero,
            pagbasaUrls: lesson?.fileUrls,
        };
    }, [state.lessons, state.selectedLessonId]);

    // Update state helper
    const updateState = useCallback((updates: Partial<NewLevelState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // Validation helpers
    const validation = useMemo(() => ({
        hasUnsavedEdit: () => Boolean(state.editingKey),
        hasUnsavedPhrases: () => state.phraseList.length > 0,
        isPhraseEmpty: () => !state.phrase.trim(),
        isPhraseExists: () => state.phraseList.some(level => 
            modes.some(mode => 
                level[mode]?.phrases?.some((p: any) => 
                    p.text.toLowerCase() === state.phrase.trim().toLowerCase()
                )
            )
        ),
        canGenerate: () => Boolean(selectedLessonData.pagbasaUrls && state.count && state.count > 0),
        canSave: () => state.phraseList.length > 0 && !state.editingKey,
    }), [state, modes, selectedLessonData]);

    const generatePhrases = useCallback((phrases: string[]) => {
        setState(prev => {
            const { level, isNew } = findOrCreateLevelGroup(
                prev.phraseList, 
                selectedLessonData.yunitnumber, 
                selectedLessonData.aralinNumero, 
                prev.gradeLevel
            );
            const updatedLevel = addPhrasesToMode(level, prev.mode, phrases, Points);
            const newPhraseList = isNew 
                ? [...prev.phraseList, updatedLevel]
                : prev.phraseList.map(l => l.key === level.key ? updatedLevel : l);
            
            return { ...prev, phraseList: newPhraseList };
        });
    }, [selectedLessonData, Points]);

    const addPhrase = useCallback(() => {
        if (validation.isPhraseEmpty()) {
            toast.error(<CustomToast title="Invalid Phrase" subtitle='Phrase cannot be empty.' />);
            return;
        }
        if (validation.isPhraseExists()) {
            toast.error(<CustomToast title="Phrase already exists!" subtitle='Please enter a different phrase.' />);
            return;
        }
        setState(prev => {
            const { level, isNew } = findOrCreateLevelGroup(
                prev.phraseList, 
                selectedLessonData.yunitnumber, 
                selectedLessonData.aralinNumero, 
                prev.gradeLevel
            );
            const updatedLevel = addPhrasesToMode(level, prev.mode, [prev.phrase.trim()], Points);
            const newPhraseList = isNew 
                ? [...prev.phraseList, updatedLevel]
                : prev.phraseList.map(l => l.key === level.key ? updatedLevel : l);
            
            return { ...prev, phraseList: newPhraseList, phrase: "" };
        });
    }, [validation, selectedLessonData, Points]);

    const editPhrase = useCallback((levelKey: string, mode: string, phraseIndex: number) => {
        const level = state.phraseList.find(l => l.key === levelKey);
        if (level && level[mode]?.phrases[phraseIndex]) {
            const phraseObj = level[mode].phrases[phraseIndex];
            const matchingLesson = state.lessons.find(lesson => 
                lesson.yunitnumber === level.yunitNumber && 
                lesson.aralinNumero === level.levelNumber
            );
            setState(prev => ({
                ...prev,
                phrase: phraseObj.text,
                mode: mode,
                gradeLevel: level.gradeLevel,
                selectedLessonId: matchingLesson?.id || "",
                originalPhrase: phraseObj.text,
                originalMode: mode,
                originalYunitNumber: level.yunitNumber,
                originalLevelNumber: level.levelNumber,
                originalGradeLevel: level.gradeLevel,
                editingKey: `${levelKey}-${mode}-${phraseIndex}`,
                phraseList: updatePhraseList(prev.phraseList, levelKey, mode, phraseIndex, modes)
            }));
        }
    }, [state.phraseList, state.lessons, modes]);

    const deletePhrase = useCallback((levelKey: string, mode: string, phraseIndex: number) => {
        setState(prev => {
            const newPhraseList = updatePhraseList(prev.phraseList, levelKey, mode, phraseIndex, modes);
            const isEditingThis = prev.editingKey === `${levelKey}-${mode}-${phraseIndex}`;
            return {
                ...prev,
                phraseList: newPhraseList,
                ...(isEditingThis && {
                    editingKey: null,
                    phrase: "",
                    mode: "normal",
                    gradeLevel: gradeLevels?.[0] || "",
                    originalPhrase: "",
                    originalMode: "",
                    originalYunitNumber: 0,
                    originalLevelNumber: 0,
                    originalGradeLevel: "",
                })
            };
        });
        toast.success(<CustomToast title="Phrase Deleted!" subtitle='Phrase has been deleted successfully.' />);
    }, [modes, gradeLevels]);

    const saveChanges = useCallback(() => {
        if (validation.isPhraseEmpty()) {
            toast.error(<CustomToast title="Invalid Phrase" subtitle='Phrase cannot be empty.' />);
            return;
        }
        if (validation.isPhraseExists()) {
            toast.error(<CustomToast title="Phrase already exists!" subtitle='Please enter a different phrase.' />);
            return;
        }
        if (state.editingKey) {
            setState(prev => {
                const { level, isNew } = findOrCreateLevelGroup(
                    prev.phraseList, 
                    selectedLessonData.yunitnumber, 
                    selectedLessonData.aralinNumero, 
                    prev.gradeLevel
                );
                const updatedLevel = addPhrasesToMode(level, prev.mode, [prev.phrase.trim()], Points);
                const newPhraseList = isNew 
                    ? [...prev.phraseList, updatedLevel]
                    : prev.phraseList.map(l => l.key === level.key ? updatedLevel : l);
                
                return {
                    ...prev,
                    phraseList: newPhraseList,
                    editingKey: null,
                    phrase: "",
                    originalPhrase: "",
                    originalMode: "",
                    originalYunitNumber: 0,
                    originalLevelNumber: 0,
                    originalGradeLevel: "",
                };
            });
            toast.success(<CustomToast title="Phrase Updated!" subtitle='Phrase has been updated successfully.' />);
        }
    }, [validation, state.editingKey, selectedLessonData, Points]);

    const cancelEdit = useCallback(() => {
        if (state.editingKey) {
            setState(prev => {
                const { level, isNew } = findOrCreateLevelGroup(
                    prev.phraseList, 
                    prev.originalYunitNumber, 
                    prev.originalLevelNumber, 
                    prev.originalGradeLevel
                );
                const updatedLevel = addPhrasesToMode(level, prev.originalMode, [prev.originalPhrase], Points);
                const newPhraseList = isNew 
                    ? [...prev.phraseList, updatedLevel]
                    : prev.phraseList.map(l => l.key === level.key ? updatedLevel : l);
                
                const originalLesson = prev.lessons.find(lesson => 
                    lesson.yunitnumber === prev.originalYunitNumber && 
                    lesson.aralinNumero === prev.originalLevelNumber
                );
                
                return {
                    ...prev,
                    phraseList: newPhraseList,
                    selectedLessonId: originalLesson?.id || "",
                    editingKey: null,
                    phrase: "",
                    mode: "normal",
                    gradeLevel: gradeLevels?.[0] || "",
                    originalPhrase: "",
                    originalMode: "",
                    originalYunitNumber: 0,
                    originalLevelNumber: 0,
                    originalGradeLevel: "",
                };
            });
        }
    }, [state.editingKey, state.lessons, Points, gradeLevels]);

    const clearAll = useCallback(() => {
        setState(prev => ({
            ...prev,
            phrase: "",
            editingKey: null,
            originalPhrase: "",
            originalMode: "",
            originalYunitNumber: 0,
            originalLevelNumber: 0,
            originalGradeLevel: "",
        }));
    }, []);

    const saveNewLevel = useCallback(async () => {
        if (state.phraseList.length === 0) {
            toast.error(<CustomToast title="No Phrases" subtitle="Please add at least one phrase before saving." />);
            return;
        }
        if (state.editingKey) {
            toast.error(<CustomToast title="Unsaved Changes" subtitle="Please save or cancel your current edit before saving the level." />);
            return;
        }
        updateState({ isRegister: true });
        setLoading(true);
        try {
            await doAddNewPhrases(currentUser?.uid || "", state.phraseList);
            toast.success(<CustomToast title="New Level Created!" subtitle="Your new level has been successfully created." />);
            setState(prev => ({ ...prev, phraseList: [], phrase: "" }));
            silentRefresh();
        } catch (error) {
            toast.error(<CustomToast title="Error Creating Level" subtitle="There was an error creating your new level." />);
        } finally {
            updateState({ isRegister: false });
            setLoading(false);
        }
    }, [state.phraseList, state.editingKey, currentUser?.uid, silentRefresh, updateState]);

    const actions = useMemo(() => ({
        generatePhrases,
        addPhrase,
        editPhrase,
        deletePhrase,
        saveChanges,
        cancelEdit,
        clearAll,
        saveNewLevel,
    }), [generatePhrases, addPhrase, editPhrase, deletePhrase, saveChanges, cancelEdit, clearAll, saveNewLevel]);

    // Load lessons effect
    useEffect(() => {
        const fetchLessons = async () => {
            setLoading(true);
            updateState({ isLoading: true });
            try {
                const response = await doGetAllGradeLevelLessons(state.gradeLevel) as any;
                updateState({
                    lessons: response?.lessons || [],
                    selectedLessonId: response?.lessons[0]?.id || "",
                    isLoading: false
                });
            } catch (error) {
                console.error("Error fetching lessons:", error);
                updateState({ isLoading: false });
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [state.gradeLevel, updateState]);

    return {
        state: {
            ...state,
            updateState,
            actions,
        },
        updateState,
        selectedLessonData,
        modes,
        Points,
        validation,
        actions,
        currentUser,
        silentRefresh
    };
};