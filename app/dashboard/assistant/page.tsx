import { requireAuth } from "@/lib/auth/rbac";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CalendarDays,
  FileCheck,
  Megaphone,
  Briefcase,
  Compass,
  ArrowRight,
  Bot,
} from "lucide-react";
import { AIChatInterface } from "@/components/ai/ai-chat-interface";
import Link from "next/link";

export default async function AIAssistantPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Official Institutional Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.08)] bg-white">
        <Image
          src="/brand-banner.png"
          alt="CampusConnect — Learn. Connect. Grow. Official Campus Banner"
          width={1200}
          height={320}
          className="w-full h-auto object-cover max-h-[130px] sm:max-h-[160px]"
          priority
        />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-emerald-100/80 shadow-[0_2px_12px_-2px_rgba(16,185,129,0.04)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-emerald-800 border border-emerald-200/80 mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Zero-Trust Institutional Intelligence &bull; Role: {user.role}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            CampusConnect AI Assistant
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
            Native academic assistant integrated directly with your verified institutional records, role-based permissions, deterministic attendance formulas, and campus navigation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0FDF4] border border-emerald-200/90 text-xs font-bold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-[#10B981]" />
            <span>RBAC Protected</span>
          </div>
        </div>
      </div>

      {/* Main Content: Chat Interface + Capabilities Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Interface Column */}
        <div className="lg:col-span-8 h-[680px]">
          <AIChatInterface user={user} isExpandedView={true} />
        </div>

        {/* Capabilities & Shortcuts Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Architecture Guarantee Card */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-100/80 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#10B981]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Zero-Trust Architecture</h3>
                <p className="text-xs text-slate-500">Security &amp; Zero Hallucination</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The AI never queries the database directly. All interactions flow through backend authorization guards, ensuring you only receive verified, tamper-proof academic data for your account.
            </p>
          </div>

          {/* Capabilities Matrix */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-100/80 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Built-In Capabilities
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F9FDFB] border border-emerald-100/60">
                <div className="p-1.5 rounded-lg bg-emerald-500 text-white shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Attendance Intelligence</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Deterministic calculation of consecutive lectures needed to reach 75% or max missable lectures.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F9FDFB] border border-emerald-100/60">
                <div className="p-1.5 rounded-lg bg-indigo-500 text-white shrink-0">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Timetable Projections</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Projects future attendance based on your active weekly lecture and laboratory timetable.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F9FDFB] border border-emerald-100/60">
                <div className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Coursework &amp; Submissions</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Real-time status of pending coursework, due dates, and grading evaluations.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F9FDFB] border border-emerald-100/60">
                <div className="p-1.5 rounded-lg bg-purple-500 text-white shrink-0">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Audience-Filtered Circulars</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Official announcements delivered strictly matching your department, division, and semester.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F9FDFB] border border-emerald-100/60">
                <div className="p-1.5 rounded-lg bg-teal-500 text-white shrink-0">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Actionable Navigation</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Clickable action buttons that navigate directly to authorized pages across CampusConnect.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-100/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Direct Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                href="/dashboard/student/attendance"
                className="p-2 rounded-xl bg-[#F0FDF4] hover:bg-[#ECFDF5] text-emerald-800 border border-emerald-200/70 transition flex items-center justify-between"
              >
                <span>Attendance</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#10B981]" />
              </Link>
              <Link
                href="/dashboard/student/assignments"
                className="p-2 rounded-xl bg-[#F0FDF4] hover:bg-[#ECFDF5] text-emerald-800 border border-emerald-200/70 transition flex items-center justify-between"
              >
                <span>Assignments</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#10B981]" />
              </Link>
              <Link
                href="/dashboard/student/timetable"
                className="p-2 rounded-xl bg-[#F0FDF4] hover:bg-[#ECFDF5] text-emerald-800 border border-emerald-200/70 transition flex items-center justify-between"
              >
                <span>Timetable</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#10B981]" />
              </Link>
              <Link
                href="/dashboard/student/notices"
                className="p-2 rounded-xl bg-[#F0FDF4] hover:bg-[#ECFDF5] text-emerald-800 border border-emerald-200/70 transition flex items-center justify-between"
              >
                <span>Notices</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#10B981]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
