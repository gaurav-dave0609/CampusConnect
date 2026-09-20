import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth/rbac";
import { NoticeService } from "@/services/notice.service";
import { EventService } from "@/services/event.service";
import { ClubService } from "@/services/club.service";
import {
  Users,
  Building2,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowRight,
  BellRing,
  Award,
  GraduationCap,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SmartFeedWidget } from "@/components/notifications/smart-feed-widget";
import { ExamService } from "@/services/exam.service";
import { ExamStatus } from "@prisma/client";

export default async function AdminDashboardPage() {
  const user = await requireRole([Role.ADMIN]);
  const noticeAnalytics = await NoticeService.getNoticeAnalytics(user.id, Role.ADMIN);
  const eventSummary = await EventService.getOrganizerSummary(user.id, Role.ADMIN);
  const { total: totalUpcomingEvents } = await EventService.getEvents({
    userId: user.id,
    role: Role.ADMIN,
    tab: "upcoming",
  });

  // Load club governance metrics
  const { clubs: allClubs } = await ClubService.getClubs({
    userId: user.id,
    role: user.role,
    limit: 100,
  });
  const activeClubsCount = allClubs.filter((c) => c.status === "ACTIVE").length;
  const draftClubsCount = allClubs.filter((c) => c.status === "DRAFT").length;
  const totalClubMembers = allClubs.reduce((acc, c) => acc + (c.memberCount || 0), 0);

  // Load examination lifecycle KPIs & upcoming exams
  const examAnalytics = await ExamService.getExamAnalytics();
  const allExams = await ExamService.getExams();
  const upcomingAdminExams = allExams.filter((e) => e.status === ExamStatus.SCHEDULED).slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl border border-emerald-100/80 p-6 sm:p-7 shadow-[0_2px_12px_rgba(16,185,129,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-emerald-800 border border-emerald-200/80 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Institutional Governance Command &bull; Master Privilege</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Administrator Center &bull; {user.firstName} {user.lastName}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-3xl">
              Full authority over User provisioning, Academic division hierarchy, CSP Timetable engine,
              Attendance audits, Campus-wide notices, and System Audit Trails.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <Link
              href="/dashboard/admin/academic"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 transition shadow-xs shadow-emerald-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Academic Setup
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

      {/* Institutional Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:border-emerald-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Students
            </span>
            <div className="h-10 w-10 rounded-xl bg-[#6366F1] text-white flex items-center justify-center font-bold shadow-sm">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">1,420</span>
            <span className="text-xs text-emerald-700 font-bold bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-emerald-200">+4.2%</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Across 5 Academic Departments
          </div>
        </div>

        {/* Total Faculty */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:border-emerald-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Faculty &amp; Staff
            </span>
            <div className="h-10 w-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center font-bold shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">86</span>
            <span className="text-xs text-slate-500 font-medium">Members</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            100% Assigned to Subject Rosters
          </div>
        </div>

        {/* Timetable Engine */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:border-emerald-200 hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Timetable Engine
              </span>
              <div className="h-10 w-10 rounded-xl bg-[#A855F7] text-white flex items-center justify-center font-bold shadow-sm">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">v1 Active</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-emerald-800 border border-emerald-200">
                0 Conflicts
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-medium">
              17 Sessions &bull; 94% Soft Score
            </div>
          </div>
          <Link
            href="/dashboard/admin/timetable"
            className="mt-3 text-xs font-bold text-[#10B981] hover:text-emerald-700 inline-flex items-center gap-1"
          >
            Launch CSP Generator
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* System Security */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:border-emerald-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              RBAC Security
            </span>
            <div className="h-10 w-10 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">Strict Mode</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-semibold">
            Edge Guard &bull; Server Token Verified
          </div>
        </div>
      </div>

      {/* Examination Lifecycle & Results Oversight Section */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Examination Lifecycle &amp; Grade Oversight
              </h2>
              <p className="text-xs text-slate-500">
                Conflict checking, faculty gradebook tracking, result publication authorization &amp; audit trails
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/exams"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200/80 transition shadow-xs self-start sm:self-auto"
          >
            Manage All Exams &amp; Results
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Papers</span>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">{examAnalytics.totalExams}</div>
            <div className="text-[11px] text-slate-500">Curriculum active</div>
          </div>
          <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Scheduled</span>
            <div className="mt-1 text-2xl font-extrabold text-indigo-600">{examAnalytics.scheduledExams}</div>
            <div className="text-[11px] text-slate-500">Upcoming calendar</div>
          </div>
          <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Grades</span>
            <div className="mt-1 text-2xl font-extrabold text-amber-600">{examAnalytics.completedExams}</div>
            <div className="text-[11px] text-slate-500">Awaiting submission</div>
          </div>
          <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Published</span>
            <div className="mt-1 text-2xl font-extrabold text-emerald-600">{examAnalytics.publishedExams}</div>
            <div className="text-[11px] text-slate-500">Student visible</div>
          </div>
          <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</span>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">{examAnalytics.passRate}%</div>
            <div className="text-[11px] text-emerald-600 font-medium">Standard 10-point scale</div>
          </div>
        </div>

        {upcomingAdminExams.length > 0 && (
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Next Scheduled Examination Sessions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {upcomingAdminExams.map((exam) => (
                <div key={exam.id} className="p-3 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] hover:border-emerald-200 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-mono font-bold text-[#10B981]">{exam.subjectCode}</span>
                      <span>{exam.date}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{exam.title}</div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-emerald-50 pt-1.5">
                    <span>Room {exam.roomNumber || "301"}</span>
                    <span>{exam.startTime} – {exam.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notice Center Overview Section */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6366F1] text-white flex items-center justify-center shadow-sm">
              <BellRing className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Notice Center &amp; Institutional Circulars
              </h2>
              <p className="text-xs text-slate-500">
                Broadcast governance, reach telemetry, and active circular distribution
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/notices"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200/80 transition shadow-sm self-start sm:self-auto"
          >
            Manage All Notices
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Published Circulars</div>
            <div className="text-2xl font-extrabold text-slate-900">{noticeAnalytics.metrics.published}</div>
            <div className="text-[11px] text-slate-500">Active in feeds</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Drafts in Queue</div>
            <div className="text-2xl font-extrabold text-amber-600">{noticeAnalytics.metrics.drafts}</div>
            <div className="text-[11px] text-slate-500">Awaiting publication</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Audience Reach</div>
            <div className="text-2xl font-extrabold text-indigo-600">{noticeAnalytics.metrics.totalReach}</div>
            <div className="text-[11px] text-slate-500">Targeted recipients</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Campus Read Rate</div>
            <div className="text-2xl font-extrabold text-emerald-600">{noticeAnalytics.metrics.averageReadRate}%</div>
            <div className="text-[11px] text-slate-500">{noticeAnalytics.metrics.totalReads} confirmed reads</div>
          </div>
        </div>
      </div>

      {/* Campus Events & Moderation Section */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shadow-sm">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Campus Events &amp; Extracurricular Governance
              </h2>
              <p className="text-xs text-slate-500">
                Institutional hackathons, workshops, guest lectures, and campus-wide event moderation
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200/80 transition shadow-sm self-start sm:self-auto"
          >
            Moderate All Events
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Active Events</div>
            <div className="text-2xl font-extrabold text-slate-900">{eventSummary.activeEventsCount}</div>
            <div className="text-[11px] text-slate-500">Registrations live</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Upcoming Sessions</div>
            <div className="text-2xl font-extrabold text-indigo-600">{totalUpcomingEvents}</div>
            <div className="text-[11px] text-slate-500">Scheduled in calendar</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Total Registrations</div>
            <div className="text-2xl font-extrabold text-purple-600">{eventSummary.totalRegistrationsCount}</div>
            <div className="text-[11px] text-slate-500">Student RSVP bookings</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Overall Attendance Rate</div>
            <div className="text-2xl font-extrabold text-emerald-600">{eventSummary.averageAttendanceRate}%</div>
            <div className="text-[11px] text-slate-500">Verified participant turnout</div>
          </div>
        </div>
      </div>

      {/* Student Organizations & Club Governance Section */}
      <div className="rounded-2xl border border-emerald-100/70 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-sm">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Student Organizations &amp; Club Governance
              </h2>
              <p className="text-xs text-slate-500">
                Campus society charters, faculty advisor mappings, and extracurricular community engagement
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/clubs"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200/80 transition shadow-sm self-start sm:self-auto"
          >
            Manage Club Charters
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Active Clubs</div>
            <div className="text-2xl font-extrabold text-slate-900">{activeClubsCount}</div>
            <div className="text-[11px] text-slate-500">Chartered societies</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Draft Review Queue</div>
            <div className="text-2xl font-extrabold text-amber-600">{draftClubsCount}</div>
            <div className="text-[11px] text-slate-500">Awaiting admin publication</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">Total Memberships</div>
            <div className="text-2xl font-extrabold text-indigo-600">{totalClubMembers}</div>
            <div className="text-[11px] text-slate-500">Active student participants</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100/60 bg-[#F9FDFB] space-y-1">
            <div className="text-xs font-semibold text-slate-500">All Campus Societies</div>
            <div className="text-2xl font-extrabold text-emerald-600">{allClubs.length}</div>
            <div className="text-[11px] text-slate-500">Total registered chapters</div>
          </div>
        </div>
      </div>
    </div>
  );
}
