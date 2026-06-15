import Skeleton from "react-loading-skeleton";

const SkeletonActivity = ({ qty = 5 }: { qty?: number }) => {
  return (
    <>
        {Array.from({ length: qty }).map((_, idx) => (
            <div key={idx} className="flex items-start gap-4 p-3 rounded-lg justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center">
                        <Skeleton circle width={30} height={30} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-medium">
                            <Skeleton width={120} height={16} />
                        </h4>
                        <div className="text-xs text-gray-500 text-muted-foreground mt-1 space-y-1">
                            <Skeleton width={80} height={12} />
                            <Skeleton width={100} height={12} />
                        </div>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">
                    <Skeleton width={60} height={16} />
                </div>
            </div>
        ))}
    </>
  );
};

export default SkeletonActivity;