interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number; // Optional, for progress bar
}

const DashboardCard = ({
  title,
  value,
  subtitle,
  progress,
}: DashboardCardProps) => (
  <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
    <div className="pb-2">
      <div className="text-sm font-medium">{title}</div>
    </div>
    <div className="w-full">
      <div className="text-2xl font-bold">{value}</div>
      {subtitle !== undefined && (
        <p className="text-xs text-gray-500 text-muted-foreground">
          {subtitle}
        </p>
      )}
      {progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-[#2C3E50] h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  </div>
);

export default DashboardCard;
