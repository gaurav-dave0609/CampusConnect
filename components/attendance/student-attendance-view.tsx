"use client";

import { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  History,
  BarChart3,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  StudentAttendanceSummary,
  SubjectAttendanceStat,
} from "@/services/attendance.service";
import { DemoSessionRecord } from "@/lib/attendance/demo-attendance";
import { calculateAttendanceProjection } from "@/lib/attendance/calculator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const subjectPalette = [
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-[#10B981]", text: "text-white" },
  { bg: "bg-amber-500", text: "text-white" },
  { bg: "bg-purple-500", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-rose-500", text: "text-white" },
];

export function StudentAttendanceView({
  initialSummary,
  initialHistory,
  initialCalendar,
}: {
  initialSummary: StudentAttendanceSummary;
  initialHistory: DemoSessionRecord[];
  initialCalendar: Record<string, DemoSessionRecord[]>;
}) {
  const [summary] = useState<StudentAttendanceSummary>(initialSummary);
  const [history] = useState<DemoSessionRecord[]>(initialHistory);
  const [calendar] = useState<Record<string, DemoSessionRecord[]>>(initialCalendar);

  // Tabs state
  const [activeTab, setActiveTab] = useState<
    "subjects" | "calendar" | "history" | "analytics" | "simulator"
  >("subjects");

  // History filters
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Calendar month state
  const [calMonth, setCalMonth] = useState(9); // September
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(
    "2026-09-10"
  );

  // Simulator target state
  const [simTarget, setSimTarget] = useState(75);
  const simProjection = calculateAttendanceProjection(
    summary.overallPresent,
    summary.overallConducted,
    simTarget
  );

  // Filtered history records
  const filteredHistory = history.filter((r) => {
    if (selectedSubjectFilter !== "ALL" && r.subjectCode !== selectedSubjectFilter) {
      return false;
    }
    if (selectedStatusFilter !== "ALL" && r.status !== selectedStatusFilter) {
      return false;
    }
    return true;
  });

  const riskBadge = (risk: string) => {
    if (risk === "SAFE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="h-3 w-3" />
          SAFE
        </span>
      );
    }
    if (risk === "WARNING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
          <AlertTriangle className="h-3 w-3" />
          WARNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
        <AlertCircle className="h-3 w-3" />
        CRITICAL
      </span>
    );
  };

  // Chart data preparation
  const barChartData = summary.subjectBreakdown.map((s) => ({
    name: s.subjectCode,
    fullName: s.subjectName,
    percentage: s.percentage,
    present: s.present,
    conducted: s.conducted,
  }));

  const pieData = [
    { name: "Attended", value: summary.overallPresent, color: "#10b981" },
    { name: "Absent", value: summary.overallAbsent, color: "#f43f5e" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Attendance Hero & Projection Card */}
      <div className="rounded-3xl border border-emerald-100/80 bg-white p-6 sm:p-8 shadow-[0_2px_14px_rgba(16,185,129,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-emerald-800 border border-emerald-200/80 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Official University Registry Calculation &bull; Semester 6</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Attendance Intelligence &amp; Projection
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Deterministic mathematical tracking of conducted classes, recovery trajectories, and risk margins.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Aggregate Attendance
              </div>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-4xl font-black text-slate-900">
                  {summary.overallPercentage}%
                </span>
                {riskBadge(summary.overallRisk)}
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-xs space-y-1">
              <div className="text-slate-600">
                Attended: <span className="font-bold text-slate-900">{summary.overallPresent}</span> / {summary.overallConducted}
              </div>
              <div className="text-slate-600">
                Missed: <span className="font-bold text-rose-600">{summary.overallAbsent}</span> classes
              </div>
            </div>
          </div>
        </div>

        {/* Projection Engine Insight Box */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-[#ECFDF5] via-white to-[#F0FDF4] border border-emerald-200/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#10B981]" />
                <span>Attendance Projection &bull; 75% Target Threshold</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {summary.projection.projectionMessage}
              </p>
              {summary.projection.impactOfMissingNextClass !== null && (
                <p className="text-xs text-slate-500">
                  Missing the upcoming session would drop your overall percentage from{" "}
                  <span className="font-semibold text-slate-700">{summary.overallPercentage}%</span> to{" "}
                  <span className="font-semibold text-rose-600">{summary.projection.impactOfMissingNextClass}%</span>.
                </p>
              )}
            </div>

            {/* Trajectory Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {summary.projection.attendanceProgression.map((step) => (
                <div
                  key={step.attendedCount}
                  className="px-2.5 py-1.5 rounded-xl border border-emerald-100 bg-white text-center text-[11px] shadow-xs min-w-[62px]"
                >
                  <div className="text-[10px] text-slate-400 font-medium">+{step.attendedCount} Class</div>
                  <div className="font-bold text-[#10B981]">
                    {step.projectedPercentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: "subjects", label: "Subject Breakdown", icon: BookOpen },
          { id: "calendar", label: "Attendance Calendar", icon: CalendarDays },
          { id: "history", label: "Full Session History", icon: History },
          { id: "analytics", label: "Visual Analytics", icon: BarChart3 },
          { id: "simulator", label: "Projection Simulator", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#ECFDF5] text-emerald-800 border border-emerald-200"
                  : "text-slate-600 hover:bg-[#F0FDF4] hover:text-emerald-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-[#10B981]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Subject Cards Grid */}
      {activeTab === "subjects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {summary.subjectBreakdown.map((subj, idx) => {
            const palette = subjectPalette[idx % subjectPalette.length];
            return (
              <div
                key={subj.subjectCode}
                className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`h-11 w-11 rounded-xl ${palette.bg} ${palette.text} flex items-center justify-center font-bold text-sm shadow-sm shrink-0`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {subj.subjectCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {subj.subjectName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Faculty: {subj.facultyName}
                      </p>
                    </div>
                  </div>
                  {riskBadge(subj.risk)}
                </div>

                {/* Progress Bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600">
                      {subj.present} / {subj.conducted} lectures attended
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {subj.percentage}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        subj.risk === "SAFE"
                          ? "bg-[#10B981]"
                          : subj.risk === "WARNING"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, subj.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Subject Projection Footer */}
                <div className="mt-4 pt-3 border-t border-emerald-50 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Target 75%:</span>
                  <span className="font-semibold text-emerald-700">
                    {subj.projectionText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Visual Attendance Calendar */}
      {activeTab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center border border-emerald-100">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  September 2026 Academic Calendar
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={calMonth <= 8}
                  onClick={() => setCalMonth(calMonth - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold px-2">Sep 2026</span>
                <button
                  type="button"
                  disabled={calMonth >= 10}
                  onClick={() => setCalMonth(calMonth + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid (Days) */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="font-bold text-slate-400 py-1">
                  {d}
                </div>
              ))}

              {/* Render September Days (1 to 30) */}
              {Array.from({ length: 30 }, (_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-09-${String(dayNum).padStart(2, "0")}`;
                const sessions = calendar[dateStr] || [];
                const hasSessions = sessions.length > 0;
                const hasAbsent = sessions.some((s) => s.status === "ABSENT");
                const isSelected = selectedCalendarDate === dateStr;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedCalendarDate(dateStr)}
                    className={`h-14 rounded-xl border p-1 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#10B981] bg-[#ECFDF5] text-emerald-950 ring-1 ring-[#10B981]"
                        : "border-slate-100 hover:border-emerald-200 hover:bg-[#F9FDFB]"
                    }`}
                  >
                    <span className="font-semibold text-slate-700">
                      {dayNum}
                    </span>
                    {hasSessions ? (
                      <div className="flex gap-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            hasAbsent ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                        />
                        <span className="text-[9px] text-slate-400">
                          {sessions.length} lec
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-300">
                        Off
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Attended All</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Missed &ge; 1 Lecture</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span>No Sessions</span>
              </div>
            </div>
          </div>

          {/* Date Inspection Drawer */}
          <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Lecture Roster for
            </h4>
            <div className="text-base font-bold text-slate-900 mb-4">
              {selectedCalendarDate || "Select a date"}
            </div>

            {selectedCalendarDate && calendar[selectedCalendarDate] ? (
              <div className="space-y-3">
                {calendar[selectedCalendarDate].map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-xl border border-emerald-50 bg-[#F9FDFB] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {sess.subjectName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          sess.status === "PRESENT"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {sess.status}
                      </span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Period {sess.periodNumber} &bull; {sess.facultyName}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 italic">
                      &quot;{sess.topicCovered}&quot;
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No classes recorded on this date.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Full Session History */}
      {activeTab === "history" && (
        <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-5">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-50">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Filter Subject:</span>
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="rounded-xl border border-emerald-200/80 bg-[#F9FDFB] px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              >
                <option value="ALL">All Subjects</option>
                <option value="COMP-301">COMP-301 DBMS</option>
                <option value="COMP-302">COMP-302 Computer Networks</option>
              </select>

              <span className="font-bold text-slate-500 uppercase text-[10px] ml-2">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="rounded-xl border border-emerald-200/80 bg-[#F9FDFB] px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              >
                <option value="ALL">All Records</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>

            <span className="text-xs text-slate-400">
              Showing {filteredHistory.length} sessions
            </span>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-100/70 text-slate-400 font-bold uppercase text-[10px] bg-[#F9FDFB]">
                  <th className="py-2.5 px-3 rounded-l-lg">Date</th>
                  <th className="py-2.5 px-2">Period</th>
                  <th className="py-2.5 px-2">Subject</th>
                  <th className="py-2.5 px-2">Faculty</th>
                  <th className="py-2.5 px-2">Topic Covered</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FDFB] transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {item.date}
                    </td>
                    <td className="py-3 px-2 text-slate-500">Period {item.periodNumber}</td>
                    <td className="py-3 px-2 font-medium text-slate-800">
                      {item.subjectName}
                    </td>
                    <td className="py-3 px-2 text-slate-600">
                      {item.facultyName}
                    </td>
                    <td className="py-3 px-2 text-slate-500 max-w-xs truncate">
                      {item.topicCovered}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "PRESENT"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Visual Analytics (Recharts) */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)]">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Subject Attendance vs 75% Regulatory Threshold
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Official university requirement is marked by the reference indicator.
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d1fae5",
                      borderRadius: "12px",
                      color: "#0f172a",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.08)",
                    }}
                  />
                  <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: "Target 75%", fill: "#f43f5e", fontSize: 10 }} />
                  <Bar dataKey="percentage" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Present vs Absent Ratio
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Total Conducted: {summary.overallConducted} lectures
              </p>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-emerald-50 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Attended Sessions:
                </span>
                <span className="font-bold text-slate-900">{summary.overallPresent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  Missed Sessions:
                </span>
                <span className="font-bold text-rose-600">{summary.overallAbsent}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Interactive Projection Simulator */}
      {activeTab === "simulator" && (
        <div className="max-w-3xl mx-auto rounded-3xl border border-emerald-100/70 bg-white p-8 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center border border-emerald-100">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Interactive Attendance Projection Simulator
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Adjust your custom institutional goal to project required upcoming attendance or margin.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F9FDFB] border border-emerald-100/60 space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-700">Configured Target:</span>
              <span className="text-xl font-black text-[#10B981]">{simTarget}%</span>
            </div>
            <input
              type="range"
              min={60}
              max={95}
              step={1}
              value={simTarget}
              onChange={(e) => setSimTarget(parseInt(e.target.value, 10))}
              className="w-full accent-[#10B981] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>60% (Minimum Exam Bar)</span>
              <span>75% (Standard University)</span>
              <span>90% (Distinction Honor)</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-emerald-200 bg-[#ECFDF5] space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#10B981]" />
              <span>Mathematical Engine Projection</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {simProjection.projectionMessage}
            </div>
            <p className="text-xs text-slate-600">
              Current attendance is {simProjection.currentPercentage}% ({summary.overallPresent} attended out of {summary.overallConducted} lectures).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
