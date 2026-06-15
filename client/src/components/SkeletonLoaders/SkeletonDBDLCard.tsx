import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";

const SkeletonDBDLCard = ({ rows = 10 }: { rows?: number }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, idx) => (
                <motion.div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 border rounded-lg border-gray-200 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <div className="flex items-center gap-3">
                        <Skeleton circle width={28} height={28} />
                        <div>
                            <Skeleton width={120} height={20} style={{ marginBottom: 2 }} />
                            <div className="flex items-center gap-2 mt-1">
                                <Skeleton width={60} height={12} />
                                <span className="text-xs text-gray-400">•</span>
                                <Skeleton width={50} height={12} />
                                <span className="text-xs text-gray-400">•</span>
                                <Skeleton width={40} height={12} />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton width={50} height={28} />
                    </div>
                </motion.div>
            ))}
        </>
    );
};

export default SkeletonDBDLCard;
