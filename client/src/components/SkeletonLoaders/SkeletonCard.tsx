import Skeleton from "react-loading-skeleton";

const SkeletonCard = () => {
  return (
    <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
      <div className="pb-2">
        <div className="text-sm font-medium"><Skeleton width={80} height={20} /></div>
      </div>
      <div>
        <div className="text-2xl font-bold"><Skeleton width={150} /></div>
        <p className="text-xs text-gray-500 text-muted-foreground">
            <Skeleton width={100} height={16} />
        </p>
      </div>
    </div>
  );
}

export default SkeletonCard;