import { matchPath, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const routeTitles: { pattern: string; title: (params?: Record<string, string>) => string }[] = [
    // Admin
    { pattern: "Admin/:gradeLevels/dashboard", title: () => "Admin Dashboard | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/users", title: () => "Manage Users | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/users/add", title: () => "Add User | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/users/edit/:uid", title: () => "Edit User | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes", title: () => "Manage Classes | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/add", title: () => "Add Class | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/edit", title: () => "Edit Class | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/my-courses", title: () => "My Courses | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons", title: () => "Lessons | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/archive", title: () => "Archived Lessons | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/add", title: () => "Add Lesson | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/lesson/:lessonId/edit", title: () => "Edit Lesson | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/lesson/:lessonId", title: () => "Lesson | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/quiz/add", title: () => "Add Quiz | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/grades", title: () => "Grades | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/assignments", title: () => "Assignments | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/manage-students", title: () => "Manage Students | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/classes/class/:classId/manage-students/add-member", title: () => "Add Member | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/quizzes", title: () => "Quizzes | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/quizzes/select-quiz", title: () => "Select Quiz | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/quizzes/:quizName/:quizId", title: () => "Take Quiz | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/quizzes/:quizName/:quizId/results", title: () => "Quiz Results | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/bigkas", title: () => "Bigkas | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/bigkas/new-level", title: () => "New Level | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/bigkas/select-level", title: () => "Select Level | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/bigkas/:level/select-mode", title: () => "Select Mode | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/bigkas/:level/:mode/:playingId", title: () => "Play Bigkas | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/bigkas/:level/leaderboard", title: () => "Leaderboard | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/analytics", title: () => "Analytics | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/schedule", title: () => "Schedule | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/logs", title: () => "Logs | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/settings", title: () => "Settings | SalimBigkas" },
    { pattern: "Admin/:gradeLevels/notifications", title: () => "Notifications | SalimBigkas" },
    { pattern: "Admin/:gradeLevels", title: () => "Admin Dashboard | SalimBigkas" },
    // Teacher
    { pattern: "Teacher/:gradeLevels/dashboard", title: () => "Teacher Dashboard | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes", title: () => "My Classes | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/add", title: () => "Add Class | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/edit", title: () => "Edit Class | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/my-courses", title: () => "My Courses | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons", title: () => "Lessons | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/archive", title: () => "Archived Lessons | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/add", title: () => "Add Lesson | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/lesson/:lessonId/edit", title: () => "Edit Lesson | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/lesson/:lessonId", title: () => "Lesson | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/my-courses/:yunitNumber/lessons/quiz/add", title: () => "Add Quiz | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/grades", title: () => "Grades | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/assignments", title: () => "Assignments | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/manage-students", title: () => "Manage Students | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/classes/class/:classId/manage-students/add-member", title: () => "Add Member | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/quizzes", title: () => "Quizzes | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/quizzes/select-quiz", title: () => "Select Quiz | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/quizzes/:quizName/:quizId", title: () => "Take Quiz | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/quizzes/:quizName/:quizId/results", title: () => "Quiz Results | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/bigkas", title: () => "Bigkas | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/bigkas/new-level", title: () => "New Level | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/bigkas/select-level", title: () => "Select Level | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/bigkas/:level/select-mode", title: () => "Select Mode | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/bigkas/:level/:mode/:playingId", title: () => "Play Bigkas | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/bigkas/:level/leaderboard", title: () => "Leaderboard | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/students", title: () => "Students | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/students/:studentId", title: () => "Student Progress | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/schedule", title: () => "Schedule | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/settings", title: () => "Settings | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels/notifications", title: () => "Notifications | SalimBigkas" },
    { pattern: "Teacher/:gradeLevels", title: () => "Teacher Dashboard | SalimBigkas" },
    // Student
    { pattern: "Student/:gradeLevel/home", title: () => "Student Home | SalimBigkas" },
    { pattern: "Student/:gradeLevel/my-courses", title: () => "My Courses | SalimBigkas" },
    { pattern: "Student/:gradeLevel/my-courses/:yunitNumber/lessons", title: () => "Lessons | SalimBigkas" },
    { pattern: "Student/:gradeLevel/my-courses/:yunitNumber/lessons/lesson/:lessonId", title: () => "Lesson | SalimBigkas" },
    { pattern: "Student/:gradeLevel/quizzes", title: () => "Quizzes | SalimBigkas" },
    { pattern: "Student/:gradeLevel/quizzes/select-quiz", title: () => "Select Quiz | SalimBigkas" },
    { pattern: "Student/:gradeLevel/quizzes/:quizName/:quizId", title: () => "Take Quiz | SalimBigkas" },
    { pattern: "Student/:gradeLevel/quizzes/:quizName/:quizId/results", title: () => "Quiz Results | SalimBigkas" },
    { pattern: "Student/:gradeLevel/bigkas/select-level", title: () => "Select Level | SalimBigkas" },
    { pattern: "Student/:gradeLevel/bigkas/:level/select-mode", title: () => "Select Mode | SalimBigkas" },
    { pattern: "Student/:gradeLevel/bigkas/:level/:mode/:playingId", title: () => "Play Bigkas | SalimBigkas" },
    { pattern: "Student/:gradeLevel/bigkas/:level/leaderboard", title: () => "Leaderboard | SalimBigkas" },
    { pattern: "Student/:gradeLevel/settings", title: () => "Settings | SalimBigkas" },
    { pattern: "Student/:gradeLevel/notifications", title: () => "Notifications | SalimBigkas" },
    { pattern: "Student/:gradeLevel", title: () => "Student Dashboard | SalimBigkas" },
    // Firebase Auth handler (Google/Facebook redirect)
    { pattern: "https://salimbigkas.web.app/__/auth/handler", title: () => "Redirecting... | SalimBigkas" },
    { pattern: "https://salimbigkas.firebaseapp.com/__/auth/handler", title: () => "Redirecting... | SalimBigkas" },
    // Home
    { pattern: "", title: () => "SalimBigkas | Your AI-Powered Filipino Learning" },
    { pattern: "home", title: () => "SalimBigkas | Your AI-Powered Filipino Learning" },
    { pattern: "about-us", title: () => "About Us | SalimBigkas" },
    { pattern: "tos", title: () => "Terms of Service | SalimBigkas" },
    { pattern: "privacy", title: () => "Privacy Policy | SalimBigkas" },
    
];

const getTitle = (pathname: string) => {
    for (const { pattern, title } of routeTitles) {
        const match = matchPath({ path: pattern, end: true }, pathname);
        if (match) {
            const params: Record<string, string> = {};
            if (match.params) {
                Object.entries(match.params).forEach(([key, value]) => {
                    if (typeof value === "string") {
                        params[key] = value;
                    }
                });
            }
            return title(params);
        }
    }
    return "SalimBigkas | Your AI-Powered Filipino Learning";
};

const TitleManager = () => {
    const location = useLocation();
    const title = getTitle(location.pathname);

    return (
        <Helmet>
            <title>{title}</title>
        </Helmet>
    );
};

export default TitleManager;