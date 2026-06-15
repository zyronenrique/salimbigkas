
interface UserTableHeaderProps {
    showCheckboxes: boolean;
    allSelected: boolean;
    onSelectAll: () => void;
}

const columns = [
    "Name",
    "Email",
    "Grade Level",
    "Role",
    "Joined",
    "Status",
    "Actions",
];

const UserTableHeader = ({
    showCheckboxes,
    allSelected,
    onSelectAll,
}: UserTableHeaderProps) => (
    <thead className="[&_tr]:border-b sticky top-0 z-10 bg-white">
        <tr className="border-b border-gray-200 text-left font-medium">
            {showCheckboxes && (
                <th scope="col" className="p-4 whitespace-nowrap">
                    <input
                        title="Select all users"
                        type="checkbox"
                        className="w-4 h-4"
                        checked={allSelected}
                        onChange={onSelectAll}
                    />
                </th>
            )}
            {columns.map((col) => (
                <th
                    key={col}
                    scope="col"
                    className="p-4 text-left font-medium tracking-wider"
                >
                    {col}
                </th>
            ))}
        </tr>
    </thead>
);

export default UserTableHeader;
