import { motion, Variants } from "framer-motion";

const dotVariants: Variants = {
    jump: {
        y: -30,
        transition: {
            duration: 0.8,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
        },
    },
};

const LoadingDots = () => (
    <motion.div
        animate="jump"
        transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
        className="flex gap-3 justify-center items-center h-screen bg-white"
    >
        <motion.div className="w-5 h-5 rounded-full bg-[#2C3E50]" variants={dotVariants} />
        <motion.div className="w-5 h-5 rounded-full bg-[#2C3E50]" variants={dotVariants} />
        <motion.div className="w-5 h-5 rounded-full bg-[#2C3E50]" variants={dotVariants} />
    </motion.div>
);

export default LoadingDots;
