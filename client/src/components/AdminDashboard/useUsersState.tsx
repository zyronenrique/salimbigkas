import { useState, useEffect, useCallback, useRef } from 'react';
import { dogetAllUsers, doSetUserStatus } from '../../api/functions';
import { useAuth } from '../../hooks/authContext';
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { filterAndSortUsers, paginate, useLongPress } from '../../utils/helpers';

interface UsersState {
  users: any[];
  userStatus: boolean;
  selectedUsers: string[];
  showCheckboxes: boolean;
  isDeleteModalOpen: boolean;
  currentPage: number;
  usersPerPage: number;
  searchQuery: string;
  selectedRole: string;
  sortOrder: string;
  emailVerified: string;
  statusFilter: string;
  isLoading: boolean;
  error: string | null;
}

export const useUsersState = () => {
    const { currentUser, role, gradeLevels, setLoading } = useAuth();
    const [state, setState] = useState<UsersState>({
        users: [],
        userStatus: false,
        selectedUsers: [],
        showCheckboxes: false,
        isDeleteModalOpen: false,
        currentPage: 1,
        usersPerPage: 10,
        searchQuery: "",
        selectedRole: "",
        sortOrder: "asc",
        emailVerified: "",
        statusFilter: "",
        isLoading: true,
        error: null,
    });
    const currentUserRef = useRef(currentUser?.uid);

    const updateState = useCallback((updates: Partial<UsersState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const fetchUsers = useCallback(async (showLoading = true) => {
        if (!currentUser?.uid || !role) return;
        if (showLoading) {
            setLoading(true);
            updateState({ isLoading: true, error: null });
        }
        try {
            const response = await dogetAllUsers(currentUser.uid, role) as any;
            updateState({
                users: response?.users || [],
                isLoading: false,
                error: null
            });
        } catch (err) {
            updateState({
                error: "Failed to fetch users",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    }, [gradeLevels]);

    // Initial fetch
    useEffect(() => {
        fetchUsers();
    }, []);

    // Refresh users (with loading indicator)
    const refreshUsers = useCallback(() => {
       return fetchUsers(true);
    }, [fetchUsers]);

    // Silent refresh (without loading indicator)
    const silentRefresh = useCallback(() => {
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

    const handleStatusChange = useCallback(async (uid: string, status: boolean) => {
        try {
            updateState({ userStatus: true });
            const response = await doSetUserStatus(currentUser?.uid || "", uid, status) as any;
            if (response?.success) {
                toast.success(
                    <CustomToast
                        title="Congratulation!"
                        subtitle="User status change successfully."
                    />,
                );
                silentRefresh();
            } else {
                toast.error(
                    <CustomToast
                        title="Something went wrong!"
                        subtitle="Failed to change user status. Please try again."
                    />,
                );
            }
        } catch (error) {
            toast.error(
                <CustomToast
                    title="Something went wrong!"
                    subtitle="Failed to update user status. Please try again."
                />,
            );
        } finally {
            updateState({ userStatus: false });
        }
    }, []);

    const filtered = filterAndSortUsers(
        state.users,
        state.searchQuery,
        state.selectedRole,
        state.sortOrder,
        state.emailVerified,
        state.statusFilter,
    );
    const { paged, totalPages, safePage } = paginate(
        filtered,
        state.currentPage,
        state.usersPerPage,
    );

    const handleSearch = (query: string) => {
        updateState({ searchQuery: query, currentPage: 1 });
    };

    const handleRoleFilter = (role: string) => {
        updateState({ selectedRole: role, currentPage: 1 });
    };

    const handleSortOrder = (order: string) => {
        updateState({ sortOrder: order, currentPage: 1 });
    };

    const handleEmailVerifiedFilter = (verified: string) => {
        updateState({ emailVerified: verified, currentPage: 1 });
    };

    const handleStatusFilter = (status: string) => {
        updateState({ statusFilter: status, currentPage: 1 });
    };

    useEffect(() => {
        if (state.currentPage !== safePage) {
            updateState({ currentPage: safePage });
        }
    }, [safePage, state.currentPage]);

    const handleRowHold = () => {
        updateState({ showCheckboxes: true });
    };

    const longPressHandlers = useLongPress(handleRowHold);

    return {
        state,
        updateState,
        refreshUsers,
        silentRefresh,
        paged,
        totalPages,
        safePage,
        handleStatusChange,
        handleSearch,
        handleRoleFilter,
        handleSortOrder,
        handleEmailVerifiedFilter,
        handleStatusFilter,
        error: state.error,
        longPressHandlers,
    };
};