import { motion } from "framer-motion"
import Skeleton from "react-loading-skeleton"

const SkeletonUserList = ({ rows = 6 }: { rows?: number }) => {
  return (
    <>
        {Array.from({ length: rows }).map((_, idx) => (
            <motion.tr
                key={idx}
                className="hover:bg-gray-100 transition duration-200 ease-in-out"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
            >
                {/* Avatar + Name */}
                <td className="p-4 whitespace-nowrap flex items-center space-x-4">
                    <Skeleton circle width={38} height={36} />
                    <div className="flex flex-col">
                        <Skeleton width={100} height={24} />
                    </div>
                </td>
                {/* Email + Icon */}
                <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                    <Skeleton circle width={24} height={24} />
                    <Skeleton width={120} height={24} />
                    </div>
                </td>
                {/* Grade Level + Icon */}
                <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                    <Skeleton circle width={24} height={24} />
                    <Skeleton width={60} height={24} />
                    </div>
                </td>
                {/* Role + Icon */}
                <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                    <Skeleton circle width={24} height={24} />
                    <Skeleton width={60} height={24} />
                    </div>
                </td>
                {/* Joined + Icon */}
                <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                    <Skeleton circle width={24} height={24} />
                    <Skeleton width={80} height={24} />
                    </div>
                </td>
                {/* Status */}
                <td className="p-4 whitespace-nowrap">
                    <Skeleton width={55} height={24} style={{ borderRadius: 12 }} />
                </td>
                {/* Actions */}
                <td className="p-4 whitespace-nowrap">
                    <Skeleton circle width={32} height={32} className="ml-2" />
                </td>
            </motion.tr>
        ))}
    </>
  )
}

export default SkeletonUserList