import Skeleton from "react-loading-skeleton"

const SkeletonDashboardClassCard = () => {
    return (
        <div className="p-4 border border-gray-200 rounded-lg space-y-2 justify-between">
            <div className="flex justify-between items-start">
                <Skeleton width={80} height={24} />
                <Skeleton width={50} height={20} />
            </div>
            <Skeleton width="60%" height={18} />
            <div className="flex justify-between items-center">
                <Skeleton width={90} height={28} />
                <Skeleton width={60} height={32} />
            </div>
        </div>
    )
}

export default SkeletonDashboardClassCard