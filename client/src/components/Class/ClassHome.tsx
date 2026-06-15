import {
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

interface ClassHomeProps {
  Tab: () => string;
  // classId: string;
}

const ClassHome = ({ Tab }: ClassHomeProps) => {
  return (
    <>
      {Tab() === "home" && (
        <>
          <motion.div
            className="p-6 space-y-4 border-b-2 border-[#BDC3C7] shadow-sm bg-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Home</h2>
              <button
                type="button"
                className="flex items-center px-6 py-4 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => {}}
              >
                <Plus size={16} className="mr-2" />
                Start a post
              </button>
            </div>
          </motion.div>
          <p className="text-gray-600">Welcome to the class home page!</p>
        </>
      )}
    </>
  );
};

export default ClassHome;
