import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useAuth } from "../hooks/authContext";
import { AdminNavItems, AdminTab } from "./DashboardConstant";
import SideBar from "./SideBar";
import Header from "./Header";
import { BarLoader } from "react-spinners";
import { useLogReg } from "../components/Modals/LogRegProvider";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const { currentUser, role, loading } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const validTabs: AdminTab[] = AdminNavItems.map(item => item.tab);
  const tab = pathSegments.find(seg => validTabs.includes(seg as AdminTab)) as AdminTab || "dashboard";
  const [activeTab, setActiveTab] = useState<AdminTab>(tab);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleTabChange = useCallback((tab: AdminTab) => {
    if (tab === activeTab) return;
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/${tab}`);
  }, [activeTab, formattedGradeLevel, navigate]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/home");
    } else if (role !== "Admin") {
      navigate(`/${role}/${formattedGradeLevel}`);
    }
  }, [currentUser, role, navigate, formattedGradeLevel]);

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
      <SideBar role={"Admin"} activeTab={activeTab} handleTabChange={handleTabChange}/>
      <div className="flex-1 flex flex-col">
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

export default AdminDashboard;
