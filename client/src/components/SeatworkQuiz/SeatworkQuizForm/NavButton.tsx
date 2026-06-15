import { motion } from "framer-motion";
import React, { memo } from "react";

interface NavCircleButtonProps {
  icon?: React.ReactNode;
  imageSrc?: string;
  label: string;
  onClick?: () => void;
  asLabel?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}

const NavCircleButton = memo(({
    icon,
    imageSrc,
    label,
    onClick,
    asLabel = false,
    children,
    disabled,
    selected,
    inputProps,
    className = "",
}: NavCircleButtonProps) => {
    const baseClass =
        "relative w-14 h-14 flex flex-col items-center justify-center rounded-full font-semibold text-base transition-all duration-200 shadow-lg group";
    const selectedClass = selected
        ? "bg-white text-[#2C3E50] shadow-lg ring-2 ring-[#2C3E50]/30"
        : "bg-[#2C3E50] text-white hover:bg-[#34495e] hover:scale-105";
    const combinedClass = `${baseClass} ${selectedClass} ${className}`;

    const content = (
        <>
            {icon}
            {imageSrc && <img loading="lazy" src={imageSrc} alt={label} className="size-14" />}
            {children}
            <span className={`absolute left-18 bg-[#2C3E50] text-white px-6 py-4 rounded-r-lg shadow-lg text-base font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10`}>
                {label}
            </span>
        </>
    );

    if (asLabel) {
        return (
            <label className={combinedClass} title={label} aria-label={label}>
                {content}
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    {...inputProps}
                />
            </label>
        );
    }

    return (
        <motion.button
            type="button"
            className={combinedClass}
            onClick={onClick}
            aria-label={label}
            title={label}
            disabled={disabled}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
        >
            {content}
        </motion.button>
    );
});

export default NavCircleButton;
