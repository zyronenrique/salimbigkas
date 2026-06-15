import {
  MailCheck,
  MailX,
  School,
  Ellipsis,
  UserRound,
  Calendar,
  Trash2,
  SquarePen,
  UserLock,
} from "lucide-react";
import Popup from "reactjs-popup";
import { motion } from "framer-motion";
import { imageSrc, SpinLoadingColored } from "../Icons/icons";
import { formatUserDate } from "../../utils/helpers";
import CustomToast from "../Toast/CustomToast";
import { toast } from "react-toastify";

interface UserTableRowProps {
    user: any;
    index: number;
    showCheckboxes: boolean;
    selected: boolean;
    onSelect: (checked: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: () => Promise<void>;
    userStatus: boolean;
    longPressHandlers: any;
}

const UserTableRow = ({
    user,
    index,
    showCheckboxes,
    selected,
    onSelect,
    onEdit,
    onDelete,
    onStatusChange,
    userStatus,
    longPressHandlers,
}: UserTableRowProps) => (
    <motion.tr
        className="hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        {...longPressHandlers}
    >
        {showCheckboxes && (
            <td className="p-4 whitespace-nowrap">
                <input
                    title="Select user"
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selected}
                    onChange={(e) => onSelect(e.target.checked)}
                />
            </td>
        )}
        <td className="p-4 whitespace-nowrap flex items-center space-x-4">
            <img
                loading="lazy"
                className="w-10 h-10 rounded-full object-contain"
                src={user.photoURL || imageSrc.man}
                alt="user"
            />
            <div className="flex flex-col truncate max-w-[200px]">
                <span className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName}
                </span>
            </div>
        </td>
        <td className="p-4 whitespace-nowrap">
            <div className="flex items-center space-x-2">
                {user.emailVerified ? (
                    <MailCheck size={20} className="text-green-500" />
                ) : (
                    <MailX size={20} className="text-red-500" />
                )}
                <span className="text-sm ">{user.email}</span>
            </div>
        </td>
        <td className="p-4 whitespace-nowrap max-w-[250px]">
            <div className="flex items-center space-x-2">
                <School size={20} className="" />
                <span className="text-sm truncate">
                    {user.gradeLevel
                        ? user.gradeLevel
                        : Array.isArray(user.gradeLevels) && user.gradeLevels.length > 0
                        ? user.gradeLevels.join(", ")
                        : <Ellipsis size={22} />}
                </span>
            </div>
        </td>
        <td className="p-4 whitespace-nowrap">
            <div className="flex items-center space-x-2">
                <UserRound size={20} className="" />
                <span className="text-sm">{user.role}</span>
            </div>
        </td>
        <td className="p-4 whitespace-nowrap">
            <div className="flex items-center space-x-2">
                <Calendar size={20} />
                <span className="text-sm">
                    {formatUserDate(user.creationTime)}
                </span>
            </div>
        </td>
        <td className="p-4 whitespace-nowrap">
            <div className="flex items-center space-x-2">
                {user.disabled ? (
                    <span className="px-2 py-0.5 text-sm bg-red-100 text-red-800 rounded-full">
                        Inactive
                    </span>
                ) : (
                    <span className="px-2 py-0.5 text-sm bg-green-100 text-green-800 rounded-full">
                        Active
                    </span>
                )}
            </div>
        </td>
        <td className="p-4 whitespace-nowrap">
            <div className="relative ml-2">
                <Popup
                    trigger={
                        <motion.button
                            title="Action"
                            aria-label="Action"
                            type="button"
                            className="p-2 text-gray-600 hover:bg-[#2C3E50] hover:text-white rounded-full transition duration-200 ease-in-out"
                            tabIndex={0}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Ellipsis size={24} />
                        </motion.button>
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
                    overlayStyle={{
                        background: "rgba(0,0,0,0.05)",
                    }}
                    nested
                    lockScroll
                    children={
                        ((close: () => void) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col bg-white shadow-xl rounded-lg mt-2 border border-gray-200 min-w-[160px] focus:outline-none"
                                tabIndex={-1}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") close();
                                }}
                            >
                                <button
                                    type="button"
                                    title="Edit user"
                                    aria-label="Edit user"
                                    className="flex text-blue-600 hover:bg-gray-200 hover:text-blue-700 rounded-tl-lg rounded-tr-lg items-center px-6 py-4 space-x-2"
                                    onClick={() => {
                                        onEdit();
                                        close();
                                    }}
                                >
                                    <SquarePen size={20} />
                                    <span>Edit account</span>
                                </button>
                                <button
                                    type="button"
                                    title="Delete user"
                                    aria-label="Delete user"
                                    className="flex text-red-600 hover:bg-gray-200 hover:text-red-700 items-center px-6 py-3 space-x-2"
                                    onClick={() => {
                                        onDelete();
                                        close();
                                    }}
                                >
                                    <Trash2 size={20} />
                                    <span>Delete account</span>
                                </button>
                                <button
                                    type="button"
                                    title={user.disabled ? "Enable account" : "Disable account"}
                                    aria-label={user.disabled ? "Enable account" : "Disable account"}
                                    disabled={userStatus}
                                    className={`flex text-[#2C3E50] ${userStatus ? "" : "hover:bg-gray-200 hover:text-[#2C3E50]"} rounded-bl-lg rounded-br-lg items-center px-6 py-4 space-x-2`}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (
                                            user.role === "Admin" || user.role === "Teacher" && user.gradeLevels === null 
                                            || user.role === "Student" && user.gradeLevel === null
                                        ) {
                                            toast.error(
                                                <CustomToast
                                                    title="Action not allowed!"
                                                    subtitle="Grade level is required for this user role."
                                                />,
                                            );
                                        } else {
                                            await onStatusChange();
                                        }
                                        close();
                                    }}
                                >
                                    {userStatus ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <SpinLoadingColored size={6}/>
                                            {user.disabled
                                                ? "Enabling..."
                                                : "Disabling..."}
                                        </div>
                                    ) : (
                                        <>
                                            <UserLock size={20} />
                                            <span>
                                                {user.disabled
                                                    ? "Enable account"
                                                    : "Disable account"}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )) as any
                    }
                />
            </div>
        </td>
    </motion.tr>
);

export default UserTableRow;
