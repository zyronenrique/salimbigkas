import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/authContext';
import { useClassContext } from '../../hooks/classContext';
import {
    model,
    storage,
    storageRef,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "../../firebase/firebase";
import { fileToGenerativePart, getPdfFileName, urlToFile } from "../../utils/helpers";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { doCreateLesson, doUpdateLesson } from '../../api/functions';
import { useNavigate } from 'react-router-dom';
import { useLogReg } from '../Modals/LogRegProvider';

interface LessonFormState {
    lessonNumber: string;
    isDisabled: boolean;
    lessonTitle: string;
    lessonDescription: string;
    lessonObjectives: string[];
    isDraft: boolean;
    isContinue: boolean;
    isGenerating: boolean;
    pagbasaFiles: File[];
    isLoading: boolean;
    errorMessage: string;
}

export const useLessonFormState = () => {
    const navigate = useNavigate();
    const { currentUser, role, setLoading } = useAuth();
    const { formattedGradeLevel } = useLogReg();
    const { selectedYunit, selectedClass, nextLessonNumber, selectedLesson, isEditMode, setSelectedLesson } = useClassContext();
    const [state, setState] = useState<LessonFormState>({
        lessonNumber: isEditMode ? selectedLesson.aralinNumero : nextLessonNumber?.toString() || "",
        isDisabled: isEditMode ? false : true,
        lessonTitle: isEditMode ? selectedLesson.aralinPamagat : "",
        lessonDescription: isEditMode ? selectedLesson.aralinPaglalarawan : "",
        lessonObjectives: isEditMode ? selectedLesson.aralinLayunin : [],
        isDraft: isEditMode ? selectedLesson.isDraft : true,
        isContinue: false,
        isGenerating: false,
        pagbasaFiles: [],
        isLoading: true,
        errorMessage: ""
    });

    useEffect(() => {
        const fetchFiles = async () => {
            if (isEditMode && selectedLesson?.fileUrls) {
                const files = await Promise.all(
                    selectedLesson.fileUrls.map((url: string) => {
                        const filename = getPdfFileName(url);
                        const mimeType = "application/pdf";
                        return urlToFile(url, filename, mimeType);
                    })
                );
                setState(prev => ({
                    ...prev,
                    pagbasaFiles: files,
                    isLoading: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    pagbasaFiles: [],
                    isLoading: false
                }));
            }
        };
        fetchFiles();
    }, [isEditMode, selectedLesson]);

    const updateState = useCallback((updates: Partial<LessonFormState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);
    
    const uploadFileAndGetUrl = useCallback(async (file: File, gradeLevel?: string, title?: string) => {
        const filePath = `lessons/${gradeLevel}/${Date.now()}_${title?.replace(/[^a-zA-Z0-9]/g, "_") || file.name}`;
        const fileRef = storageRef(storage, filePath);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
    }, []);

    const urlsToRemove = useCallback(async(fileUrls: string[], pagbasaUrls: string[]) => {
        const urlsToRemove = fileUrls.filter(url => !pagbasaUrls.includes(url));
        const promises = urlsToRemove.map(async (url) => {
            const storagePath = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
            const fileRef = storageRef(storage, storagePath);
            await deleteObject(fileRef);
        });
        await Promise.all(promises);
    }, []);

    const handleGenerateLessonInfo = useCallback(async () => {
        updateState({ errorMessage: "" });
        if (state.pagbasaFiles.length === 0) {
            updateState({ errorMessage: "Mag-upload muna ng mga PDF file ng aralin." });
            return;
        }
        updateState({ isGenerating: true });
        setLoading(true);
        try {
            const prompt = `
                Basahin ang lahat ng mga PDF na ito ng aralin at:
                1. Bumuo ng isang malinaw at angkop na pamagat ng aralin (title). Isulat sa Filipino at ilagay sa "title".
                2. Ibuod ang kabuuang nilalaman sa 5 pangungusap na madaling maintindihan ng mga mag-aaral. Isulat sa Filipino at ilagay sa "summary".
                3. Bumuo ng 4 malinaw na layunin ng aralin (objectives) na naaangkop sa antas ng mag-aaral. Isulat sa Filipino at ilagay sa "objectives" bilang array ng mga pangungusap.
                Ibalik ang sagot bilang JSON object na may "title" (string), "summary" (string), at "objectives" (array ng mga pangungusap).
                Halimbawa ng format:
                {
                "title": "Mga Bahagi ng Halaman",
                "summary": "Ang araling ito ay tumatalakay sa mga pangunahing bahagi ng halaman at ang kanilang gamit. Layunin nitong palalimin ang pag-unawa ng mga mag-aaral sa kahalagahan ng halaman sa kapaligiran.",
                "objectives": [
                    "Matukoy ang iba't ibang bahagi ng halaman.",
                    "Maipaliwanag ang gamit ng bawat bahagi.",
                    "Mahalagahan ang papel ng halaman sa kalikasan."
                ]
                }
            `;
            const pdfParts = await Promise.all(state.pagbasaFiles.map(fileToGenerativePart));
            const result = await model.generateContent([prompt, ...pdfParts]);
            const res = result.response;
            const data = res.text();
            const parsedData = JSON.parse(data);
            updateState({ lessonTitle: parsedData.title || "" });
            updateState({ lessonDescription: parsedData.summary || "" });
            updateState({ lessonObjectives: Array.isArray(parsedData.objectives) ? parsedData.objectives : [parsedData.objectives || ""] });
        } catch (error) {
            updateState({ errorMessage: "Hindi maisagawa ang pagbuo ng summary at objectives. Pakisubukan muli." });
        } finally {
            updateState({ isGenerating: false });
            setLoading(false);
        }
    }, [state.pagbasaFiles]);

    const handleGenerateDescription = useCallback(async () => {
        updateState({ errorMessage: "" });
        if (state.pagbasaFiles.length === 0) {
            updateState({ errorMessage: "Mag-upload muna ng mga PDF file ng aralin." });
            return;
        }
        updateState({ isGenerating: true });
        setLoading(true);
        try {
            const prompt = `
                Basahin ang lahat ng mga PDF na ito ng aralin at ibuod ang kabuuang nilalaman sa 5 pangungusap na madaling maintindihan ng mga mag-aaral. Isulat sa Filipino.
                Ibalik ang sagot bilang JSON object na may "summary" (string) lamang.
                Halimbawa ng format:
                {
                "summary": "Ang araling ito ay tumatalakay sa mga pangunahing bahagi ng halaman at ang kanilang gamit."
                }
            `;
            const pdfParts = await Promise.all(state.pagbasaFiles.map(fileToGenerativePart));
            const result = await model.generateContent([prompt, ...pdfParts]);
            const res = result.response;
            const data = res.text();
            const parsedData = JSON.parse(data);
            updateState({ lessonDescription: parsedData.summary });
        } catch (error) {
            updateState({ errorMessage: "Hindi maisagawa ang pagbubuod. Pakisubukan muli." });
        } finally {
            updateState({ isGenerating: false });
            setLoading(false);
        }
    }, [state.pagbasaFiles]);

    const handleGenerateObjectives = useCallback(async () => {
        updateState({ errorMessage: "" });
        if (state.pagbasaFiles.length === 0) {
            updateState({ errorMessage: "Mag-upload muna ng mga PDF file ng aralin." });
            return;
        }
        updateState({ isGenerating: true });
        setLoading(true);
        try {
            const prompt = `
                Basahin ang lahat ng mga PDF na ito ng aralin at bumuo ng 4 malinaw na layunin ng aralin (objectives) na naaangkop sa antas ng mag-aaral. Isulat sa Filipino.
                Ibalik ang sagot bilang JSON object na may "objectives" (array ng mga pangungusap) lamang.
                Halimbawa ng format:
                {
                "objectives": [
                    "Matukoy ang iba't ibang bahagi ng halaman.",
                    "Maipaliwanag ang gamit ng bawat bahagi.",
                    "Mahalagahan ang papel ng halaman sa kalikasan."
                ]
                }
            `;
            const pdfParts = await Promise.all(state.pagbasaFiles.map(fileToGenerativePart));
            const result = await model.generateContent([prompt, ...pdfParts]);
            const res = result.response;
            const data = res.text();
            const parsedData = JSON.parse(data);
            updateState({ lessonObjectives: Array.isArray(parsedData.objectives) ? parsedData.objectives : [parsedData.objectives || ""] });
        } catch (error) {
            updateState({ errorMessage: "Hindi maisagawa ang pagbuo ng objectives. Pakisubukan muli." });
        } finally {
            updateState({ isGenerating: false });
            setLoading(false);
        }
    }, [state.pagbasaFiles]);

    const handleContinue = useCallback(async () => {
        if (state.pagbasaFiles.length === 0) {
            updateState({ errorMessage: "Upload PDF files first." });
            return;
        }
        if (!state.isContinue) {
            updateState({ isContinue: true });
            setLoading(true);
            try {
                let response = null;
                const pagbasaUrls = await Promise.all(
                    state.pagbasaFiles.map((file) => uploadFileAndGetUrl(file, selectedClass.gradeLevel))
                );
                if (isEditMode) {
                    await urlsToRemove(selectedLesson.fileUrls, pagbasaUrls);
                    response = await doUpdateLesson(
                        currentUser?.uid || "",
                        selectedYunit.id,
                        selectedLesson.id,
                        selectedClass.gradeLevel,
                        state.lessonNumber,
                        state.lessonTitle,
                        state.lessonDescription,
                        state.lessonObjectives,
                        pagbasaUrls,
                    ) as any;
                    if (response?.success) {
                        toast.success(
                            <CustomToast
                                title="Congratulation!"
                                subtitle="Matagumpay kang na bago ang aralin."
                            />,
                        );
                        updateState({ isContinue: false });
                        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons`);
                    }
                } else {
                    response = await doCreateLesson(
                        currentUser?.uid || "",
                        selectedClass.id,
                        selectedYunit.id,
                        selectedYunit.yunitnumber,
                        selectedClass.gradeLevel,
                        state.isDraft,
                        state.lessonNumber,
                        state.lessonTitle,
                        state.lessonDescription,
                        state.lessonObjectives,
                        pagbasaUrls,
                    ) as any;
                    if (response?.success && response?.lesson) {
                        toast.success(
                            <CustomToast
                                title="Congratulation!"
                                subtitle="Matagumpay kang lumikha ng isang bagong draft ng aralin."
                            />,
                        );
                        updateState({ isContinue: false });
                        setSelectedLesson(response.lesson);
                        navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/my-courses/yunit-${selectedYunit?.yunitnumber}/lessons/select-type`);
                    } else {
                        toast.error(
                            <CustomToast
                            title="Something went wrong!"
                            subtitle="May nangyaring mali sa pagproseso ng iyong aralin. Pakisubukan muli."
                            />,
                        );
                        updateState({ isContinue: false });
                    }
                }
            } catch (error) {
                updateState({
                    errorMessage:
                        "May nangyaring mali sa pagproseso ng iyong aralin. Pakisubukan muli.",
                });
                updateState({ isContinue: false });
            } finally {
                updateState({ isContinue: false });
                setLoading(false);
            }
        }
    }, [state.isContinue, selectedClass.gradeLevel, state.lessonNumber, state.lessonTitle, state.lessonDescription, state.pagbasaFiles]);

    return {
        state,
        updateState,
        handleGenerateLessonInfo,
        handleGenerateDescription,
        handleGenerateObjectives,
        handleContinue,
        errorMessage: state.errorMessage,
    };
};