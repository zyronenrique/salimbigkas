import Skeleton from "react-loading-skeleton";

const SkeletonYunit = () => {
  return (
    <div className="py-2">
      <div className="flex flex-col h-full rounded-2xl shadow-lg overflow-hidden relative">
        {/* Image skeleton */}
        <div className="absolute -top-1 inset-0 z-0 opacity-50">
          <Skeleton height="100%" width="100%" />
        </div>
        {/* Content skeleton */}
        <div className="relative z-10 flex flex-col h-full justify-between p-6">
          <div>
            <div className="mb-1">
              <Skeleton width={90} height={28} borderRadius={8} />
            </div>
            <div className="mb-4">
              <Skeleton width={120} height={18} borderRadius={6} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-auto">
            <Skeleton width={80} height={16} borderRadius={4} />
            <Skeleton circle width={18} height={18} />
          </div>
        </div>
        {/* Badge skeleton */}
        <span className="absolute top-3 left-3 flex items-center justify-center">
          <Skeleton circle width={32} height={32} />
        </span>
        {/* Options skeleton */}
        <div className="absolute top-3 right-3 flex items-center justify-center">
          <Skeleton circle width={28} height={28} />
        </div>
      </div>
    </div>
  );
};

export default SkeletonYunit;
