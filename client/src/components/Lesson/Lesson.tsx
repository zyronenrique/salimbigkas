import { memo, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/authContext";
import { motion } from "framer-motion";
import {ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
import useLessonTimeTracker from "../Class/useLessonTimeTracker";
import { useClassContext } from "../../hooks/classContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LessonNavItems, LessonTab } from "../../pages/DashboardConstant";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useLogReg } from "../Modals/LogRegProvider";

const Lesson = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, role, gradeLevel } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { selectedYunit, selectedClass, selectedLesson, pageNumber, setPageNumber, setFileUrl } = useClassContext();
  const pagbasaUrls = selectedLesson.fileUrls
    ?.map((item: any) => item || [])
    .flat()
    .filter((url: string) => typeof url === "string" && url.match(/\.(pdf)(\?|$)/i)) || [];
  
  const getTabFromPath = () => {
    if (location.pathname.includes("/about")) return "about";
    if (location.pathname.includes("/files")) return "files";
    const pagbasaMatch = location.pathname.match(/\/pagbasa\/(\d+)/);
    if (pagbasaMatch) {
      return { type: "pagbasa", idx: Number(pagbasaMatch[1]) } as LessonTab;
    }
    return "about";
  };
  const [activeTab, setActiveTab] = useState<LessonTab>(getTabFromPath());
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(true);
  
  const isTabEqual = (a: LessonTab, b: LessonTab) => {
    if (typeof a === "object" && typeof b === "object") {
      return a.type === b.type && a.idx === b.idx;
    }
    return a === b;
  };

  useEffect(() => {
    if (typeof activeTab === "object" && activeTab.type === "pagbasa") {
      setFileUrl(pagbasaUrls[activeTab.idx]);
    }
  }, [activeTab, pagbasaUrls, setFileUrl]);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = useCallback((tab: LessonTab) => {
    if (tab === activeTab) return;
    let tabPath = {};
    if (typeof tab === "object" && tab.type === "pagbasa") {
      tabPath = `pagbasa/${tab.idx}`;
    } else {
      setPageNumber(null);
      tabPath = tab;
    }
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/${role === "Student" ? `` : `classes/class/${selectedClass?.id}/`}my-courses/yunit-${selectedYunit?.yunitnumber}/lessons/lesson/${selectedLesson.id}/${tabPath}`);
  }, [activeTab, formattedGradeLevel, navigate, role, selectedClass, selectedLesson, selectedYunit]);

  const NavButton = ({ tab, label }: { tab: LessonTab; label: string }) => {
    return (
      <motion.button
        type="button"
        title={label}
        aria-label={`Go to ${label}`}
        className={`flex items-center p-4 transition-colors duration-200 outline-none
          ${
            isTabEqual(activeTab, tab)
              ? "bg-white text-[#2C3E50] font-semibold border-t-8 shadow-2xl border-b-[#2C3E50]"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        onClick={() => handleTabChange(tab)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-sm font-medium">{label}</span>
      </motion.button>
    );
  };
  
  // Track time spent on lesson
  useLessonTimeTracker({
    userId: currentUser?.uid,
    yunitId: selectedYunit.id,
    lessonId: selectedLesson.id,
    gradeLevel: gradeLevel || selectedClass.gradeLevel,
  });

  return (
    <div className="flex-1">
      <motion.div
        className="fixed top-0 left-0 w-full h-full z-50 bg-white shadow-md flex flex-col justify-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex-1 flex flex-col h-screen">
          <OverlayScrollbarsComponent
            options={{ scrollbars: { autoHide: "leave" } }}
            className="flex-1 bg-[#F8F8F8] overflow-y-auto"
          >
            <Outlet />
          </OverlayScrollbarsComponent>
        </div>
      </motion.div>
      {/* Floating Bottom Nav */}
      <motion.nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 bg-white shadow-2xl rounded-t-2xl flex items-center gap-4 overflow-hidden"
        initial={{ y: 60, height: 60 }}
        animate={{ y: 0, height: isOpenMenu ? "auto" : 60 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {isOpenMenu ? (
          <>
            <motion.button
              type="button"
              title="Back to Lessons"
              className="flex items-center text-gray-700 hover:text-gray-900 font-bold bg-transparent transition duration-200 px-8"
              onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/${role === "Student" ? `` : `classes/class/${selectedClass?.id}/`}my-courses/yunit-${selectedYunit?.yunitnumber}/lessons`)}
              aria-label="back to classes"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="mr-2" size={24} />
              <span className="tracking-wider text-2xl font-bold">
                Aralin {selectedLesson.aralinNumero}
              </span>
            </motion.button>
            {LessonNavItems(pagbasaUrls).map((item) => (
              <NavButton
                key={
                  typeof item.tab === "object"
                    ? `${item.tab.type}-${item.tab.idx}`
                    : item.tab
                }
                tab={item.tab}
                label={item.label}
              />
            ))}
            <motion.button
              type="button"
              title="Take quiz"
              className="bg-transparent mr-4"
              onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/quizzes${role === "Student" ? "/select-quiz" : ""}`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-gray-700">Take Quiz</span>
            </motion.button>
            {pageNumber && (
              <span className="font-bold text-gray-700">
                Page {pageNumber.page} of {pageNumber.totalPages}
              </span>
            )}
            <motion.button
              type="button"
              title="Toggle Menu"
              className="flex items-center font-bold bg-transparent px-4"
              onClick={() => setIsOpenMenu(!isOpenMenu)}
              aria-label="toggle menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronDown size={24} />
            </motion.button>
          </>
        ): (
          <div className="flex items-center gap-4 px-8">
            {pageNumber && (
              <span className="text-xl font-bold text-gray-700">
                Page {pageNumber.page} of {pageNumber.totalPages}
              </span>
            )}
            <motion.button
              type="button"
              title="Expand Menu"
              className="flex items-center font-bold bg-transparent"
              onClick={() => setIsOpenMenu(!isOpenMenu)}
              aria-label="expand menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronUp size={40} />
            </motion.button>
          </div>
        )}
      </motion.nav>
    </div>
  );
});

export default Lesson;
