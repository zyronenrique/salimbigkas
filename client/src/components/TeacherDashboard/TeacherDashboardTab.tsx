import { BookOpen, Calendar, RotateCw, School2, UsersRound, UserRound, BookText } from "lucide-react";
import { SpinLoadingColored } from "../Icons/icons";
import { useAuth } from "../../hooks/authContext";
import SkeletonCard from "../SkeletonLoaders/SkeletonCard";
import SkeletonDashboardClassCard from "../SkeletonLoaders/SkeletonDashboardClassCard";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTeacherDbState } from "./useTeacherDBState";
import { formatUserDate, getTimeFromCreatedAt } from "../../utils/helpers";
import SkeletonDBDLCard from "../SkeletonLoaders/SkeletonDBDLCard";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useLogReg } from "../Modals/LogRegProvider";

const TeacherDashboardTab = () => {
  const navigate = useNavigate();
  const skeletonCard = Array.from({ length: 4 }, (_, index) => (
    <SkeletonCard key={`card-${index}`} />
  ));
  const skeletonClass = Array.from({ length: 4 }, (_, index) => (
    <SkeletonDashboardClassCard key={`class-${index}`} />
  ));
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { state, refreshStats, refreshClasses, handleShowClass } = useTeacherDbState();

  const currentDate = new Date();
  const monthYear = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",  
  });

  return (
    <motion.div
      className="flex-1 p-6 space-y-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#2C3E50]">Dashboard</h1>
        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-sm shadow-sm rounded-lg bg-white border border-gray-200 hover:bg-gray-100 focus:drop-shadow-lg"
            onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/schedule`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar className="h-4 w-4" />
            {monthYear}
          </motion.button>
          <motion.button
            title="Refresh Stats"
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-sm shadow-sm rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
            onClick={()=> {
              refreshStats();
              refreshClasses();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {state.isLoading ?
              <SpinLoadingColored size={6}/>
            : 
              <RotateCw className="h-4 w-4" />
            }
          </motion.button>
        </div>
      </div>

      {/* Stats divs */}
      <div className="grid gap-4 md:grid-cols-4">
        {state.isLoading
          ? skeletonCard
        :
          <>
            <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
              <div className="pb-2">
                <div className="text-sm font-medium">Active Students</div>
              </div>
              <div>
                <div className="flex gap-1 items-center text-2xl font-bold">
                  {state.stats.activeStudents > 1
                    ? <UsersRound size={24} className="inline-block mr-1" />
                    : <UserRound size={24} className="inline-block mr-1" />}
                  {state.stats.activeStudents}
                </div>
                <p className="text-xs text-gray-500 text-muted-foreground">
                  +{state.stats.activeStudentsLastMonth} students from last month
                </p>
              </div>
            </div>
            <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
              <div className="pb-2">
                <div className="text-sm font-medium">Lessons Managed</div>
              </div>
              <div>
                <div className="flex gap-1 items-center text-2xl font-bold">
                  <BookText size={24} className="inline-block mr-1" />
                  {state.stats.lessonsManaged}
                </div>
                <p className="text-xs text-gray-500 text-muted-foreground">
                  {state.stats.activeLessons} active, {state.stats.upcomingLessons} upcoming
                </p>
              </div>
            </div>
            <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
              <div className="pb-2">
                <div className="text-sm font-medium">Average Student Seatwork Score</div>
              </div>
              <div className="w-full">
                <div className="text-2xl font-bold">{state.stats.avgStudentSeatworkScore}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-[#2C3E50] h-2 rounded-full"
                    style={{ width: `${state.stats.avgStudentSeatworkScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
              <div className="pb-2">
                <div className="text-sm font-medium">Average Student Quiz Score</div>
              </div>
              <div className="w-full">
                <div className="text-2xl font-bold">{state.stats.avgStudentQuizScore}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-[#2C3E50] h-2 rounded-full"
                    style={{ width: `${state.stats.avgStudentQuizScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        }
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming lessons section */}
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave" } }}
          defer
          className="lg:col-span-4 flex flex-col text-left items-start p-6 rounded-lg bg-white shadow-sm border border-gray-200 md:max-h-[390px] lg:max-h-[410px] xl:max-h-[680px] 2xl:max-h-[500px] w-full overflow-y-auto"
        >
          <div className="w-full">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Upcoming Lessons</h2>
            </div>
            <h2 className="text-gray-500 text-sm mt-2">
              Your draft lessons to be published
            </h2>
          </div>
          <div className="space-y-4 w-full mt-5">
            {state.isLoading
              ? <SkeletonDBDLCard />
              : state.draftLessons.length > 0 ? (
                  state.draftLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full p-2 bg-yellow-50 flex items-center justify-center">
                          <BookOpen size={18} className="text-yellow-500" />
                        </div>
                        <div>
                          <h4 className="text-yellow-900 font-medium">{lesson?.aralinPamagat}</h4>
                          <div className="flex items-center gap-2 mt-1 text-yellow-700">
                            <p className="text-xs">
                              {lesson?.gradeLevel}
                            </p>
                            <span className="text-xs">•</span>
                            <p className="text-xs">
                              {formatUserDate(lesson?.createdAt)}
                            </p>
                            <span className="text-xs">•</span>
                            <p className="text-xs">
                              {getTimeFromCreatedAt(lesson?.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* <div className="flex items-center gap-3">
                        <motion.button
                          type="button"
                          title="View Lesson"
                          className="flex items-center gap-1 px-3 py-2 text-xs shadow-sm rounded-xs border border-gray-200 hover:bg-gray-100 focus:text-white focus:bg-[#2C3E50] focus:drop-shadow-lg"
                          onClick={() => handleViewLesson(lesson.classId, lesson.yunitNumber, lesson)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View
                        </motion.button>
                      </div> */}
                    </div>
                  ))) : (
                    <p className="text-gray-500">No draft lessons available.</p>
              )}
          </div>
        </OverlayScrollbarsComponent>
        {/* Managed classes */}
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave" } }}
          defer
          className="flex flex-col lg:col-span-3 text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200 md:max-h-[390px] lg:max-h-[410px] xl:max-h-[680px] 2xl:max-h-[500px] w-full overflow-y-auto"
        >
          <div>
            <h2 className="font-medium">Managed Classes</h2>
            <h2 className="text-gray-400">Your active classes</h2>
          </div>
          <div className="w-full space-y-4 mt-5">
            {state.isLoading
              ? skeletonClass
              : state.classes.length > 0
                ? state.classes.map((cls: any, index: number) => (
                    <motion.div
                      key={cls.id}
                      className="p-4 border border-gray-200 rounded-lg space-y-2 justify-between"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <School2 size={20} className="text-gray-500" />
                          <h2 className="text-xl font-bold">{cls.gradeLevel}</h2>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm text-green-500 border border-green-200 bg-green-50">
                          Active
                        </div>
                      </div>
                      <p className="text-base font-medium text-gray-500">
                        {cls.className}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex text-sm text-white bg-[#2C3E50] px-2 py-1 gap-1 rounded-sm items-center">
                          {cls.totalMembers > 1
                            ? <UsersRound size={16} className="inline-block mr-1" />
                            : <UserRound size={16} className="inline-block mr-1" />}
                          <span className="font-medium">
                            {cls.totalMembers}
                          </span>{" "}
                          <span className="text-white">member(s)</span>
                        </div>
                        <button
                          title="View Class"
                          type="button"
                          className="px-3 py-2 text-xs shadow-sm rounded-xs border border-gray-200 hover:bg-gray-100 focus:text-white focus:bg-[#2C3E50] focus:drop-shadow-lg"
                          onClick={() => handleShowClass(cls)}
                        >
                          View Class
                        </button>
                      </div>
                    </motion.div>
                  ))
                : <p className="text-gray-500">No classes managed yet.</p>
            }
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </motion.div>
  );
};

export default TeacherDashboardTab;
