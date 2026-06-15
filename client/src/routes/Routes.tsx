import { FC, lazy} from "react";
import { Route } from "react-router-dom";
const YunitLessons = lazy(() => import("../components/Class/YunitLessons"));
const ManageMembers = lazy(() => import("../components/Class/ManageMembers"));
const ClassGrade = lazy(() => import("../components/Class/ClassGrade"));
const ClassAssignments = lazy(() => import("../components/Class/ClassAssignments"));
const SeatworkQuizForm = lazy(() => import("../components/SeatworkQuiz/SeatworkQuizForm/SeatworkQuizForm"));
const LessonForm = lazy(() => import("../components/Lesson/LessonForm"));
const BigkasHome = lazy(() => import("../components/Bigkas/BigkasHome"));
const NewLevel = lazy(() => import("../components/Bigkas/NewLevel"));
const LevelSelection = lazy(() => import("../components/Bigkas/LevelSelection"));
const ModeSelection = lazy(() => import("../components/Bigkas/ModeSelection"));
const PlayBigkas = lazy(() => import("../components/Bigkas/PlayBigkas"));
const GameCompleted = lazy(() => import("../components/Bigkas/GameCompleted"));
const Quizzes = lazy(() => import("../components/SeatworkQuiz/Quizzes"));
const Seatworks = lazy(() => import("../components/SeatworkQuiz/Seatworks"));
const SeatworkQuizTake = lazy(() => import("../components/SeatworkQuiz/SeatworkQuizTake/SeatworkQuizTake"));
const QuizHome = lazy(() => import("../components/SeatworkQuiz/QuizHome"));
const SeatworkHome = lazy(() => import("../components/SeatworkQuiz/SeatworkHome"));
const AddMember = lazy(() => import("../components/Class/AddMember"));
const SeatworkQuizResult = lazy(() => import("../components/SeatworkQuiz/SeatworkQuizTake/SeatworkQuizResult"));
const SelectType = lazy(() => import("../components/Class/SelectType"));
const ArchiveLessons = lazy(() => import("../components/Class/ArchiveLessons"));
const QSLeaderboard = lazy(() => import("../components/SeatworkQuiz/QSLeaderboard"));
const Lesson = lazy(() => import("../components/Lesson/Lesson"));
const LessonAbout = lazy(() => import("../components/Lesson/LessonAbout"));
const LessonFiles = lazy(() => import("../components/Lesson/LessonFiles"));
const Class = lazy(() => import("../components/Class/Class"));
const ClassesTab = lazy(() => import("../components/Class/ClassesTab"));
const NewClass = lazy(() => import("../components/Class/NewClass"));
const LessonPagbasa = lazy(() => import("../components/Lesson/LessonPagbasa"));
const CalendarTab = lazy(() => import("../components/Calendar/CalendarTab"));
const SettingsDashboardTab = lazy(() => import("../components/Settings/SettingsDashboard"));
const NotificationTab = lazy(() => import("../components/Notification/Notifications"));

export const classRoutes = ({ MyCourses }: { MyCourses: FC }) => [
  <Route path="classes" element={<ClassesTab />} />,
  <Route path="classes/add" element={<NewClass />} />,
  <Route path="classes/class/:classId/edit" element={<NewClass />} />,
  <Route path="classes/class/:classId/*" element={<Class />}>
    <Route index element={<MyCourses />} />
    <Route path="my-courses" element={<MyCourses />} />
    <Route path="my-courses/:yunitNumber/lessons" element={<YunitLessons />} />
    <Route path="my-courses/:yunitNumber/lessons/archive" element={<ArchiveLessons />} />
    <Route path="my-courses/:yunitNumber/lessons/add" element={<LessonForm />} />
    <Route path="my-courses/:yunitNumber/lessons/lesson/:lessonId/edit" element={<LessonForm />} />
    <Route path="my-courses/:yunitNumber/lessons/select-type" element={<SelectType />} />
    <Route path="my-courses/:yunitNumber/lessons/quiz/add" element={<SeatworkQuizForm />} />
    <Route path="grades" element={<ClassGrade />} />
    <Route path="assignments" element={<ClassAssignments />} />
    <Route path="manage-students" element={<ManageMembers />} />
    <Route path="manage-students/add-member" element={<AddMember />} />
  </Route>
];

const lessonInsideRoutes = [
  <Route path="about" element={<LessonAbout />} />,
  <Route path="pagbasa/:index" element={<LessonPagbasa />} />,
  <Route path="files" element={<LessonFiles />} />,
];

export const lessonRoutes =
  <Route path="classes/class/:classId/my-courses/:yunitNumber/lessons/lesson/:lessonId/*" element={<Lesson />}>
    {lessonInsideRoutes}
  </Route>;

export const studentLessonRoutes = 
  <Route path="my-courses/:yunitNumber/lessons/lesson/:lessonId/*" element={<Lesson />}>
    {lessonInsideRoutes}
  </Route>;

export const quizRoutes = [
  <Route path="quizzes" element={<QuizHome />} />,
  <Route path="leaderboard" element={<QSLeaderboard />} />,
  <Route path="quizzes/select-quiz" element={<Quizzes />} />,
  <Route path="quizzes/:quizName/:quizId" element={<SeatworkQuizTake />} />,
  <Route path="quizzes/:quizName/:quizId/results" element={<SeatworkQuizResult />} />
];

export const seatworkRoutes = [
  <Route path="seatworks" element={<SeatworkHome />} />,
  <Route path="leaderboard" element={<QSLeaderboard />} />,
  <Route path="seatworks/select-seatwork" element={<Seatworks />} />,
  <Route path="seatworks/:seatworkName/:seatworkId" element={<SeatworkQuizTake />} />,
  <Route path="seatworks/:seatworkName/:seatworkId/results" element={<SeatworkQuizResult />} />
];

export const bigkasRoutes = [
  <Route path="bigkas" element={<BigkasHome />} />,
  <Route path="bigkas/new-level" element={<NewLevel />} />,
  <Route path="bigkas/select-level" element={<LevelSelection />} />,
  <Route path="bigkas/:level/select-mode" element={<ModeSelection />} />,
  <Route path="bigkas/:level/:mode/:playingId?" element={<PlayBigkas />} />,
  <Route path="bigkas/:level/leaderboard" element={<GameCompleted />} />,
];

export const allRoutes = [
  <Route path="schedule" element={<CalendarTab />} />,
  <Route path="settings" element={<SettingsDashboardTab />} />,
  <Route path="notifications" element={<NotificationTab />} />,
]