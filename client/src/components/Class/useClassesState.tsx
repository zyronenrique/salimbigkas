import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { doAddClassMember, doDeleteClass, doDeleteClassMember, doGetAllClasses, doGetAllTeacherClasses, dogetAllUsers, doGetClassMembers, doUpdateClassMember } from '../../api/functions';
import { useAuth } from '../../hooks/authContext';
import { useClassContext } from '../../hooks/classContext';
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { filterAndSortMembers, paginateMembers } from '../../utils/helpers';
import { useNavigate } from 'react-router';

interface ClassesState {
    classes: any[];
    allUsers: any[];
    selectedUsers: string[];
    isRegistering: boolean;
    title: string;
    selectInputValue: string;
    searchQuery: string;
    currentPage: number;
    usersPerPage: number;
    showOwners: boolean;
    showMembers: boolean;
    users: any[];
    owners: any[];
    members: any[];
    titleChange: boolean;
    selectedMembers: string[];
    showCheckboxes: boolean;
    showOwnerCheckboxes: boolean;
    showMemberCheckboxes: boolean;
    isDeleteModalOpen: boolean;
    isLoading: boolean;
    error: string | null;
}

type StateUpdater = Partial<ClassesState> | ((prev: ClassesState) => Partial<ClassesState>);

export const useClassesState = () => {
    const navigate = useNavigate();
    const { currentUser, role, setLoading } = useAuth();
    const { selectedClass } = useClassContext();
    const [state, setState] = useState<ClassesState>({
        classes: [],
        allUsers: [],
        selectedUsers: [],
        isRegistering: false,
        title: '',
        selectInputValue: '',
        searchQuery: '',
        currentPage: 1,
        usersPerPage: 10,
        showOwners: true,
        showMembers: false,
        users: [],
        owners: [],
        members: [],
        titleChange: false,
        selectedMembers: [],
        showCheckboxes: false,
        showOwnerCheckboxes: false,
        showMemberCheckboxes: false,
        isDeleteModalOpen: false,
        isLoading: true,
        error: null
    });
    const currentUserRef = useRef(currentUser?.uid);
    
    const updateState = useCallback((updates: StateUpdater) => {
        setState(prev => {
            const updateObj = typeof updates === "function" ? updates(prev) : updates;
            return { ...prev, ...updateObj };
        });
    }, []);
    
    const fetchClasses = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            let response;
            if (role === "Admin") {
              response = await doGetAllClasses() as any;
            } else {
              response = await doGetAllTeacherClasses(currentUser?.uid || "") as any;
            }
            updateState({
                classes: response?.classes || [],
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch quizzes",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, role]);

    const fetchMembers = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await doGetClassMembers(selectedClass.id) as any;
            const owners = response?.members.filter(
                (user: any) => user.title === "Owner",
            );
            const members = response?.members.filter(
                (user: any) => user.title === "Member",
            );
            updateState({
                users: response?.members || [],
                owners,
                members,
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch members",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, role]);
    
    const fetchUsers = useCallback(async (showLoading = true) => {
        if (!currentUser?.uid || !role || !selectedClass?.id) {
            updateState({ isLoading: false, error: null, allUsers: [] });
            return;
        }
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await dogetAllUsers(currentUser.uid, role, selectedClass.id) as any;
            updateState({
                allUsers: response?.users || [],
                isLoading: false,
                error: null
            });
        } catch (error) {
            updateState({
                error: "Failed to fetch users",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, role]);


    // Initial fetch
    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Refresh classes (with loading indicator)
    const refreshClasses = useCallback(() => {
        return fetchClasses(true);
    }, [fetchClasses]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
        return fetchClasses(false);
    }, [fetchClasses]);

    const refreshMembers = useCallback(() => {
        return fetchMembers(true);
    }, [fetchMembers]);

    const silentRefreshMembers = useCallback(() => {
        return fetchMembers(false);
    }, [fetchMembers]);

    const refreshUsers = useCallback(() => {
        return fetchUsers(true);
    }, [fetchUsers]);

    const silentRefreshUsers = useCallback(() => {
        return fetchUsers(false);
    }, [fetchUsers]);

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

    const handleTitleChange = useCallback(async (memberId: string, title: string) => {
        try {
            updateState({ titleChange: true });
            setLoading(true);
            const response = await doUpdateClassMember(
                currentUser?.uid || "",
                selectedClass.id,
                memberId,
                title,
            ) as any;
            if (response?.success) {
                toast.success(
                    <CustomToast
                        title="Congratulation!"
                        subtitle="Member title updated successfully."
                    />,
                );
                silentRefreshMembers();
            } else {
                toast.error(
                    <CustomToast
                        title="Something went wrong!"
                        subtitle="Failed to update member title. Please try again."
                    />,
                );
            }
        } catch (error) {
            toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle="Error updating member title"
                />,
            );
        } finally {
            updateState({ titleChange: false });
            setLoading(false);
        }
    }, []);

    const filtered = filterAndSortMembers(state.users, state.searchQuery);
    const { paged, safePage } = paginateMembers(
        filtered,
        state.currentPage,
        state.usersPerPage,
    );

    const handleSearch = useCallback((query: string) => {
        updateState({ searchQuery: query, currentPage: 1 });
    }, []);

    useEffect(() => {
        if (state.currentPage !== safePage) {
            updateState({ currentPage: safePage });
        }
    }, [safePage, state.currentPage]);

    const handleRowHold = useCallback(() => {
        updateState({ showCheckboxes: true, showOwnerCheckboxes: true, showMemberCheckboxes: true });
    }, []);

    const handleDeleteClassMember = useCallback(async () => {
        try {
            setLoading(true);
            const response = await doDeleteClassMember(
                currentUser?.uid || "",
                selectedClass.id,
                state.selectedMembers,
            ) as any;
            if (response) {
                toast.success(
                    <CustomToast
                        title="Congratulation!"
                        subtitle="Selected member(s) deleted successfully."
                    />,
                );
                silentRefreshMembers();
                updateState({ selectedMembers: [], isDeleteModalOpen: false, showCheckboxes: false, showOwnerCheckboxes: false, showMemberCheckboxes: false });
            } else {
                toast.error(
                    <CustomToast
                        title="Something went wrong!"
                        subtitle="Failed to delete these members. Please try again."
                    />,
                );
                updateState({ selectedMembers: [], isDeleteModalOpen: false, showCheckboxes: false, showOwnerCheckboxes: false, showMemberCheckboxes: false });
            }
        } catch (error) {
            toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle="Failed to delete these members. Please try again."
                />,
            );
            updateState({ selectedMembers: [], isDeleteModalOpen: false, showCheckboxes: false, showOwnerCheckboxes: false, showMemberCheckboxes: false });
        } finally {
            setLoading(false);
        }
    }, [state.selectedMembers, currentUser?.uid, selectedClass?.id, silentRefreshMembers, updateState]);

    const userOptions = state.allUsers
        .filter((user) => user?.gradeLevel && user?.gradeLevel === selectedClass?.gradeLevel || user?.gradeLevels && user?.gradeLevels.includes(selectedClass?.gradeLevel))
        .map((user) => ({
            value: user?.uid,
            label: user?.displayName,
            email: user?.email,
            role: user?.role,
            gradeLevel: user?.gradeLevel,
            gradeLevels: user?.gradeLevels,
            photoURL: user?.photoURL,
        }));

    const groupedUsers = useMemo(() => (
        ["Student", "Teacher", "Admin"].map((role) => ({
            label: role,
            options: userOptions.filter((user) => user.role === role),
        }))
    ), [userOptions]);

    const loadOptions = useCallback((inputValue: string, callback: (options: any[]) => void) => {
        const search = inputValue.replace(/\s+/g, '').toLowerCase();
        if (!search) {
            callback(groupedUsers);
            return;
        }
        setTimeout(() => {
        const filteredGroups = groupedUsers
            .map(group => ({
                ...group,
                options: group.options.filter(
                (opt: any) =>
                    opt.label.replace(/\s+/g, '').toLowerCase().includes(search) ||
                    opt.email.replace(/\s+/g, '').toLowerCase().includes(search)
                ),
            }))
            .filter(group => group.options.length > 0);
        callback(filteredGroups);
        }, 1000);
    }, [groupedUsers]);

    const handleRegister = useCallback(async () => {
        if (!state.isRegistering) {
            setLoading(true);
            updateState({ isRegistering: true, error: "" });
            try {
                const response = await doAddClassMember(
                    currentUser?.uid || "",
                    selectedClass.id,
                    selectedClass.gradeLevel,
                    state.selectedUsers,
                    state.title,
                ) as any;
                if (response?.success) {
                    toast.success(
                        <CustomToast
                            title="Congratulation!"
                            subtitle="User(s) added successfully"
                        />,
                    );
                    if (response.errors && response.errors.length > 0) {
                        response.errors.forEach((err: any) => {
                            toast.info(
                                <CustomToast
                                    title={err.error}
                                    subtitle={`User: ${err.displayName}`}
                                />
                            );
                        });
                    }
                    silentRefreshMembers();
                    updateState({ isRegistering: false });
                    navigate(-1);
                } else {
                    toast.error(
                        <CustomToast
                        title="Something went wrong!"
                        subtitle="Failed to add member. Please try again."
                        />,
                    );
                }
            } catch (error) {
                updateState({ isRegistering: false, error: "An error occurred. Please try again." });
            } finally {
                updateState({ isRegistering: false });
                setLoading(false);
            }
        }
    }, [currentUser, selectedClass, state.selectedUsers, state.title, silentRefreshMembers, navigate]);

    const handleDeleteClass = useCallback(async (selectedClassId: string) => {
        try {
            setLoading(true);
            const response = await doDeleteClass(
                currentUser?.uid || "",
                selectedClassId,
            ) as any;
            if (response?.success) {
                toast.success(
                <CustomToast
                    title="Congratulation!"
                    subtitle="Selected class deleted successfully."
                />,
                );
                silentRefresh();
                updateState({ isDeleteModalOpen: false });
            } else {
                toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle="Failed to delete this class. Please try again."
                />,
                );
                updateState({ isDeleteModalOpen: false });
            }
        } catch (error) {
            toast.error(
                <CustomToast
                title="Something went wrong!"
                subtitle="Failed to delete this class. Please try again."
                />,
            );
            updateState({ isDeleteModalOpen: false });
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, updateState]);

    const allClassIds = state.classes.map(cls => ({
        id: cls.id,
        gradeLevel: cls.gradeLevel
    }));

    return {
        state,
        updateState,
        refreshClasses,
        silentRefresh,
        refreshMembers,
        silentRefreshMembers,
        refreshUsers,
        silentRefreshUsers,
        handleTitleChange,
        paged,
        handleSearch,
        handleRowHold,
        handleDeleteClassMember,
        handleDeleteClass,
        groupedUsers,
        loadOptions,
        handleRegister,
        allClassIds,
        error: state.error,
    };
};