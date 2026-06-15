import { memo } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { X } from "lucide-react";

interface PercentageModalProps {
//   type: "quiz" | "seatwork";
  isOpen: boolean;
  onClose: () => void;
  logic: any;
}

const COLORS = ["#2C3E50", "#e0e0e0"];

const PercentageModal = memo(({ isOpen, onClose, logic }: PercentageModalProps) => {
    const { percentage } = logic;

    const pieData = [
        { name: "Original", value: percentage || 0 },
        { name: "Copied", value: 100 - (percentage || 0) },
    ];

    if (!isOpen) {
        return null;
    }

    return (
        <motion.div 
            className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full flex flex-col items-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
                duration: 0.3,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.4 },
            }}
        >
            <motion.button
                title="Close Modal"
                className="absolute top-3 right-3 text-[#2C3E50] hover:text-red-600 cursor-pointer"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <X size={28}/>
            </motion.button>
            <h2 className="text-xl font-bold mb-4 text-[#2C3E50]">Originality Percentage</h2>
            <div className="flex flex-col items-center mb-8">
                <PieChart width={180} height={180}>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        {pieData.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
                        ))}
                    </Pie>
                </PieChart>
                <span className="text-gray-600 text-base mt-2">
                    {percentage ?? 0}% of generated questions are <b>original</b> from the lesson content.
                </span>
            </div>
            <div>
                {/* List of generated questions per quiz base on type */}
            </div>
        </motion.div>
    );
});

export default PercentageModal;