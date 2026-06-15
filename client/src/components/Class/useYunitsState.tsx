import { useState, useEffect, useCallback, useRef } from 'react';
import { doCreateYunit, doDeleteYunit, doGetAllYunits, doUnlockorLockYunitForClass, doUpdateYunit } from '../../api/functions';
import { useAuth } from '../../hooks/authContext';
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { useClassContext } from '../../hooks/classContext';
import {
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "../../firebase/firebase";
import imageCompression from 'browser-image-compression';

interface YunitsState {
  yunits: any[];
  selectedYunitId: string | null;
  isYunitModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isUnlock: boolean;
  isRegistering: boolean;
  yunitNumber: string;
  yunitName: string;
  imageFile: File | null;
  imageUrl: string;
  status: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useYunitsState = () => {
    const { currentUser, classId, setLoading } = useAuth();
    const { isEditMode, setIsEditMode, selectedYunit, setSelectedYunit, selectedClass } = useClassContext();
    const [state, setState] = useState<YunitsState>({
        yunits: [],
        selectedYunitId: "",
        isYunitModalOpen: false,
        isDeleteModalOpen: false,
        isUnlock: false,
        isRegistering: false,
        yunitNumber: isEditMode ? selectedYunit?.yunitnumber : "",
        yunitName: isEditMode ? selectedYunit?.yunitname : "",
        imageFile: null,
        imageUrl: isEditMode ? selectedYunit?.imageurl : "",
        status: true,
        isLoading: true,
        error: null
    });
    const currentUserRef = useRef(currentUser?.uid);
    
    const updateState = useCallback((updates: Partial<YunitsState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);
    
    const fetchYunits = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetAllYunits(classId || selectedClass?.id) as any;
            updateState({
                yunits: response?.yunits || [],
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch yunits",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, [classId, selectedClass?.id, updateState]);

    // Initial fetch
    useEffect(() => {
        fetchYunits();
    }, []);

    // Refresh yunits (with loading indicator)
    const refreshYunits = useCallback(() => {
        return fetchYunits(true);
    }, [fetchYunits]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
        return fetchYunits(false);
    }, [fetchYunits]);

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
    
    const userId = currentUser?.uid || "";
    const handleUnlockorLockYunit = useCallback(async (yunitId: string, status: boolean) => {
        updateState({ isUnlock: true });
        setLoading(true);
        try {
            const response = await doUnlockorLockYunitForClass(
                userId,
                selectedClass?.id,
                yunitId,
                status
            ) as any;
            if (response?.success) {
                toast.success(
                    <CustomToast
                        title={`Yunit ${status ? "unlocked" : "locked"}!`}
                        subtitle={`The yunit has been successfully ${status ? "unlocked" : "locked"} for this class.`}
                    />,
                );
                silentRefresh();
            }
        } catch (error) {
            toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle={`Failed to ${status ? "unlock" : "lock"} this yunit for this class. Please try again.`}
                />,
            );
        } finally {
            updateState({ isUnlock: false });
            setLoading(false);
        }
    }, [userId, selectedClass?.id, silentRefresh]);

    const handleAddYunit = useCallback(() => {
        setIsEditMode(false);
        updateState({ 
            isYunitModalOpen: true,
            selectedYunitId: "",
        });
    }, []);

    const handleEditYunit = useCallback((yunitData: any) => {
        setIsEditMode(true);
        updateState({ isYunitModalOpen: true });
        setSelectedYunit(yunitData);
    }, [setIsEditMode, updateState]);

    const handleDeleteYunit = useCallback(async () => {
        if (!state.selectedYunitId) return;
        updateState({ isLoading: true, error: null });
        setLoading(true);
        try {
            await doDeleteYunit(userId, state.selectedYunitId);
            toast.success(
                <CustomToast
                    title="Yunit deleted!"
                    subtitle="The yunit has been successfully deleted."
                />
            );
            updateState({ isLoading: false, isDeleteModalOpen: false });
            silentRefresh();
        } catch (error) {
            toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle="Failed to delete this yunit. Please try again."
                />
            );
            updateState({ isLoading: false, isDeleteModalOpen: false });
        } finally {
            updateState({ selectedYunitId: null });
            setLoading(false);
        }
    }, [state.selectedYunitId, userId, silentRefresh, updateState]);

    const handleImage = useCallback(async (file: File) => {
        if (!file) return;
        if (file && file.size > 2 * 1024 * 1024) {
            try {
                const options = {
                    maxSizeMB: 2,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(
                    file,
                    options,
                );
                updateState({ error: null, imageFile: compressedFile as File, imageUrl: URL.createObjectURL(compressedFile as File) });
            } catch (err) {
                updateState({ error: "Failed to compress image. Please try a smaller image.", imageFile: null, imageUrl: "" });
            }
        }
        updateState({ error: null, imageFile: file });
    }, [updateState]);

    const handleRegister = useCallback(async () => {
        if (!state.isRegistering) {
            updateState({ isRegistering: true });
            setLoading(true);
            let imageRef;
            try {
                let imagePath: string = "";
                let newImageUrl = state.imageUrl;
                if (state.imageFile) {
                    imagePath = `yunits/${Date.now()}_${state.imageFile.name}`;
                    imageRef = storageRef(storage, `yunits/${Date.now()}_${state.imageFile.name}`);
                    await uploadBytes(imageRef, state.imageFile);
                    newImageUrl = await getDownloadURL(imageRef);
                }
                if (isEditMode) {
                    await doUpdateYunit(
                        userId,
                        selectedYunit?.id,
                        Number(state.yunitNumber),
                        state.yunitName,
                        imagePath,
                        newImageUrl,
                    );
                } else {
                    await doCreateYunit(
                        userId,
                        state.status,
                        Number(state.yunitNumber),
                        state.yunitName,
                        imagePath,
                        newImageUrl,
                    );
                }
                toast.success(
                    <CustomToast
                        title="Congratulation!"
                        subtitle={`Yunit ${isEditMode ? "updated" : "added"} successfully!`}
                    />,
                );
                fetchYunits();
            } catch (error) {
                if (imageRef) await deleteObject(imageRef);
                updateState({ error: "Yunit number or name already exists. Please choose a different one." });
            } finally {
                updateState({ isRegistering: false });
                setLoading(false);
            }
        }
    }, [classId, selectedClass?.id, updateState, state, userId, isEditMode, selectedYunit]);

    return {
        state,
        updateState,
        refreshYunits,
        silentRefresh,
        handleUnlockorLockYunit,
        handleAddYunit,
        handleEditYunit,
        handleDeleteYunit,
        handleImage,
        handleRegister,
        error: state.error,
    };
};