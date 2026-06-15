import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import NavButtonClass from "../Buttons/NavButtonClass";
import { useClassContext } from "../../hooks/classContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ClassNavItems, ClassTab } from "../../pages/DashboardConstant";
import { useAuth } from "../../hooks/authContext";
import { useEffect, useState } from "react";
import { useLogReg } from "../Modals/LogRegProvider";

const Class = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { selectedClass } = useClassContext();
  const validTabs: ClassTab[] = ClassNavItems.map(item => item.tab);
  const tab = pathSegments.find(seg => validTabs.includes(seg as ClassTab)) as ClassTab || "dashboard";
  const [activeTab, setActiveTab] = useState<ClassTab>(tab);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleTabChange = (tab: ClassTab) => {
    if (tab === activeTab) return;
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes/class/${selectedClass?.id}/${tab}`);
  };

  const formattedClassName = () => {
    const names = (selectedClass?.className || "").split(" ").filter(Boolean);
    if (names.length === 0) return "?";
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + " " + names[1][0]).toUpperCase();
  };

  return (
    <div className="bg-[#F8F8F8] flex flex-1 h-full overflow-hidden">
      <motion.aside
        className="p-6 space-y-6 border-r-2 border-gray-200 shadow-xl min-w-[260px] flex flex-col justify-between"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-4 h-full">
          <div className="flex flex-col items-start">
            <motion.button
              type="button"
              className="flex items-center gap-2 text-2xl font-bold truncate transition duration-200 ease-in-out hover:text-[#2C3E50]"
              onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/classes`)}
              aria-label="Back"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={22} strokeWidth={4} />
              <span className="text-2xl font-bold tracking-tight truncate">
                {selectedClass?.className}
              </span>
            </motion.button>
            <div className="w-full h-[200px] mt-6 mx-auto flex items-center justify-center bg-[#2C3E50] rounded-2xl text-white text-6xl font-bold select-none">
              {formattedClassName()}
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {ClassNavItems.map((item) => (
              <NavButtonClass
                key={item.tab}
                label={item.label}
                icon={item.icon}
                isActive={tab === item.tab}
                onClick={() => handleTabChange(item.tab)}
              />
            ))}
          </nav>
        </div>
        <div className="text-gray-500">
          <h2 className="text-2xl font-bold text-[#2C3E50]">
            {selectedClass?.gradeLevel}
          </h2>
        </div>
      </motion.aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Class;
