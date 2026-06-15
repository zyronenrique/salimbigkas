import { ChevronDown } from "lucide-react";

interface FilterOption {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    htmlFor: string;
}

const FilterSelect = ({
    label,
    value,
    onChange,
    options,
    htmlFor,
}: FilterOption) => (
    <div className="mt-4 mb-2 text-left relative">
        <select
            title={label}
            className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none appearance-none ${
                value ? "border-[#2C3E50]" : "border-gray-300"
            }`}
            value={value}
            onChange={onChange}
        >
            <option value="">{value ? "All" : ""}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                {opt.label}
                </option>
            ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            <ChevronDown size={20} />
        </span>
        <label
            className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${
                value
                ? "bg-white top-[-10px] text-[#2C3E50] text-sm"
                : "top-4 text-gray-500 text-base"
            }`}
            htmlFor={htmlFor}
        >
            {label}
        </label>
    </div>
);

export default FilterSelect;