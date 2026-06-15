import { useEffect, useState } from "react";
import { doGetAllClassMembersGrade } from "../../api/functions";
import { useAuth } from "../../hooks/authContext";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { useClassContext } from "../../hooks/classContext";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const ClassGrade = () => {
  const { currentUser, setLoading } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const { selectedClass } = useClassContext();

  useEffect(() => {
    const fetchandSetGrades = async () => {
      try {
        setLoading(true);
        const response = await doGetAllClassMembersGrade(selectedClass.id) as any;
        setGrades(response?.members.filter((m: any) => m.uid !== currentUser?.uid));
      } catch (error) {
        console.error("Error fetching class grades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchandSetGrades();
  }, [selectedClass.id, selectedClass.gradeLevel, currentUser]);

  const exportToExcel = () => {
    // Prepare data for export
    const data = grades?.flatMap((member) => {
      const quizRows = member?.quizScores?.map((q: any) => ({
        Student: member.displayName,
        Type: "Quiz",
        Score: q.score,
        "Total Items": q.totalQuizScore,
        Category: q.category,
      }));
      const seatworkRows = member?.seatworkScores?.map((s: any) => ({
        Student: member.displayName,
        Type: "Seatwork",
        Score: s.score,
        "Total Items": s.totalSeatworkScore,
        Category: s.category,
      }));
      return [...quizRows, ...seatworkRows];
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");
    // Export to file
    XLSX.writeFile(workbook, "class_grades.xlsx");
  };

  return (
    <motion.div
      className="p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between text-left">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Grades
          </h2>
          <p className="text-gray-500 mt-1">
            View and manage your students' performance at a glance.
          </p>
        </div>
        <motion.button
          type="button"
          title="Export to Excel"
          onClick={exportToExcel}
          className="bg-[#2C3E50] text-white px-6 py-4 rounded-lg shadow hover:bg-indigo-700 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Export to Excel
        </motion.button>
      </div>
      <OverlayScrollbarsComponent
        options={{ scrollbars: { autoHide: "leave", autoHideDelay: 500 } }}
        defer 
        className="flex-1 min-h-screen overflow-y-auto mt-4"
      >
        <table className="min-w-full divide-y divide-gray-200 rounded-xl bg-white">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Quizzes
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Quiz Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Seatworks
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Seatwork Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 max-h-[100vh] overflow-y-auto">
            {grades?.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-400 text-lg"
                >
                  No grades available.
                </td>
              </tr>
            ) : (
              grades?.map((member, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 transition text-left"
                >
                  <td className="px-6 py-4 flex items-center gap-4">
                    {member?.photoURL ? (
                      <img
                        loading="lazy"
                        src={member?.photoURL}
                        alt={member?.displayName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center text-indigo-700 font-bold text-lg">
                        {member?.displayName?.[0] || "?"}
                      </div>
                    )}
                    <span className="font-semibold text-gray-800">
                      {member?.displayName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {member?.quizScores?.length === 0
                      ? "---"
                      : (
                          <ul className="list-disc list-inside space-y-1">
                            {member?.quizScores?.map((q: any, i: number) => (
                              <li key={i}>
                                <span className="font-semibold">{q?.category}:</span>{" "}
                                {q?.score} / {q?.totalQuizScore}
                              </li>
                            ))}
                          </ul>
                        )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {member.quizzesTaken}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {member?.seatworkScores?.length === 0
                      ? "---"
                      : (
                          <ul className="list-disc list-inside space-y-1">
                            {member?.seatworkScores?.map((s: any, i: number) => (
                              <li key={i}>
                                <span className="font-semibold">{s?.category}:</span>{" "}
                                {s?.score} / {s?.totalSeatworkScore}
                              </li>
                            ))}
                          </ul>
                        )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {member?.seatworksTaken}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </OverlayScrollbarsComponent>
    </motion.div>
  );
};

export default ClassGrade;
