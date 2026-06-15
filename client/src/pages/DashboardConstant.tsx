import { JSX } from 'react';
import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  BarChart,
  Logs,
  Presentation,
  BookUser,
//   NotebookText,
  UserRoundCog,
} from "lucide-react";
import { imageSrc } from '../components/Icons/icons';

export type AdminTab =
    | "dashboard"
    | "users"
    | "classes"
    | "pronunciation"
    // | "seatworks"
    // | "quizzes"
    // | "bigkas"
    | "analytics"
    | "schedule"
    | "logs"
    | "settings"
    | "notifications";

export const AdminNavItems: { tab: AdminTab; label: string; icon: JSX.Element }[] = [
    { tab: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={22} /> },
    { tab: "users", label: "Users", icon: <Users size={22} /> },
    { tab: "classes", label: "Classes", icon: <BookOpen size={22} /> },
    // { tab: "seatworks", label: "Seatwork", icon: <img loading='lazy' src={imageSrc.seatworkTab} alt="Seatwork Tab" className="w-8 h-8 object-contain" /> },
    // { tab: "quizzes", label: "Quizzes", icon: <img loading='lazy' src={imageSrc.quizTab} alt="Quizzes Tab" className="w-8 h-8 object-contain" /> },
    // { tab: "bigkas", label: "Bigkas", icon: <img loading='lazy' src={imageSrc.bigkasTab} alt="Bigkas Tab" className="w-8 h-8 object-contain" /> },
    { tab: "analytics", label: "Analytics", icon: <BarChart size={22} /> },
    { tab: "schedule", label: "Schedule", icon: <Calendar size={22} /> },
    { tab: "logs", label: "Logs", icon: <Logs size={22} /> },
    { tab: "settings", label: "Settings", icon: <Settings size={24} /> },
    { tab: "notifications", label: "Notifications", icon: <Bell size={24} /> },
];

export type TeacherTab =
    | "dashboard"
    | "classes"
    | "students"
    | "seatworks"
    | "quizzes"
    | "bigkas"
    | "schedule"
    | "settings"
    | "notifications";

export const TeacherNavItems: { tab: TeacherTab; label: string; icon: JSX.Element }[] = [
    { tab: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={24} /> },
    { tab: "classes", label: "My Classes", icon: <BookOpen size={24} /> },
    { tab: "students", label: "Students", icon: <Users size={24} /> },
    { tab: "seatworks", label: "Seatwork", icon: <img loading='lazy' src={imageSrc.seatworkTab} alt="Seatwork Tab" className="w-6 h-6 object-contain" /> },
    { tab: "quizzes", label: "Quizzes", icon: <img loading='lazy' src={imageSrc.quizTab} alt="Quizzes Tab" className="w-6 h-6 object-contain" /> },
    { tab: "bigkas", label: "Bigkas", icon: <img loading='lazy' src={imageSrc.bigkasTab} alt="Bigkas Tab" className="w-6 h-6 object-contain" /> },
    { tab: "schedule", label: "Schedule", icon: <Calendar size={24} /> },
    { tab: "settings", label: "Settings", icon: <Settings size={24} /> },
    { tab: "notifications", label: "Notifications", icon: <Bell size={24} /> },
];

export type ClassTab = "my-courses" | "grades" | "assignments" | "manage-students";

export const ClassNavItems: { tab: ClassTab; label: string; icon: JSX.Element }[] = [
    { tab: "my-courses", label: "Courses", icon: <Presentation size={22} />,},
    { tab: "grades", label: "Grades", icon: <BookUser size={22} /> },
    // { tab: "assignments", label: "Assignments", icon: <NotebookText size={22} /> },
    { tab: "manage-students", label: "Manage members", icon: <UserRoundCog size={22} /> },
];

export type LessonTab = "about" | { type: "pagbasa", idx: number } | "files";

export const LessonNavItems = (pagbasaUrls: any[]): { tab: LessonTab; label: string }[] => {
    return [
        { tab: "about", label: "Tungkol" },
        ...pagbasaUrls.map((_: any, idx: number) => ({
            tab: { type: "pagbasa" as "pagbasa", idx },
            label: `Pagbasa ${idx + 1}`,
        })),
        { tab: "files", label: "Mga File" },
    ];
};