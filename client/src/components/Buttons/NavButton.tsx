import { motion } from "framer-motion";
import { JSX } from "react";

interface NavButtonProps {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
  isActive?: boolean;
}

const NavButton = ({
  label,
  icon,
  onClick,
  isActive = false,
}: NavButtonProps) => (
  <motion.button
    title={label}
    type="button"
    className={`w-full py-4 px-3 rounded-lg ${
      isActive ? "text-[#2C3E50] bg-[#F8F8F8]" : "text-white bg-transparent hover:text-[#2C3E50] hover:bg-[#F8F8F8]"
    }`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    layout
  >
    <div className="relative flex items-center gap-3 px-15">
      <div className="absolute top-0 left-0">{icon}</div>
      <span className="font-bold whitespace-nowrap">{label}</span>
    </div>
  </motion.button>
);

export default NavButton;
