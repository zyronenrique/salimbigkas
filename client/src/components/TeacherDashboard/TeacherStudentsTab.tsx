import { useCallback } from "react";
import { imageSrc, SpinLoadingColored } from "../Icons/icons";
import { useStudentStatsState } from "./useStudentStatsState";
import { useClassContext } from "../../hooks/classContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/authContext";
import { ChevronDown, Funnel, RotateCw, Search } from "lucide-react";
import Popup from "reactjs-popup";
import { useLogReg } from "../Modals/LogRegProvider";

const TeacherStudentsTab = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { state, updateState, refreshStats, filteredStats } = useStudentStatsState();
  const { setSelectedStudent } = useClassContext();

  const handleSearch = (query: string) => {
    updateState({ searchQuery: query });
  };
  const handleGradeFilter = (grade: string) => {
    updateState({ gradeLevel: grade });
  };

  const handleViewDetails = useCallback((student: any) => {
    setSelectedStudent(student);
    navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/students/${student.uid}`);
  }, [setSelectedStudent, navigate, formattedGradeLevel, role]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Student Progress
        </h1>
      </div>
      <div className="grid gap-6 md:grid-cols-1 flex-col text-left items-center justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex flex-col ">
            <h2 className="font-medium">Student List</h2>
            <h2 className="text-sm text-gray-500">
              View your students and their progress
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center bg-white rounded-lg">
              <button
                title="Search"
                type="button"
                className="absolute left-1 p-2 text-gray-500 hover:text-[#2C3E50]"
              >
                <Search size={20} />
              </button>
              <input
                type="text"
                placeholder="Search students..."
                className="w-full px-10 py-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50]"
                value={state.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Popup
                trigger={
                  <button
                    title="Filter"
                    aria-label="Filter"
                    type="button"
                    className="flex px-4 py-2 text-lg font-bold items-center border-1 border-gray-200 rounded-lg shadow-sm bg-white hover:bg-gray-100 transition duration-200 ease-in-out"
                    tabIndex={0}
                  >
                    <Funnel size={20} className="mr-2" />
                    Filter
                  </button>
                }
                position="bottom right"
                on="click"
                closeOnDocumentClick
                arrow={false}
                contentStyle={{
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  boxShadow: "none",
                }}
                overlayStyle={{ background: "rgba(0,0,0,0.05)" }}
                nested
                lockScroll
                children={
                  ((close: () => void) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col bg-white shadow-xl rounded-lg mt-2 p-2 border border-gray-200 min-w-[160px] focus:outline-none"
                      tabIndex={-1}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") close();
                      }}
                    >
                      <div className="p-4 space-y-4">
                        <div className="mt-2 mb-2 text-left relative">
                          <select
                            title="Filter by role"
                            className={`w-36 p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none appearance-none ${state.gradeLevel ? "border-[#2C3E50]" : "border-gray-300"}`}
                            value={state.gradeLevel}
                            onChange={(e) => handleGradeFilter(e.target.value)}
                          >
                            <option value="">
                              {state.gradeLevel ? "All" : ""}
                            </option>
                            <option value="Grade 1">Grade 1</option>
                            <option value="Grade 2">Grade 2</option>
                            <option value="Grade 3">Grade 3</option>
                            <option value="Grade 4">Grade 4</option>
                            <option value="Grade 5">Grade 5</option>
                            <option value="Grade 6">Grade 6</option>
                          </select>
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <ChevronDown size={20} />
                          </span>
                          <label
                            className={`absolute text-lg font-medium left-3 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${state.gradeLevel ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                            htmlFor="Filter by grade level"
                          >
                            Grade Level
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )) as any
                }
              />
            </div>
            <button
              title="Refresh"
              type="button"
              className="flex items-center gap-2 p-3 text-sm shadow-sm rounded-lg border border-gray-200 hover:bg-gray-100"
              onClick={refreshStats}
            >
              {state.isLoading ?
                <SpinLoadingColored size={6}/>
              : 
                <RotateCw size={22} />
              }
            </button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-1 flex-col text-left items-center justify-between">
          <div className="space-y-4">
            {state.isLoading ? (
              <div className="flex items-center justify-center h-screen gap-2">
                <SpinLoadingColored size={8} />
                <span className="text-lg">Loading students...</span>
              </div>
            ) : (
              filteredStats.length > 0 ? filteredStats.map((student: any, index: number) => (
                <div
                  key={student.uid || index}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                >
                  <div className="relative flex items-center gap-3 px-15">
                    <img
                      loading="lazy"
                      src={student?.photoURL || imageSrc.woman}
                      alt="Avatar"
                      className="absolute top-auto left-0 h-10 w-10 rounded-full border border-gray-200 shadow-sm object-contain"
                    />
                    <div className="text-[#2C3E50]">
                      <div className="flex gap-2 items-center">
                        <h4 className="text-base font-bold">{student?.displayName}</h4>
                        <p className="text-sm font-bold text-muted-foreground bg-[#2C3E50] text-white px-2 py-1 rounded">
                          {student?.gradeLevel || student?.gradeLevels?.join("~") || "No Grade Level"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {student?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{student.stats?.overallProgress} %</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="bg-[#2C3E50] h-2 rounded-full"
                          style={{ width: `${student.stats?.overallProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      className="flex items-center gap-1 px-3 py-2 text-xs rounded-xs shadow-xs border border-gray-200 hover:bg-gray-100 focus:text-white focus:bg-[#2C3E50] focus:drop-shadow-lg"
                      onClick={() => handleViewDetails(student)}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              )):(
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No students found.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentsTab;
