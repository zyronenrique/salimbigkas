import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";

const SkeletonClass = ({ rows = 12 }: { rows?: number }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <motion.div
          key={idx}
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-4 w-full flex flex-col items-center justify-center">
            {/* Class name skeleton */}
            <div className="w-full">
              <Skeleton height={100} className="rounded-lg" />
            </div>
            {/* Date and time skeleton */}
            <div className="w-full flex justify-between gap-2 mt-2">
              <Skeleton containerClassName="flex-1" height={24} />
              <Skeleton containerClassName="flex-1" height={24} />
            </div>
          </div>
          {/* Options button skeleton */}
          <div className="absolute top-2 right-2">
            <Skeleton circle width={42} height={42} />
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default SkeletonClass;
