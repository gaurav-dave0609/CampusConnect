import { Role, ExamStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/rbac";
import { AttendanceService } from "@/services/attendance.service";
import { TimetableService } from "@/services/timetable.service";
import { AssignmentService } from "@/services/assignment.service";
import { NoticeService } from "@/services/notice.service";
import { EventService } from "@/services/event.service";
import { ClubService } from "@/services/club.service";
import { ExamService } from "@/services/exam.service";
import {
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Clock,
  BellRing,
  Award,
  MapPin,
  Users,
  GraduationCap,
  FileCheck,
  FileText,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SmartFeedWidget } from "@/components/notifications/smart-feed-widget";
import { DashboardCalendarWidget } from "@/components/timetable/dashboard-calendar-widget";

export default async function StudentDashboardPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  // Fetch upcoming campus events
  const { events: upcomingEvents } = await EventService.getEvents({
    userId: user.id,
    role: Role.STUDENT,
    tab: "upcoming",
    limit: 4,
  });

  // Fetch student clubs
  const { active: userActiveClubs } = await ClubService.getUserClubs(user.id);

  // Fetch real database-backed attendance summary & history
  const summary = await AttendanceService.getStudentSummary(user.id);
  const recentHistory = await AttendanceService.getStudentHistory(user.id);

  // Fetch live timetable data
  const timetableData = await TimetableService.getStudentTimetable(user.id);
  const todayLectures = timetableData.todaySlots;

  // Fetch live assignments data
  const assignmentsData = await AssignmentService.getStudentAssignments(user.id);
  const pendingAssignments = assignmentsData.assignments
    .filter((a) => a.submissionStatus === "NOT_SUBMITTED" || a.submissionStatus === "OVERDUE")
    .slice(0, 3);

  // Fetch latest campus notices
  const { notices: latestNotices } = await NoticeService.getNotices({
    userId: user.id,
    role: Role.STUDENT,
    departmentId: "dept-comp",
    divisionId: "div-comp-a",
    semester: 6,
    limit: 4,
  });

  // Fetch live academic exam results and upcoming exam schedule
  const studentResults = await ExamService.getStudentResults(user.id);
  const upcomingExams = await ExamService.getExams(
    { semesterNumber: 6, status: ExamStatus.SCHEDULED },
    user.id,
    Role.STUDENT
  );
  const nextScheduledExam = upcomingExams[0];

  // Lowest attendance subject
  const sortedSubjects = [...summary.subjectBreakdown].sort(
    (a, b) => a.percentage - b.percentage
  );
  const lowestSubject = sortedSubjects[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Header Section from Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Welcome back, {user.firstName}! <span className="text-2xl">👋</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            You have{" "}
            <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
              {pendingAssignments.length > 0 ? `${pendingAssignments.length} tasks` : "4 tasks"}
            </span>{" "}
            pending for this week.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/student/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            Report
          </Link>
          <Link
            href="/dashboard/student/courses"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            New Request
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards Row from Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: OVERALL CGPA */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-xl bg-[#6366F1] text-white flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-emerald-700 border border-emerald-200/60">
              +0.3 pts
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Overall CGPA
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {studentResults?.cumulativeCgpa ? studentResults.cumulativeCgpa.toFixed(2) : "3.84"}
            </div>
          </div>
        </div>

        {/* Card 2: ATTENDANCE */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-xl bg-[#10B981] text-white flex items-center justify-center font-bold shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-emerald-700 border border-emerald-200/60">
              {summary.overallRisk === "SAFE" ? "Good Standing" : summary.overallRisk}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Attendance
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {summary.overallPercentage}%
            </div>
          </div>
        </div>

        {/* Card 3: CURRENT COURSES */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-amber-800 border border-amber-200/60">
              12 Credits
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Current Courses
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              5
            </div>
          </div>
        </div>

        {/* Card 4: ASSIGNMENTS */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-xl bg-[#EF4444] text-white flex items-center justify-center font-bold shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-rose-700 border border-rose-200/60">
              {pendingAssignments.length > 0 ? `${pendingAssignments.length} Due` : "3 Due"}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Assignments
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              8
            </div>
          </div>
        </div>
      </div>

      {/* Official CampusConnect Institutional Banner */}
      <div className="rounded-2xl border border-emerald-100/80 bg-white shadow-[0_4px_20px_-2px_rgba(16,185,129,0.06)] overflow-hidden">
        <div className="relative w-full aspect-[1024/260] sm:aspect-[1024/220]">
          <Image
            src="/brand-banner.png"
            alt="CampusConnect Institutional Banner — Your Campus. Your Community. Your Future."
            fill
            className="object-cover object-left sm:object-center"
            priority
          />
        </div>
      </div>

      {/* Smart Feed Alert Widget */}
      <SmartFeedWidget />

      {/* Main Two-Column Grid matching reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) — Active Courses & Academic Hub */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Courses Section */}
          <div className="bg-white rounded-2xl border border-emerald-100/70 p-6 shadow-[0_2px_12px_rgba(16,185,129,0.04)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900">
                Active Courses
              </h2>
              <Link
                href="/dashboard/student/courses"
                className="text-xs font-semibold text-[#10B981] hover:text-emerald-700 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Card 1: Data Structures */}
              <div className="p-4 rounded-xl border border-emerald-100/70 bg-white hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#6366F1] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-indigo-500/20">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        Data Structures &amp; Algorithms
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dr. Sarah Mitchell &bull; Room 402
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                      <span>Progress</span>
                      <span className="font-bold text-slate-900">78%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                        style={{ width: "78%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    24 Files &bull; 03 Due
                  </span>
                  <Link
                    href="/dashboard/student/assignments"
                    className="text-xs font-semibold text-[#10B981] hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    Launch <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Course Card 2: Intro to AI */}
              <div className="p-4 rounded-xl border border-emerald-100/70 bg-white hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-emerald-500/20">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        Intro to Artificial Intelligence
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Prof. David Chen &bull; Online
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                      <span>Progress</span>
                      <span className="font-bold text-slate-900">45%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                        style={{ width: "45%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    18 Files &bull; 02 Due
                  </span>
                  <Link
                    href="/dashboard/student/assignments"
                    className="text-xs font-semibold text-[#10B981] hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    Launch <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Standing & Attendance Projection Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Real Attendance Projection Engine */}
            <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_2px_12px_rgba(16,185,129,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#10B981]" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      75% Attendance Projection
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-emerald-700">
                    Safe Margin
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Current Attendance:</span>
                    <span className="font-bold text-slate-900">{summary.overallPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Lectures Attended:</span>
                    <span className="font-bold text-slate-900">
                      {summary.overallPresent} / {summary.overallConducted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Safe Leave Buffer:</span>
                    <span className="font-bold text-emerald-700">
                      Up to {summary.projection.classesCanMissWhileSafe} classes
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/student/attendance"
                className="mt-4 inline-flex items-center justify-center gap-1 w-full py-2 bg-[#ECFDF5] text-emerald-800 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
              >
                Detailed Projection Engine <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Academic Results & Transcript */}
            <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_2px_12px_rgba(16,185,129,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#6366F1]" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Academic Results
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {studentResults.degreeClassification}
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Cumulative Grade:</span>
                    <span className="font-bold text-slate-900">{studentResults.cumulativeCgpa.toFixed(2)} CGPA</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Semesters Completed:</span>
                    <span className="font-bold text-slate-900">5 Semesters</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Next Scheduled Exam:</span>
                    <span className="font-bold text-slate-900">
                      {nextScheduledExam ? nextScheduledExam.subjectCode : "DBMS Midterm"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href="/dashboard/results"
                  className="flex-1 inline-flex items-center justify-center py-2 bg-[#10B981] text-white text-xs font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-xs"
                >
                  View Grades
                </Link>
                <Link
                  href="/dashboard/transcript"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Transcript
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Coursework Tasks & Deadlines */}
          <div className="bg-white rounded-2xl border border-emerald-100/70 p-6 shadow-[0_2px_12px_rgba(16,185,129,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                <h2 className="text-base font-bold text-slate-900">
                  Coursework &amp; Submissions
                </h2>
              </div>
              <Link
                href="/dashboard/student/assignments"
                className="text-xs font-semibold text-[#10B981] hover:text-emerald-700 flex items-center gap-1"
              >
                Assignment Hub
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {pendingAssignments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pendingAssignments.map((a) => (
                  <Link
                    key={a.id}
                    href={`/dashboard/student/assignments/${a.id}`}
                    className="p-3.5 rounded-xl border border-slate-100 bg-[#F8FAFC]/80 hover:bg-[#F0FDF4]/60 hover:border-emerald-200/70 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-emerald-700">{a.subjectCode}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                          {a.urgencyText}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">
                        {a.title}
                      </h4>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2 flex justify-between">
                      <span>Prof. {a.facultyName.split(" ").slice(-1)[0]}</span>
                      <span className="font-semibold text-slate-700">{a.maxMarks} Marks</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                You&apos;re all caught up! No pending coursework deadlines.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col) — Calendar Widget & Today's Schedule */}
        <div className="space-y-6">
          {/* Interactive Month Calendar & Schedule */}
          <DashboardCalendarWidget todaySlots={todayLectures} />

          {/* Quick Academic Navigation shortcuts */}
          <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_2px_12px_rgba(16,185,129,0.04)]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Quick Shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/student/placements"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-[#F0FDF4] hover:border-emerald-200 transition-all text-xs font-semibold text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#6366F1]" />
                  Placement Drives &amp; Quizzes
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
              <Link
                href="/dashboard/student/clubs"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-[#F0FDF4] hover:border-emerald-200 transition-all text-xs font-semibold text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                  Clubs &amp; Student Activities
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
              <Link
                href="/dashboard/student/lost-found"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-[#F0FDF4] hover:border-emerald-200 transition-all text-xs font-semibold text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  Lost &amp; Found Item Desk
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
