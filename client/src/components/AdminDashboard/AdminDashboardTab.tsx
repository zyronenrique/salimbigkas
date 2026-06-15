import { formatDistanceToNow } from "date-fns";
import { CirclePlus, BookOpen, Calendar, Settings, User, RotateCw, LibraryBig, School2, TestTube2, UsersRound, UserRound, BookText } from "lucide-react";
import SkeletonCard from "../SkeletonLoaders/SkeletonCard";
import { SpinLoadingColored } from "../Icons/icons";
import SkeletonActivity from "../SkeletonLoaders/SkeletonActivity";
import { useAuth } from "../../hooks/authContext";
import { useNavigate } from "react-router-dom";
import { useAdminDbState } from "./useAdminDBState";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useLogReg } from "../Modals/LogRegProvider";

const AdminDashboardTab = () => {
  const navigate = useNavigate();
  const skeletonArray = Array.from({ length: 4 }, (_, index) => (
    <SkeletonCard key={index} />
  ));
  const { role } = useAuth();
  const { state, refreshStats } = useAdminDbState();
  const { formattedGradeLevel } = useLogReg();

  const currentDate = new Date();
  const monthYear = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",  
  });

  return (
    <div className="flex-1 p-6">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-sm shadow-sm rounded-lg border border-gray-200 hover:bg-gray-100 focus:text-white focus:bg-[#2C3E50] focus:drop-shadow-lg"
            onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/schedule`)}
          >
            <Calendar className="h-4 w-4" />
            {monthYear}
          </button>
          <button
            title="Refresh Stats"
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-sm shadow-sm rounded-lg border border-gray-200 hover:bg-gray-100"
            onClick={refreshStats}
          >
            {state.isLoading ?
              <SpinLoadingColored size={6}/>
              : 
              <RotateCw className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      {/* Stats divs */}
      <div className="grid gap-4 md:grid-cols-4 mb-4">
        {state.isLoading
          ? skeletonArray
          :
            <>
              <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
                <div className="pb-2">
                  <div className="text-sm font-medium">Total Users</div>
                </div>
                <div>
                  <div className="flex gap-1 items-center text-2xl font-bold">
                    {state.stats.totalUsers > 1
                      ? <UsersRound size={24} className="inline-block mr-1" />
                      : <UserRound size={24} className="inline-block mr-1" />}
                    {state.stats.totalUsers}
                  </div>
                  <p className="text-xs text-gray-500 text-muted-foreground">
                    +{state.stats.totalUsers - state.stats.totalUsersLastMonth} from last month
                  </p>
                </div>
              </div>

              <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
                <div className="pb-2">
                  <div className="text-sm font-medium">Active Teachers</div>
                </div>
                <div>
                  <div className="flex gap-1 items-center text-2xl font-bold">
                    {state.stats.activeTeachersCount > 1
                      ? <UsersRound size={24} className="inline-block mr-1" />
                      : <UserRound size={24} className="inline-block mr-1" />}
                    {state.stats.activeTeachersCount}
                  </div>
                  <p className="text-xs text-gray-500 text-muted-foreground">
                    +{state.stats.activeTeachersCount - state.stats.activeTeachersCountLastMonth} from last month
                  </p>
                </div>
              </div>

              <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
                <div className="pb-2">
                  <div className="text-sm font-medium">Active Students</div>
                </div>
                <div>
                  <div className="flex gap-1 items-center text-2xl font-bold">
                    {state.stats.activeStudentsCount > 1
                      ? <UsersRound size={24} className="inline-block mr-1" />
                      : <UserRound size={24} className="inline-block mr-1" />}
                    {state.stats.activeStudentsCount}
                  </div>
                  <p className="text-xs text-gray-500 text-muted-foreground">
                    +{state.stats.activeStudentsCount - state.stats.activeStudentsCountLastMonth} from last month
                  </p>
                </div>
              </div>

              <div className="flex flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200">
                <div className="pb-2">
                  <div className="text-sm font-medium">Total Lessons</div>
                </div>
                <div>
                  <div className="flex gap-1 items-center text-2xl font-bold">
                    <BookText size={24} className="inline-block mr-1" />
                    {state.stats.totalLessons}
                  </div>
                  <p className="text-xs text-gray-500 text-muted-foreground">
                    +{state.stats.totalLessons - state.stats.totalLessonsLastMonth} from last month
                  </p>
                </div>
              </div>
            </>
        }
      </div>

      {/* Recent activities section */}
      <OverlayScrollbarsComponent
        options={{ scrollbars: { autoHide: "leave" } }}
        defer
        className="flex-1 h-full flex-col text-left items-start justify-between p-6 rounded-lg bg-white shadow-sm border border-gray-200 md:max-h-[410px] lg:max-h-[450px] xl:max-h-[690px] 2xl:max-h-[520px] overflow-y-auto"
      >
        <div>
          <h2 className="font-medium">Recent Activities</h2>
          <h2 className="text-gray-400">
            Latest actions across the platform
          </h2>
        </div>
        <div className="flex-1 h-full space-y-4 mt-5">
          {state.isLoading 
            ? <SkeletonActivity />
            : state.fiveAct.length > 0 
              ? state.fiveAct.map((act) => (
                  <div
                    key={act.id}
                    className="flex flex-1 items-center gap-4 p-3 rounded-lg transition-colors duration-200 hover:bg-gray-50 justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full p-2 bg-[#2C3E50] flex items-center justify-center">
                        {act.activity.includes("user") && (
                          <User size={18} color="white" />
                        )}
                        {act.activity.includes("lesson") && (
                          <BookOpen size={18} color="white" />
                        )}
                        {act.activity.includes("system") && (
                          <Settings size={18} color="white" />
                        )}
                        {act.activity.includes("yunit") && (
                          <LibraryBig size={18} color="white" />
                        )}
                        {act.activity.includes("event") && (
                          <Calendar size={18} color="white" />
                        )}
                        {act.activity.includes("quiz") && (
                          <TestTube2 size={18} color="white" />
                        )}
                        {act.activity.includes("class") && (
                          <School2 size={18} color="white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{act.activity}</h4>
                        <div className="text-xs text-gray-500 text-muted-foreground mt-1">
                          {act.userName && <p>{act.userName}</p>}
                          {act.userRole && <p>Role: {act.userRole}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs">
                      {act.timestamp && formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))
              :
                <div className="flex flex-col items-center justify-center py-4">
                  <CirclePlus size={40} className="text-gray-300 mb-3" />
                  <div className="text-lg font-semibold text-gray-500">No recent activities found</div>
                  <div className="text-sm text-gray-400 mt-1">You're all caught up!</div>
                </div>
          }
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default AdminDashboardTab;
