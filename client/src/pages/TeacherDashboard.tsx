import { useCallback, useEffect, useState } from "react";
import { useAuth } from '../hooks/authContext';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { TeacherNavItems, TeacherTab } from "./DashboardConstant";
import Header from "./Header";
import SideBar from "./SideBar";
import { BarLoader } from "react-spinners";
import { useLogReg } from "../components/Modals/LogRegProvider";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const { currentUser, role, loading } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const validTabs: TeacherTab[] = TeacherNavItems.map(item => item.tab);
  const tab = pathSegments.find(seg => validTabs.includes(seg as TeacherTab)) as TeacherTab || "dashboard";
  const [activeTab, setActiveTab] = useState<TeacherTab>(tab);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleTabChange = useCallback((tab: TeacherTab) => {
    if (tab === activeTab) return;
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/${tab}`);
  }, [activeTab, formattedGradeLevel, navigate, role]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/home");
    } else if (role !== "Teacher") {
      navigate(`/${role}/${formattedGradeLevel}`);
    }
  }, [currentUser, navigate, role, formattedGradeLevel]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="flex rounded-lg h-screen">
      <BarLoader
        color="#208ec5" 
        loading={loading}
        cssOverride={
          {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderColor: '#208ec5',
            top: 0,
            left: 0,
            margin: "0 auto",
            width: '100%',
            zIndex: 9999,
          }
        }
        speedMultiplier={0.8}
      />
      <SideBar role="Teacher" activeTab={activeTab} handleTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col h-screen">
        <Header handleTabChange={() => handleTabChange("notifications")} />
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave" } }}
          className="flex-1 bg-[#F8F8F8] overflow-y-auto"
        >
          <Outlet />
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
};

export default TeacherDashboard;
