import { InputHTMLAttributes, ReactNode } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  icon?: ReactNode;
  error?: string;
}

const InputField = ({
  label,
  value,
  onValueChange,
  icon,
  error,
  ...props
}: InputFieldProps) => (
  <div className="mt-5 mb-4 text-left relative">
    <input
      {...props}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-full font-bold p-4 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${value ? "border-[#2C3E50]" : "border-gray-300"}`}
      placeholder=" "
    />
    {icon && (
      <span className="absolute right-4 top-4.5">{icon}</span>
    )}
    <label
      htmlFor={props.id}
      className={`absolute text-sm font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${value ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
    >
      {label}
    </label>
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);

export default InputField;
