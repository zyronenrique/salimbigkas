import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable';
import html2canvas from 'html2canvas-pro';
import { SpinLoadingColored } from "../Icons/icons";
import { ChevronLeft, RotateCw } from "lucide-react";
import { useStudentStatsState } from "./useStudentStatsState";
import { useClassContext } from "../../hooks/classContext";
import CustomSelect from "../Select/CustomSelect";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authContext";

const COLORS = ["#2C3E50", "#2980B9", "#27AE60", "#E67E22", "#8E44AD", "#E74C3C"];

const StudentProgressTab = () => {
    const navigate = useNavigate();
    const { setLoading } = useAuth();
    const { state, refreshStats, TimeSpentData, TimeTooltip } = useStudentStatsState();
    const { selectedStudent } = useClassContext();

    const [selectedYunit, setSelectedYunit] = useState<string | number>(
        Object.keys(selectedStudent?.stats?.quizScoresGrouped || {})[0] || ""
    );

    const yunitOptions = Object.keys(selectedStudent?.stats?.quizScoresGrouped || {}).map((yunit) => ({
        value: yunit,
        label: `Yunit ${yunit}`,
    }));
    const selectedYunitOption = yunitOptions.find(opt => opt.value === selectedYunit);

    const quizScoresData = useMemo(() => {
        const grouped = selectedStudent?.stats?.quizScoresGrouped || {};
        const lessons = grouped[selectedYunit] || {};
        return Object.values(lessons).flat().map((quiz: any) => ({
            quizId: quiz.quizId,
            lessonNumber: quiz.lessonNumber,
            category: quiz.category,
            score: quiz.score,
            total: quiz.totalQuizScore,
        }));
    }, [selectedStudent, selectedYunit]);

    const seatworkScoresData = useMemo(() => {
        const grouped = selectedStudent?.stats?.seatworkScoresGrouped || {};
        const lessons = grouped[selectedYunit] || {};
        return Object.values(lessons).flat().map((seatwork: any) => ({
            seatworkId: seatwork.seatworkId,
            lessonNumber: seatwork.lessonNumber,
            category: seatwork.category,
            score: seatwork.score,
            total: seatwork.totalSeatworkScore,
        }));
    }, [selectedStudent, selectedYunit]);

    const handleDownloadPDF = async () => {
        const dashboard = document.getElementById("analytics-dashboard");
        if (!dashboard) return;
        try {
            setLoading(true);
            const canvas = await html2canvas(dashboard, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width, canvas.height],
            });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            // Add a new page for tables
            pdf.addPage();
            // Quiz Scores Table
            pdf.text("Quiz Scores", 20, 30);
            autoTable(pdf, {
                startY: 40,
                head: [["Quiz ID", "Lesson #", "Category", "Score", "Total"]],
                body: quizScoresData.map(row => [
                    row.quizId,
                    row.lessonNumber,
                    row.category,
                    row.score,
                    row.total
                ]),
                theme: "striped",
            });
            // Seatwork Scores Table
            pdf.text("Seatwork Scores", 20, (pdf as any).lastAutoTable.finalY + 20);
            autoTable(pdf, {
                startY: (pdf as any).lastAutoTable.finalY + 30,
                head: [["Seatwork ID", "Lesson #", "Category", "Score", "Total"]],
                body: seatworkScoresData.map(row => [
                    row.seatworkId,
                    row.lessonNumber,
                    row.category,
                    row.score,
                    row.total
                ]),
                theme: "striped",
            });
            pdf.save("student-progress-report.pdf");
        } catch (error) {
            // silent catch
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            id="analytics-dashboard"
            className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-[80vh] rounded-xl shadow-lg"
        >
            <div className="flex items-center justify-between">
                <motion.button
                    type="button"
                        className="flex items-center gap-2 text-2xl font-bold truncate transition duration-200 ease-in-out hover:text-[#2C3E50]"
                        onClick={() => navigate(-1)}
                        aria-label="Back"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                    <ChevronLeft size={22} strokeWidth={4} />
                    <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                        {selectedStudent?.displayName || "Student"}'s Progress
                    </span>
                </motion.button>
                <div className="flex items-center gap-2">
                    <button
                        disabled={state.isLoading}
                        type="button"
                        onClick={handleDownloadPDF}
                        className="ml-4 px-6 py-2 bg-[#2C3E50] text-white rounded-lg font-semibold hover:bg-[#34495E] transition"
                        title="Download PDF"
                    >
                        Generate report
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
            {state.isLoading  ? (
                <div className="flex items-center justify-center h-screen gap-2">
                    <SpinLoadingColored size={8} />
                    <span className="text-lg">
                        Loading student progress...
                    </span>
                </div>
            ) : (
                <div className="pt-2 text-[#2C3E50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-md flex flex-col justify-evenly items-center">
                            <h2 className="font-bold text-2xl mb-4">Progress Overview</h2>
                            <div className="flex flex-col gap-4 w-full text-xl">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Lesson Progress</span>
                                    <span className="text-xl font-bold text-[#2980B9]">
                                        {selectedStudent?.stats?.lessonProgress || 0}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Quiz Progress</span>
                                    <span className="text-xl font-bold text-[#27AE60]">
                                        {selectedStudent?.stats?.quizProgress || 0}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Seatwork Progress</span>
                                    <span className="text-xl font-bold text-[#27AE60]">
                                        {selectedStudent?.stats?.seatworkProgress || 0}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Overall Progress</span>
                                    <span className="text-xl font-bold text-[#E67E22]">
                                        {selectedStudent?.stats?.overallProgress || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex flex-col text-[#2C3E50]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#2C3E50]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18"/>
                                    </svg>
                                    Quiz Scores
                                </h3>
                                <h1 className="text-xl font-bold">{selectedStudent?.stats?.totalQuizzesAnswered || 0} Quizzes Answered</h1>
                            </div>
                            <div className="mb-2 items-center justify-center flex gap-2">
                                <label className="text-sm font-medium mr-2">Yunit:</label>
                                <CustomSelect
                                    options={yunitOptions}
                                    value={selectedYunitOption}
                                    onChange={(option: any) => setSelectedYunit(option?.value)}
                                    placeholder="Select Yunit"
                                    isMulti={false}
                                    styles={{
                                        control: (provided: any) => ({
                                            ...provided,
                                            backgroundColor: "#fff",
                                            borderColor: "#2980B9",
                                            minHeight: 36,
                                            fontSize: "1rem",
                                            color: "#2C3E50",
                                            boxShadow: "none",
                                            width: "100%",
                                            maxWidth: 220,
                                        }),
                                        singleValue: (provided: any) => ({
                                            ...provided,
                                            color: "#2C3E50",
                                            fontWeight: 600,
                                        }),
                                        menu: (provided: any) => ({
                                            ...provided,
                                            backgroundColor: "#fff",
                                            color: "#2C3E50",
                                        }),
                                        option: (provided: any, state: any) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected ? "#2C3E50" : "#fff",
                                            color: state.isSelected ? "#fff" : "#2C3E50",
                                            fontWeight: state.isSelected ? 700 : 400,
                                        }),
                                    }}
                                />
                            </div>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={quizScoresData}
                                        dataKey="score"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={60}
                                        label={({ category, score, total, x, y, index }) => (
                                            <text
                                                x={x}
                                                y={y}
                                                fill={COLORS[index % COLORS.length]}
                                                fontSize={16}
                                                fontWeight={700}
                                                textAnchor="middle"
                                            >
                                                {`${category}: ${score} / ${total} pts.`}
                                            </text>
                                        )}
                                    >
                                        {quizScoresData.map((_, idx) => (
                                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(_, __, { payload }) => [
                                            `${payload.category}: ${payload.score} / ${payload.total} pts.`
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex flex-col text-[#2C3E50]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#2C3E50]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18"/>
                                    </svg>
                                    Seatwork Scores
                                </h3>
                                <h1 className="text-xl font-bold">{selectedStudent?.stats?.totalSeatworksAnswered || 0} Seatworks Answered</h1>
                            </div>
                            <div className="mb-2 items-center justify-center flex gap-2">
                                <label className="text-sm font-medium mr-2">Yunit:</label>
                                <CustomSelect
                                    options={yunitOptions}
                                    value={selectedYunitOption}
                                    onChange={(option: any) => setSelectedYunit(option?.value)}
                                    placeholder="Select Yunit"
                                    isMulti={false}
                                    styles={{
                                        control: (provided: any) => ({
                                            ...provided,
                                            backgroundColor: "#fff",
                                            borderColor: "#2980B9",
                                            minHeight: 36,
                                            fontSize: "1rem",
                                            color: "#2C3E50",
                                            boxShadow: "none",
                                            width: "100%",
                                            maxWidth: 220,
                                        }),
                                        singleValue: (provided: any) => ({
                                            ...provided,
                                            color: "#2C3E50",
                                            fontWeight: 600,
                                        }),
                                        menu: (provided: any) => ({
                                            ...provided,
                                            backgroundColor: "#fff",
                                            color: "#2C3E50",
                                        }),
                                        option: (provided: any, state: any) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected ? "#2C3E50" : "#fff",
                                            color: state.isSelected ? "#fff" : "#2C3E50",
                                            fontWeight: state.isSelected ? 700 : 400,
                                        }),
                                    }}
                                />
                            </div>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={seatworkScoresData}
                                        dataKey="score"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={60}
                                        label={({ category, score, total, x, y, index }) => (
                                            <text
                                                x={x}
                                                y={y}
                                                fill={COLORS[index % COLORS.length]}
                                                fontSize={16}
                                                fontWeight={700}
                                                textAnchor="middle"
                                            >
                                                {`${category}: ${score} / ${total} pts.`}
                                            </text>
                                        )}
                                    >
                                        {seatworkScoresData.map((_, idx) => (
                                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(_, __, { payload }) => [
                                            `${payload.category}: ${payload.score} / ${payload.total} pts.`
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md mt-8">
                        <h3 className="font-semibold mb-4">
                            Time Spent per Lesson
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={TimeSpentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="lessonName"
                                tick={{ fontSize: 12, fill: "#2C3E50" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#2C3E50" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<TimeTooltip />} />
                            <Bar
                                dataKey="timeSpent"
                                fill="#2C3E50"
                                name="Time Spent (min)"
                                radius={[8, 8, 0, 0]}
                            />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProgressTab;
