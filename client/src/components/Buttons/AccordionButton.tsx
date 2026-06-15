import { JSX } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";

interface AccordionButtonProps {
  icon: JSX.Element;
  label: string;
  color: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  bgColor: string;
}

const AccordionButton = ({
  icon,
  label,
  color,
  isOpen,
  onClick,
  children,
  bgColor,
}: AccordionButtonProps) => (
  <>
    <motion.button
      type="button"
      className={`flex items-center w-full px-6 py-4 text-lg font-semibold text-gray-800 bg-white hover:bg-${bgColor}-50 transition`}
      onClick={onClick}
      aria-label={`Manage ${label}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {isOpen ? (
        <ChevronDown size={22} className={`mr-3 text-${color}-600`} />
      ) : (
        <ChevronRight size={22} className={`mr-3 text-${color}-600`} />
      )}
      <div className={`flex items-center gap-2 text-${color}-600`}>
        {icon}
        <span>{label}</span>
      </div>
    </motion.button>
    {isOpen && <div className={`px-8 py-4 bg-${bgColor}-50`}>{children}</div>}
  </>
);

export default AccordionButton;
