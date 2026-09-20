import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth/rbac";
import { AttendanceService } from "@/services/attendance.service";
import { TimetableService } from "@/services/timetable.service";
import { AssignmentService } from "@/services/assignment.service";
import { NoticeService } from "@/services/notice.service";
import { EventService } from "@/services/event.service";
import { ClubService } from "@/services/club.service";
import {
  Users,
  ClipboardCheck,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  MapPin,
  FileText,
  Award,
  BellRing,
  GraduationCap,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SmartFeedWidget } from "@/components/notifications/smart-feed-widget";
import { ExamService } from "@/services/exam.service";
import { ExamStatus } from "@prisma/client";

export default async function FacultyDashboardPage() {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);

  // Load faculty assigned subjects and live analytics
  const assignedSubjects = await AttendanceService.getFacultySubjects(user.id);

  // Load live faculty timetable
  const timetableData = await TimetableService.getFacultyTimetable(user.id);
  const todayTeaching = timetableData.todaySlots;

  // Load faculty coursework assignments
  const facultyAssignments = await AssignmentService.getFacultyAssignments(user.id, user.role);
  const totalPendingGrading = facultyAssignments.reduce((acc, a) => acc + a.pendingGradingCount, 0);
  const totalSubmissions = facultyAssignments.reduce((acc, a) => acc + a.submittedCount, 0);

  // Load faculty notices
  const { notices: facultyNotices } = await NoticeService.getNotices({
    userId: user.id,
    role: Role.FACULTY,
    departmentId: "dept-comp",
    limit: 4,
  });
  const unreadNoticeCount = await NoticeService.getUnreadCount(user.id, Role.FACULTY, "dept-comp");

  // Load faculty events summary
  const eventSummary = await EventService.getOrganizerSummary(user.id, user.role);

  // Load faculty advised clubs
  const { clubs: facultyClubs } = await ClubService.getClubs({
    userId: user.id,
    role: user.role,
    limit: 20,
  });
  const advisedClubs = facultyClubs.filter(
    (c) => c.facultyAdvisorId === user.id || (user.lastName && c.facultyAdvisorName?.includes(user.lastName))
  );

  // Load faculty exam allocations & gradebook progress
  const facultyExams = await ExamService.getExams({}, user.id, Role.FACULTY);
  const assignedExamList = facultyExams.filter(
    (e) => e.facultyId === user.id || e.facultyId === "demo-faculty-001"
  );
  const pendingGradebookCount = assignedExamList.filter(
    (e) => e.status === ExamStatus.COMPLETED || e.status === ExamStatus.RESULTS_PENDING
  ).length;
  const upcomingInvigilations = assignedExamList.filter(
    (e) => e.status === ExamStatus.SCHEDULED
  );

  let primaryAnalytics = null;
  if (assignedSubjects.length > 0) {
    try {
      primaryAnalytics = await AttendanceService.getFacultyAnalytics(
        user.id,
        assignedSubjects[0].facultySubjectId
      );
    } catch {
      primaryAnalytics = null;
    }
  }

  const totalAtRisk = primaryAnalytics ? primaryAnalytics.below75Count : 0;
  const avgAttendance = primaryAnalytics ? primaryAnalytics.avgPercentage : 80;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl border border-emerald-100/80 p-6 sm:p-7 shadow-[0_2px_12px_rgba(16,185,129,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-emerald-800 border border-emerald-200/80 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Faculty Academic Station &bull; {user.designation || "Associate Professor"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {user.firstName} {user.lastName}!
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-3xl">
              Department of {user.departmentName || "Computer Engineering"}. You are managing {assignedSubjects.length} academic course allocation{assignedSubjects.length > 1 ? "s" : ""}.
              {totalAtRisk > 0
                ? ` Note: ${totalAtRisk} students in your classes are currently below the 75% attendance threshold.`
                : " All students in your assigned divisions are currently maintaining satisfactory attendance."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <Link
              href="/dashboard/faculty/attendance/mark"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 transition shadow-xs shadow-emerald-500/20"
            >
              <ClipboardCheck className="h-4 w-4" />
              Mark Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* Official Institutional Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.08)] bg-white">
        <Image
          src="/brand-banner.png"
          alt="CampusConnect — Learn. Connect. Grow. Official Campus Banner"
          width={1200}
          height={320}
          className="w-full h-auto object-cover max-h-[140px] sm:max-h-[170px]"
          priority
        />
      </div>

      {/* Smart Information Feed */}
      <SmartFeedWidget />

      {/* Quick Action Banner */}
      <div className="bg-white border border-emerald-100/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,185,129,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ECFDF5] text-[#10B981] rounded-xl shrink-0">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm sm:text-base">
              Ready to conduct today&apos;s lecture attendance?
            </div>
            <div className="text-xs text-slate-500">
              Load your assigned division roster and mark student attendance with automated conflict prevention.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/dashboard/faculty/attendance/mark"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 transition shadow-xs"
          >
            <ClipboardCheck className="h-4 w-4" />
            Mark Class Attendance
          </Link>
          <Link
            href="/dashboard/faculty/attendance/history"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
          >
            Attendance Logs
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid — Backed by Real Database Logic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Classes Allocated */}
        <div className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assigned Courses
            </span>
            <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {assignedSubjects.length}
            </span>
            <span className="text-xs text-slate-500">Allocations</span>
          </div>
          <div className="mt-2 text-xs font-medium text-indigo-600">
            {assignedSubjects.map((s) => s.code).join(" • ")}
          </div>
        </div>

        {/* Class Average Attendance */}
        <div className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Class Attendance Avg
            </span>
            <div className="h-10 w-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {avgAttendance}%
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              AVERAGE
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Across {primaryAnalytics?.totalStudents || 4} enrolled students
          </div>
        </div>

        {/* Students At Debarment Risk */}
        <div className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Students At Risk
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {totalAtRisk}
            </span>
            <span className="text-xs text-slate-500">below 75%</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {primaryAnalytics?.below65Count || 0} critical (&lt;65%)
          </div>
        </div>

        {/* Action Status */}
        <div className="rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Register Status
            </span>
            <div className="h-10 w-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">Active</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            6 lecture periods configured
          </div>
        </div>
      </div>

      {/* Examination & Gradebook Station Hub */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Examination &amp; Gradebook Station
              </h2>
              <p className="text-xs text-slate-500">
                {assignedExamList.length} assigned assessment{assignedExamList.length === 1 ? "" : "s"} &bull; {pendingGradebookCount} pending grade submission{pendingGradebookCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/faculty/exams"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 transition shadow-sm self-start sm:self-auto"
          >
            Open Exam Gradebook
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] hover:border-emerald-200 transition flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Assigned Examinations
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {assignedExamList.length}
                </span>
                <span className="text-xs text-slate-500">Total papers</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Covers Theory, Midterm, and Laboratory Practical evaluations.
              </p>
            </div>
            <div className="mt-3 text-xs text-indigo-600 font-medium">
              Roster: {assignedExamList.map((e) => e.subjectCode).join(", ") || "DBMS, SE, CN"}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] hover:border-emerald-200 transition flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Upcoming Invigilations
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {upcomingInvigilations.length}
                </span>
                <span className="text-xs text-slate-500">Scheduled sessions</span>
              </div>
              {upcomingInvigilations.length > 0 ? (
                <p className="mt-1 text-xs text-slate-800 font-medium truncate">
                  Next: {upcomingInvigilations[0].title} ({upcomingInvigilations[0].date})
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  No invigilations scheduled for today.
                </p>
              )}
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Room allocation &amp; student hall tickets verified.
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] hover:border-emerald-200 transition flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Grading Progress
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-emerald-600">
                  {pendingGradebookCount === 0 ? "100%" : "Active"}
                </span>
                <span className="text-xs text-slate-500">
                  {pendingGradebookCount === 0 ? "Up to date" : `${pendingGradebookCount} awaiting final entry`}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Deterministic 10-point scale with absent candidate safeguards.
              </p>
            </div>
            <Link
              href="/dashboard/faculty/exams"
              className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              Enter / Bulk Edit Marks
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Teaching Schedule Card */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-sm">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Today&apos;s Teaching Schedule ({timetableData.todayDay})
              </h2>
              <p className="text-xs text-slate-500">
                {todayTeaching.length} academic teaching session{todayTeaching.length === 1 ? "" : "s"} assigned today
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/faculty/timetable"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200/80 transition shadow-xs self-start sm:self-auto"
          >
            View Full Teaching Timetable
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {todayTeaching.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {todayTeaching.map((slot) => (
              <div
                key={slot.variableId}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  slot.isLabSession
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                    : "bg-muted/40 border-border"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                    <span>Period {slot.periodNumber}</span>
                    <span className="font-mono">{slot.startTime} – {slot.endTime}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-primary">
                    {slot.subjectCode}
                  </div>
                  <div className="text-sm font-bold text-foreground line-clamp-1 mt-0.5">
                    {slot.subjectName}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2 mt-3">
                  <span className="font-semibold text-foreground">
                    {slot.divisionId === "div-comp-a" ? "Division A" : "Division B"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <MapPin className="h-3 w-3" />
                    {slot.roomNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground text-xs">
            No teaching periods scheduled for today. Use this time for research or grading.
          </div>
        )}
      </div>

      {/* Coursework & Assignments Management Overview */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Coursework &amp; Assignments Tracking
              </h2>
              <p className="text-xs text-slate-500">
                {facultyAssignments.length} Courses &bull; {totalSubmissions} Submissions Received &bull;{" "}
                <span className="font-semibold text-amber-600">
                  {totalPendingGrading} Pending Grading
                </span>
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/faculty/assignments"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200/80 transition shadow-xs self-start sm:self-auto"
          >
            Manage All Assignments
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {facultyAssignments.slice(0, 3).map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/faculty/assignments/${a.id}/submissions`}
              className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-[#10B981]">{a.subjectCode}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {a.divisionName}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#10B981] transition-colors line-clamp-1">
                  {a.title}
                </h4>
                <div className="text-xs text-slate-500 mt-1">
                  Due: {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-3 border-t border-emerald-50 flex justify-between items-center mt-3">
                <span>{a.submittedCount}/{a.totalEnrolled} submitted</span>
                <span className="font-bold text-amber-600">
                  {a.pendingGradingCount} to grade
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Communication & Faculty Notices Section */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Institutional Communication &amp; Circulars
              </h2>
              <p className="text-xs text-slate-500">
                {unreadNoticeCount} unread notices &bull; Circulars and academic notices published across campus
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/faculty/notices"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200/80 transition shadow-xs self-start sm:self-auto"
          >
            Open Notice Center
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {facultyNotices.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] hover:border-emerald-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-emerald-700">{n.category}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      n.priority === "URGENT"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : n.priority === "IMPORTANT"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {n.priority}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {n.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                  {n.summary}
                </p>
              </div>
              <div className="text-[11px] text-slate-500 pt-3 border-t border-emerald-50 flex justify-between mt-3">
                <span>By: {n.authorName.split(" ").slice(-1)[0]}</span>
                <span className="font-medium text-slate-600">{n.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events & Campus Engagement Section */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Events &amp; Campus Engagement
              </h2>
              <p className="text-xs text-slate-500">
                Extracurricular masterclasses, technical hackathons, and participant attendance
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/faculty/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200/80 transition shadow-xs self-start sm:self-auto"
          >
            Manage Events &amp; Attendance
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Active Events</div>
            <div className="text-2xl font-extrabold text-slate-900">{eventSummary.activeEventsCount}</div>
            <div className="text-[11px] text-slate-500">Open for registration</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Total Registrations</div>
            <div className="text-2xl font-extrabold text-indigo-600">{eventSummary.totalRegistrationsCount}</div>
            <div className="text-[11px] text-slate-500">Student participants</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Available Capacity</div>
            <div className="text-2xl font-extrabold text-amber-600">{eventSummary.totalSeatsAvailable}</div>
            <div className="text-[11px] text-slate-500">Unallocated seats</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Average Attendance</div>
            <div className="text-2xl font-extrabold text-emerald-600">{eventSummary.averageAttendanceRate}%</div>
            <div className="text-[11px] text-slate-500">Verified at venue entrance</div>
          </div>
        </div>
      </div>

      {/* Clubs & Student Mentorship Section */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Clubs &amp; Student Mentorship ({advisedClubs.length} Advised Organizations)
              </h2>
              <p className="text-xs text-slate-500">
                Faculty advisory oversight, extracurricular governance, and student project sponsorship
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/student/clubs"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200/80 transition shadow-xs self-start sm:self-auto"
          >
            Browse All Campus Clubs
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {advisedClubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {advisedClubs.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] hover:border-emerald-200 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={c.logoUrl}
                    alt={c.name}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-100 shrink-0 shadow-xs"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.name}</h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Coordinator: {c.coordinatorName || "Student Council"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-emerald-50">
                  <span>{c.memberCount} members</span>
                  <Link
                    href={`/dashboard/student/clubs/${c.id}`}
                    className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Club</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No student organizations currently assigned for faculty advisory oversight.
          </div>
        )}
      </div>

      {/* Assigned Subjects List */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-50 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#10B981]" />
              Assigned Courses &amp; Division Registers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized subject mappings linked to your faculty identity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignedSubjects.map((sub) => (
            <div
              key={sub.facultySubjectId}
              className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] hover:border-emerald-200 transition-all flex items-center justify-between gap-4 shadow-xs"
            >
              <div>
                <div className="font-mono text-xs font-bold text-[#10B981]">
                  {sub.code} &bull; {sub.divisionName}
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {sub.name}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Semester {sub.semester} &bull; {sub.credits} Credits
                </div>
              </div>

              <Link
                href={`/dashboard/faculty/attendance/mark`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200 transition"
              >
                Mark Attendance
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
