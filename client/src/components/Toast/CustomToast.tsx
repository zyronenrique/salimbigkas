import { ReactNode } from "react";
interface CustomToastProps {
  title: string;
  subtitle: ReactNode;
}

const CustomToast = ({ title, subtitle }: CustomToastProps) => {
  return (
    <div className="flex items-center text-left py-2">
      <div className="ml-3 mr-2 flex-1">
        <p className="text-base font-bold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

export default CustomToast;
