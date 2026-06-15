import {
  X,
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
  Search,
} from "lucide-react";
import { useLongPress } from "../../utils/helpers";
import { useAuth } from "../../hooks/authContext";
import { motion } from "framer-motion";
import MemberTable from "./MemberTable";
import DeleteModal from "../Modals/DeleteModal";
import { useClassesState } from "./useClassesState";
import { useNavigate } from "react-router";
import { useClassContext } from "../../hooks/classContext";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useLogReg } from "../Modals/LogRegProvider";

const ManageMembers = () => {
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { selectedClass } = useClassContext();
  const { state, updateState, handleTitleChange, paged, handleSearch, handleRowHold, handleDeleteClassMember } = useClassesState();

  const longPressHandlers = useLongPress(handleRowHold);
  const isOwner = state.owners.some((user) => user.id === currentUser?.uid);

  return (
    <>
      <div className="bg-white">
        <div className="p-6 border-b-2 border-[#BDC3C7] shadow-sm">
          <h2 className="w-full text-2xl text-left font-semibold">
            Members
          </h2>
        </div>
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave", autoHideDelay: 500 } }}
          defer
          className="px-6 py-4 overflow-y-scroll h-[calc(100vh-170px)]"
        >
          <div className="flex items-center justify-between">
            {state.selectedMembers.length > 0 ||
            state.showCheckboxes ||
            state.showOwnerCheckboxes ||
            state.showMemberCheckboxes ? (
              <div className="flex items-center space-x-6">
                <motion.button
                  type="button"
                  disabled={state.selectedMembers.length === 0}
                  className={`flex px-4 py-2 text-lg font-bold items-center rounded-lg shadow-sm transition duration-200 ease-in-out ${
                    state.selectedMembers.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                  onClick={() => updateState({ isDeleteModalOpen: true })}
                  aria-label="Delete selected users"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 size={20} className="mr-2" />
                  Delete Selected
                </motion.button>
                <motion.button
                  type="button"
                  className="flex text-lg font-bold items-center transition duration-200 ease-in-out"
                  onClick={() => updateState({ showCheckboxes: false, showOwnerCheckboxes: false, showMemberCheckboxes: false, selectedMembers: [] })}
                  aria-label="Cancel"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={24} className="mr-2" />
                  Cancel
                </motion.button>
              </div>
            ) : (
              isOwner && (
                <motion.button
                  type="button"
                  className="flex text-lg font-bold items-center transition duration-200 ease-in-out"
                  onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass.id}/manage-students/add-member`)}
                  aria-label="Add Student"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={24} className="mr-2" />
                  Add member
                </motion.button>
              )
            )}
            <div className="relative flex items-center">
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
          </div>
          {state.searchQuery ? (
            <MemberTable
              users={paged}
              showCheckboxes={state.showCheckboxes}
              selectedMembers={state.selectedMembers}
              onSelect={(userId) => {
                const selectedMembers = state.selectedMembers.includes(userId)
                  ? state.selectedMembers.filter((id) => id !== userId)
                  : [...state.selectedMembers, userId];
                updateState({ selectedMembers });
              }}
              onSelectAll={() => {
                const pagedIds = paged
                  .filter((user) => currentUser?.uid !== user.id)
                  .map((user) => user.id);
                if (
                  pagedIds.every((id) => state.selectedMembers.includes(id))
                ) {
                  updateState({
                    selectedMembers: state.selectedMembers.filter((id) => !pagedIds.includes(id)),
                  });
                } else {
                  updateState({
                    selectedMembers: [
                      ...state.selectedMembers,
                      ...pagedIds.filter((id) => !state.selectedMembers.includes(id)),
                    ],
                  });
                }
              }}
              currentUserId={currentUser?.uid || ""}
              title={isOwner}
              titleChange={state.titleChange}
              onTitleChange={handleTitleChange}
              onDelete={(userId: string) => {
                updateState({ selectedMembers: [userId], isDeleteModalOpen: true });
              }}
              longPressHandlers={longPressHandlers}
            />
          ) : (
            <div className="flex flex-col items-start justify-between">
              <motion.button
                type="button"
                className="flex items-center transition duration-200 ease-in-out mt-4"
                onClick={() => updateState({ showOwners: !state.showOwners })}
                aria-label="Manage Owners"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {state.showOwners ? (
                  <ChevronDown size={22} className="mr-2" />
                ) : (
                  <ChevronRight size={22} className="mr-2" />
                )}
                Owners ({state.owners.length})
              </motion.button>
              {state.showOwners && (
                <MemberTable
                  users={state.owners}
                  showCheckboxes={state.showOwnerCheckboxes}
                  selectedMembers={state.selectedMembers}
                  onSelect={(userId) => {
                    updateState(prev => {
                      const selectedMembers = prev.selectedMembers.includes(userId)
                        ? prev.selectedMembers.filter((id) => id !== userId)
                        : [...prev.selectedMembers, userId];
                      return { selectedMembers };
                    });
                  }}
                  onSelectAll={() => {
                    updateState(prev => {
                      const pagedIds = paged
                        .filter((user) => currentUser?.uid !== user.id)
                        .map((user) => user.id);
                      if (pagedIds.every((id) => prev.selectedMembers.includes(id))) {
                        return {
                          selectedMembers: prev.selectedMembers.filter((id) => !pagedIds.includes(id)),
                        };
                      } else {
                        return {
                          selectedMembers: [
                            ...prev.selectedMembers,
                            ...pagedIds.filter((id) => !prev.selectedMembers.includes(id)),
                          ],
                        };
                      }
                    });
                  }}
                  currentUserId={currentUser?.uid || ""}
                  title={isOwner}
                  titleChange={state.titleChange}
                  onTitleChange={(userId) =>
                    handleTitleChange(userId, "Member")
                  }
                  onDelete={(userId: string) => {
                    updateState({ selectedMembers: [userId], isDeleteModalOpen: true });
                  }}
                  longPressHandlers={longPressHandlers}
                />
              )}
              <motion.button
                type="button"
                className="flex items-center transition duration-200 ease-in-out mt-4"
                onClick={() => updateState({ showMembers: !state.showMembers })}
                aria-label="Manage Members"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {state.showMembers ? (
                  <ChevronDown size={22} className="mr-2" />
                ) : (
                  <ChevronRight size={22} className="mr-2" />
                )}
                Members ({state.members.length})
              </motion.button>
              {state.showMembers && (
                <MemberTable
                  users={state.members}
                  showCheckboxes={state.showMemberCheckboxes}
                  selectedMembers={state.selectedMembers}
                  onSelect={(userId) => {
                    const selectedMembers = state.selectedMembers.includes(userId)
                      ? state.selectedMembers.filter((id) => id !== userId)
                      : [...state.selectedMembers, userId];
                    updateState({ selectedMembers });
                  }}
                  onSelectAll={() => {
                    const memberIds = state.members
                      .filter((user) => currentUser?.uid !== user.id)
                      .map((user) => user.id);
                    if (
                      memberIds.every((id) =>
                        state.selectedMembers.includes(id),
                      )
                    ) {
                      updateState({
                        selectedMembers: state.selectedMembers.filter((id) => !memberIds.includes(id)),
                      });
                    } else {
                      updateState({
                        selectedMembers: [
                          ...state.selectedMembers,
                          ...memberIds.filter((id) => !state.selectedMembers.includes(id)),
                        ],
                      });
                    }
                  }}
                  currentUserId={currentUser?.uid || ""}
                  title={isOwner}
                  titleChange={state.titleChange}
                  onTitleChange={(userId) =>
                    handleTitleChange(userId, "Owner")
                  }
                  onDelete={(userId) => {
                    updateState({ selectedMembers: [userId], isDeleteModalOpen: true });
                  }}
                  longPressHandlers={longPressHandlers}
                />
              )}
            </div>
          )}
        </OverlayScrollbarsComponent>
      </div>
      {state.isDeleteModalOpen && (
        <div className={"fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"}>
          <DeleteModal
            entityType="user"
            isOpen={state.isDeleteModalOpen}
            onClose={() => updateState({ isDeleteModalOpen: !state.isDeleteModalOpen })}
            onDelete={handleDeleteClassMember}
          />
        </div>
      )}
    </>
  );
};

export default ManageMembers;
