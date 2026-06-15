import { motion } from "framer-motion";
import { JSX } from "react";

interface NavButtonProps {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
  isActive?: boolean;
}

const NavButtonClass = ({
  label,
  icon,
  onClick,
  isActive = false,
}: NavButtonProps) => (
    <motion.button
      title={label}
      type="button"
      className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${
        isActive
          ? "bg-[#2C3E50] text-white shadow"
          : "text-gray-700 hover:bg-gray-100"
      }`}
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold whitespace-nowrap">{label}</span>
      </div>
    </motion.button>
);

export default NavButtonClass;
