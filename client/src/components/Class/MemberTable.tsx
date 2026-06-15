import { Calendar, Ellipsis, Trash2, UserRoundPen } from "lucide-react";
import { formatUserDate } from "../../utils/helpers";
import { motion } from "framer-motion";
import Popup from "reactjs-popup";
import { imageSrc, SpinLoadingColored } from "../Icons/icons";

interface MemberTableProps {
  users: any[];
  showCheckboxes: boolean;
  selectedMembers: string[];
  onSelect: (userId: string) => void;
  onSelectAll: () => void;
  currentUserId: string;
  title: boolean;
  titleChange: boolean;
  onTitleChange: (userId: string, newTitle: string) => void;
  onDelete: (userId: string) => void;
  longPressHandlers?: any;
}

const MemberTable = ({
  users,
  showCheckboxes,
  selectedMembers,
  onSelect,
  onSelectAll,
  currentUserId,
  title,
  titleChange,
  onTitleChange,
  onDelete,
  longPressHandlers = {},
}: MemberTableProps) => (
  <div className="w-full mt-4 rounded-xl border-1 border-gray-200 shadow-sm">
    <div className="p-1">
      <table className="min-w-full divide-y divide-gray-200 caption-bottom">
        <thead className="[&_tr]:border-b">
          <tr className="border-b border-gray-200 text-left font-medium">
            {showCheckboxes && (
              <th scope="col" className="p-4 whitespace-nowrap">
                <input
                  title="Select all"
                  type="checkbox"
                  className="w-4 h-4"
                  checked={
                    users.length > 0 &&
                    users
                      .filter((u) => currentUserId !== u.id)
                      .every((u) => selectedMembers.includes(u.id))
                  }
                  onChange={onSelectAll}
                />
              </th>
            )}
            <th
              scope="col"
              className="p-4 text-left font-medium tracking-wider"
            >
              Name
            </th>
            <th
              scope="col"
              className="p-4 text-left font-medium tracking-wider"
            >
              Title
            </th>
            <th
              scope="col"
              className="p-4 text-left font-medium tracking-wider"
            >
              Role
            </th>
            <th
              scope="col"
              className="p-4 text-left font-medium tracking-wider"
            >
              Joined
            </th>
            {title && <th className="p-4">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white text-left divide-y divide-gray-200">
          {users.map((user, index) => (
            <motion.tr
              key={user.id}
              className="hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              {...longPressHandlers}
            >
              {showCheckboxes && (
                <td className="p-4 whitespace-nowrap">
                  {currentUserId !== user.id && (
                    <input
                      title={`Select ${user.displayName}`}
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedMembers.includes(user.id)}
                      onChange={() => onSelect(user.id)}
                    />
                  )}
                </td>
              )}
              <td className="p-4 whitespace-nowrap flex items-center space-x-4">
                <img
                  loading="lazy"
                  className="w-10 h-10 rounded-full object-contain"
                  src={imageSrc.man}
                  alt="user"
                />
                <div className="flex items-center justify-between space-x-1">
                  <span className="text-sm font-medium text-gray-900">
                    {user.displayName}
                  </span>
                  {currentUserId === user.id && (
                    <span className="rounded-sm px-2 py-1 text-xs font-bold text-green-50 border border-green-200 bg-green-400">
                      You
                    </span>
                  )}
                </div>
              </td>
              <td className="p-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{user.title}</span>
              </td>
              <td className="p-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{user.role}</span>
              </td>
              <td className="p-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Calendar size={20} />
                  <span className="text-sm">
                    {formatUserDate(user.createdAt)}
                  </span>
                </div>
              </td>
              {title && (
                <td className="p-4 whitespace-nowrap ml-2">
                  {currentUserId !== user.id && (
                    <Popup
                      trigger={
                        <button
                          type="button"
                          title="Options"
                          aria-label="Options"
                          className="p-2 text-gray-600 hover:bg-[#2C3E50] hover:text-white rounded-full"
                          tabIndex={0}
                        >
                          <Ellipsis size={24} />
                        </button>
                      }
                      position={["bottom right", "top right"]}
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
                            className="flex flex-col bg-white shadow-xl rounded-lg mt-2 border border-gray-200 focus:outline-none"
                            tabIndex={-1}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") close();
                            }}
                          >
                            <button
                              type="button"
                              className={`flex text-[#2C3E50] ${titleChange ? "" : "hover:bg-gray-200 hover:text-[#2C3E50]"} rounded-tl-lg rounded-tr-lg items-center px-6 py-4 space-x-2`}
                              onClick={async (e) => {
                                e.stopPropagation();
                                await onTitleChange(
                                  user.id,
                                  user.title === "Owner" ? "Member" : "Owner",
                                );
                                close();
                              }}
                            >
                              {titleChange ? (
                                <div className="flex items-center justify-center gap-2">
                                  <SpinLoadingColored size={6}/>
                                  {user.title === "Owner"
                                    ? "Making member..."
                                    : "Making owner..."}
                                </div>
                              ) : (
                                <>
                                  <UserRoundPen className="mr-2" size={24} />
                                  <span>
                                    {user.title === "Owner"
                                      ? "Make member"
                                      : "Make owner"}
                                  </span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="flex items-center px-6 py-4 text-red-500 hover:bg-red-50 rounded-bl-lg rounded-br-lg text-base"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(user.id);
                                close();
                              }}
                            >
                              <Trash2 className="mr-2" size={24} />
                              Delete member
                            </button>
                          </motion.div>
                        )) as any
                      }
                    />
                  )}
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default MemberTable;
