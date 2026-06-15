import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import DashboardCard from "../Card/DashboardCard";
import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable';
import html2canvas from 'html2canvas-pro';
import { SpinLoadingColored } from "../Icons/icons";
import { useAnalyticsState } from "./useAnalyticsState";
import { RotateCw } from "lucide-react";

const AdminAnalyticsTab = () => {
  const { state, updateState, refreshAnalytics, lessonsCompletedData, dailyActiveData, formatDate, avgTimeSpentData, AvgTimeTooltip } = useAnalyticsState();

  const handleDownloadPDF = async () => {
    const dashboard = document.getElementById("analytics-dashboard");
    if (!dashboard) return;
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
    // Lessons Completed Table
    pdf.text("Lessons Completed per Student", 20, 30);
    autoTable(pdf, {
      startY: 40,
      head: [["Student UID", "Lessons Completed"]],
      body: lessonsCompletedData.map(row => [row.uid, row.count]),
      theme: "striped",
    });
    // Daily Active Users Table
    pdf.text("Daily Active Users", 20, (pdf as any).lastAutoTable.finalY + 20);
    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY + 30,
      head: [["Date", "Active Users"]],
      body: dailyActiveData.map(row => [formatDate(row.date), row.count]),
      theme: "striped",
    });
    // Average Time Spent Table
    pdf.text("Average Time Spent per Lesson", 20, (pdf as any).lastAutoTable.finalY + 20);
    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY + 30,
      head: [["Lesson Title", "Avg Time (min)"]],
      body: avgTimeSpentData.map(row => [row.title, row.avg.toFixed(2)]),
      theme: "striped",
    });
    pdf.save("analytics-report.pdf");
  };

  return (
    <div
      id="analytics-dashboard"
      className="p-8 space-y-4 bg-gradient-to-br from-gray-50 to-white min-h-screen rounded-xl shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Analytics
        </h1>
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
            onClick={refreshAnalytics}
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
            Loading analytics...
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 flex-1 gap-6">
            <DashboardCard
              title="Total Students"
              value={
                Object.keys(state.analytics?.lessonsCompletedPerStudent || {}).length
              }
              subtitle="+X% from last month"
            />
            <DashboardCard
              title="Average Quiz Score"
              value={
                typeof state.analytics?.avgQuizScore === "number"
                  ? state.analytics.avgQuizScore.toFixed(2)
                  : "0.00"
              }
              subtitle="All quizzes"
            />
            <DashboardCard
              title="Average Seatwork Score"
              value={
                typeof state.analytics?.avgSeatworkScore === "number"
                  ? state.analytics.avgSeatworkScore.toFixed(2)
                  : "0.00"
              }
              subtitle="All quizzes"
            />
            <DashboardCard
              title="Active Days"
              value={
                (Object.values(state.analytics?.dailyActive || {}) as number[]).filter((count) => count > 0).length
              }
              subtitle="Days with activity"
            />
          </div>
          <div className="pt-2 text-[#2C3E50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md flex flex-col">
                <h3 className="font-semibold mb-4">
                  Lessons Completed per Student
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={lessonsCompletedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="uid" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#2C3E50"
                      name="Lessons Completed"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex flex-col text-[#2C3E50]">
                <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2C3E50]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18"/>
                  </svg>
                  Analytics
                </h3>
                <div className="text-4xl font-bold mb-1">{dailyActiveData.length ? dailyActiveData[dailyActiveData.length - 1].count : 0}</div>
                <div className="text-sm text-gray-400 mb-4">Daily active users</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart
                    data={dailyActiveData}
                    onMouseMove={(state: any) => {
                      if (state && state.activeTooltipIndex !== undefined) {
                        updateState({ activeIndex: state.activeTooltipIndex });
                      }
                    }}
                    onMouseLeave={() => updateState({ activeIndex: undefined })}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12, fill: "#2C3E50" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#2C3E50" }}
                      domain={[0, "dataMax + 2"]}
                    />
                    <Tooltip
                      labelFormatter={formatDate}
                      contentStyle={{ background: "#2C3E50", border: "none", color: "#fff" }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value: any) => [`${value}`, "Active Users"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2C3E50"
                      strokeWidth={3}
                      dot={({ cx, cy, index }) => {
                        const isLatest = index === dailyActiveData.length - 1;
                        const isActive = index === state.activeIndex;
                        if (isLatest || isActive) {
                          return (
                            <circle
                              key={`dot-${index}`}
                              cx={cx}
                              cy={cy}
                              r={isLatest ? 6 : 4}
                              fill="#2C3E50"
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        }
                        return <g key={`dot-${index}`} />;
                      }}
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md mt-6">
              <h3 className="font-semibold mb-4">
                Average Time Spent per Lesson
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={avgTimeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    tick={({ x, y }) => <text x={x} y={y} />}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#2C3E50" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<AvgTimeTooltip />} />
                  <Bar
                    dataKey="avg"
                    fill="#2C3E50"
                    name="Avg Time (min)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsTab;
