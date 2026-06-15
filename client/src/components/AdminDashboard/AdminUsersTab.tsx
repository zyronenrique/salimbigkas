import { useEffect } from "react";
import {
  X,
  Funnel,
  Trash2,
  UserRoundPlus,
  Search,
  RotateCw,
} from "lucide-react";
import {doDeleteUser} from "../../api/functions";
import { useAuth } from "../../hooks/authContext";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { motion } from "framer-motion";
import Popup from "reactjs-popup";
import DeleteModal from "../Modals/DeleteModal";
import { SpinLoadingColored } from "../Icons/icons";
import SkeletonUserList from "../SkeletonLoaders/SkeletonUserList";
import { useUsersContext } from "../../hooks/usersContext";
import { useNavigate } from "react-router-dom";
import { useUsersState } from "./useUsersState";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import FilterSelect from "./FilterSelect";
import UserTableHeader from "./UserTableHeader";
import UserTableRow from "./UserTableRow";
import { useLogReg } from "../Modals/LogRegProvider";

const AdminUsersTab = () => {
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();
  const { setSelectedUser, setIsEditingUser } = useUsersContext();
  const { 
    state,
    updateState,
    refreshUsers,
    silentRefresh,
    paged,
    totalPages,
    handleStatusChange, 
    handleSearch, 
    handleRoleFilter, 
    handleSortOrder, 
    handleEmailVerifiedFilter, 
    handleStatusFilter,
    longPressHandlers,
  } = useUsersState();
  const { resetState, formattedGradeLevel } = useLogReg();
  
  useEffect(() => {
    resetState();
  }, [resetState]);

  const handleEditUser = (user: any) => {
    setIsEditingUser(true);
    setSelectedUser(user);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/users/edit/${user.uid}`);
  };

  const handleDeleteUser = async (uid: string) => {
    updateState({ selectedUsers: [uid], isDeleteModalOpen: true });
  };

  return (
    <>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            User Management
          </h1>
          <div className="flex items-center space-x-4 p-2">
            <div className="relative flex items-center bg-white rounded-lg">
              <button
                title="Search"
                type="button"
                className="absolute left-1 p-2 text-gray-500 hover:text-[#2C3E50]"
                onClick={(e) => handleSearch(e.currentTarget.value)}
              >
                <Search size={20} />
              </button>
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-10 py-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50]"
                value={state.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Popup
                trigger={
                  <button
                    title="Filter"
                    aria-label="Filter"
                    type="button"
                    className="flex px-4 py-2 text-lg font-bold items-center border-1 border-gray-200 rounded-lg shadow-sm bg-white hover:bg-gray-100 transition duration-200 ease-in-out"
                    tabIndex={0}
                  >
                    <Funnel size={20} className="mr-2" />
                    Filter
                  </button>
                }
                position="bottom right"
                on="click"
                closeOnDocumentClick
                arrow={false}
                contentStyle={{
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  boxShadow: "none",
                }}
                overlayStyle={{ background: "rgba(0,0,0,0.05)" }}
                nested
                lockScroll
                children={
                  ((close: () => void) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col bg-white shadow-xl rounded-lg mt-2 p-2 border border-gray-200 min-w-[160px] focus:outline-none"
                      tabIndex={-1}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") close();
                      }}
                    >
                      <div className="p-4 space-y-4">
                        <FilterSelect
                          label="Role"
                          value={state.selectedRole}
                          onChange={(e) => handleRoleFilter(e.target.value)}
                          options={[
                            { value: "Admin", label: "Admin" },
                            { value: "Teacher", label: "Teacher" },
                            { value: "Student", label: "Student" },
                          ]}
                          htmlFor="Filter by role"
                        />
                        <FilterSelect
                          label="Email"
                          value={state.emailVerified}
                          onChange={(e) => handleEmailVerifiedFilter(e.target.value)}
                          options={[
                            { value: "verified", label: "Verified" },
                            { value: "unverified", label: "Unverified" },
                          ]}
                          htmlFor="Filter by email verified"
                        />
                        <FilterSelect
                          label="Status"
                          value={state.statusFilter}
                          onChange={(e) => handleStatusFilter(e.target.value)}
                          options={[
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                          ]}
                          htmlFor="Filter by status"
                        />
                        <FilterSelect
                          label="Sort Order"
                          value={state.sortOrder}
                          onChange={(e) => handleSortOrder(e.target.value)}
                          options={[
                            { value: "asc", label: "↓ A-Z" },
                            { value: "desc", label: "↑ Z-A" },
                          ]}
                          htmlFor="sortOrder"
                        />
                      </div>
                    </motion.div>
                  )) as any
                }
              />
            </div>
            <button
              title="Refresh"
              type="button"
              className="flex items-center gap-2 p-3 text-sm shadow-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-100"
              onClick={refreshUsers}
            >
              {state.isLoading ?
                <SpinLoadingColored size={6}/>
              : 
                <RotateCw size={22} />
              }
            </button>
            {state.selectedUsers.length > 0 || state.showCheckboxes ? (
              <>
                <motion.button
                  type="button"
                  disabled={state.selectedUsers.length === 0}
                  className={`flex px-4 py-2 text-lg font-bold items-center rounded-lg shadow-sm transition duration-200 ease-in-out ${
                    state.selectedUsers.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                  onClick={() => updateState({ isDeleteModalOpen: true })}
                  aria-label="Delete selected users"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 size={24} className="mr-2" />
                  Delete Selected
                </motion.button>
                <motion.button
                  type="button"
                  className="flex px-4 py-2 text-lg font-bold text-white items-center bg-[#2C3E50] rounded-lg shadow-sm hover:bg-[#34495E] transition duration-200 ease-in-out"
                  onClick={() => updateState({ selectedUsers: [], showCheckboxes: false })}
                  aria-label="Cancel selected users"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={24} className="mr-2" />
                  Cancel
                </motion.button>
              </>
            ) : (
              <motion.button
                title="Add user"
                type="button"
                className="flex px-4 py-2 text-lg font-bold text-white items-center bg-[#2C3E50] rounded-lg shadow-sm hover:bg-[#34495E] transition duration-200 ease-in-out"
                onClick={() => {
                  setIsEditingUser(false);
                  setSelectedUser(null);
                  navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/users/add`);
                }}
                aria-label="Add users"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserRoundPlus size={24} className="mr-2" />
                Add User
              </motion.button>
            )}
          </div>
        </div>
        {/* Users Table */}
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave"} }}
          className="rounded-xl border-1 border-gray-200 shadow-sm h-[65vh] max-h-[65vh] overflow-y-auto"
        >
          <div className="p-1">
            <table className="min-w-full divide-y divide-gray-200 caption-bottom ">
              <UserTableHeader
                showCheckboxes={state.showCheckboxes}
                allSelected={state.selectedUsers.length === paged?.length}
                onSelectAll={() => {
                  if (state.selectedUsers.length === paged?.length) {
                    updateState({ selectedUsers: [] });
                  } else {
                    updateState({
                      selectedUsers: paged?.map((user) => user.uid) || [],
                    });
                  }
                }}
              />
              <tbody className="bg-white text-left divide-y divide-gray-200">
                {state.isLoading
                  ? <SkeletonUserList />
                  : paged.length > 0 ? 
                    paged.map((user, index) => (
                        <UserTableRow
                          key={user.uid}
                          user={user}
                          index={index}
                          showCheckboxes={state.showCheckboxes}
                          selected={state.selectedUsers.includes(user.uid)}
                          onSelect={(checked) =>
                            updateState({
                              selectedUsers: checked
                                ? [...state.selectedUsers, user.uid]
                                : state.selectedUsers.filter((id) => id !== user.uid),
                            })
                          }
                          onEdit={() => handleEditUser(user)}
                          onDelete={() => handleDeleteUser(user.uid)}
                          onStatusChange={async () =>
                            handleStatusChange(user.uid, user.disabled ? false : true)
                          }
                          userStatus={state.userStatus}
                          longPressHandlers={longPressHandlers}
                        />
                      ))
                  : (
                    <tr>
                      <td colSpan={8} className="py-4 text-center">
                        <div className="flex flex-col items-center justify-center h-[50vh] w-full">
                          <span className="chalk-text text-8xl text-gray-800">No users found.</span>
                        </div>
                      </td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
        </OverlayScrollbarsComponent>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            disabled={state.currentPage === 1}
            onClick={() => updateState({ currentPage: Math.max(1, state.currentPage - 1) })}
            className={`px-6 py-2 rounded-lg ${state.currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#2C3E50] text-white hover:bg-[#34495E]"}`}
          >
            Previous
          </button>
          <span>
            Page {state.currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={state.currentPage === totalPages}
            onClick={() => updateState({ currentPage: Math.min(totalPages, state.currentPage + 1) })}
            className={`px-10 py-2 rounded-lg ${state.currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[#2C3E50] text-white hover:bg-[#34495E]"}`}
          >
            Next
          </button>
        </div>
      </div>
      {state.isDeleteModalOpen && (
        <div
          className={
            "fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"
          }
        >
          <DeleteModal
            entityType="user"
            isOpen={state.isDeleteModalOpen}
            onClose={() => updateState({ isDeleteModalOpen: false })}
            onDelete={async () => {
              try {
                // Send all selected user IDs in a single request
                const response = (await doDeleteUser(
                  currentUser?.uid || "",
                  state.selectedUsers,
                )) as any;
                if (response?.success) {
                  toast.success(
                    <CustomToast
                      title="Congratulation!"
                      subtitle="Selected users deleted successfully."
                    />,
                  );
                  silentRefresh();
                  updateState({ selectedUsers: [], isDeleteModalOpen: false });
                } else {
                  toast.error(
                    <CustomToast
                      title="Something went wrong!"
                      subtitle="Failed to delete these users. Please try again."
                    />,
                  );
                  updateState({ isDeleteModalOpen: false });
                }
              } catch (error) {
                toast.error(
                  <CustomToast
                    title="Something went wrong!"
                    subtitle="Failed to delete these users. Please try again."
                  />,
                );
                updateState({ isDeleteModalOpen: false });
              }
            }}
          />
        </div>
      )}
    </>
  );
};

export default AdminUsersTab;
