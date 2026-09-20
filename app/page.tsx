import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F0FDF4] via-[#F6FDF9] to-[#E0F7F1]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-emerald-100/70 bg-white/90 backdrop-blur-md shadow-[0_1px_3px_rgba(16,185,129,0.03)]">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-xs border border-emerald-100">
              <Image
                src="/brand-icon.png"
                alt="CampusConnect Logo"
                fill
                className="object-cover"
                sizes="40px"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Campus<span className="text-[#10B981]">Connect</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-emerald-800 border border-emerald-200/80">
                Academic Ecosystem
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 mr-4">
              <a href="#features" className="hover:text-[#10B981] transition-colors">
                Modules
              </a>
              <a href="#roles" className="hover:text-[#10B981] transition-colors">
                User Roles
              </a>
              <a href="#architecture" className="hover:text-[#10B981] transition-colors">
                Architecture
              </a>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-600 transition-all"
            >
              Enter Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[450px] w-[600px] rounded-full bg-gradient-to-tr from-emerald-200/30 to-teal-200/30 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#ECFDF5] px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs mb-8">
            <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Software Project Management (SPM) Academic System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            The Modern Operating System for{" "}
            <span className="text-[#10B981]">
              Campus Intelligence
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CampusConnect unifies constraint-based timetable scheduling, transparent attendance risk projections, placement preparation, and multi-role academic workflows into one cohesive, light, production-grade platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#10B981] px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-emerald-500/30 hover:bg-emerald-600 transition-all"
            >
              <span>Launch Demo Portals</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
            >
              Explore Modules
            </a>
          </div>

          {/* Official CampusConnect Platform Banner */}
          <div className="mt-12 max-w-4xl mx-auto rounded-3xl overflow-hidden border border-emerald-200/90 shadow-[0_10px_35px_-5px_rgba(16,185,129,0.12)] bg-white group hover:border-emerald-300 transition-all">
            <div className="relative w-full aspect-[1024/409]">
              <Image
                src="/brand-banner.png"
                alt="CampusConnect Official Banner — Your Campus. Your Community. Your Future."
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-5 shadow-[0_2px_10px_rgba(16,185,129,0.04)]">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">5 Roles</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">Strict Server RBAC</div>
            </div>
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-5 shadow-[0_2px_10px_rgba(16,185,129,0.04)]">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#10B981]">CSP Engine</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">Conflict-Free Timetable</div>
            </div>
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-5 shadow-[0_2px_10px_rgba(16,185,129,0.04)]">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#10B981]">75% Target</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">Attendance Projection</div>
            </div>
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-5 shadow-[0_2px_10px_rgba(16,185,129,0.04)]">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">24+ Models</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">PostgreSQL + Prisma</div>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Modules Section */}
      <section id="features" className="py-16 bg-white/70 border-y border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
              End-to-End Capabilities
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for Real Academic Workflows
            </p>
            <p className="mt-4 text-slate-600">
              Every module is backed by live database relationships, rigorous business logic, and server-side authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Timetable Engine */}
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_2px_12px_rgba(16,185,129,0.04)] hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#10B981] mb-5 font-bold shadow-xs">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Constraint Timetable Generator</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Deterministic backtracking algorithm satisfying hard constraints: zero faculty clashes, zero room double-bookings, consecutive lab periods, and balanced weekly workload.
              </p>
            </div>

            {/* Attendance Projection */}
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_2px_12px_rgba(16,185,129,0.04)] hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#10B981] mb-5 font-bold shadow-xs">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Attendance Projection</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Honest mathematical modeling calculating exact consecutive classes required to reach 75% or bunk margins without false machine learning claims.
              </p>
            </div>

            {/* Assignment Lifecycle */}
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_2px_12px_rgba(16,185,129,0.04)] hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1] mb-5 font-bold shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Assignment Lifecycle</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Faculty assignment authoring with deadlines, student submissions with status tracking (Pending, Submitted, Late), and in-app evaluation with grade feedback.
              </p>
            </div>

            {/* Placement Preparation */}
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_2px_12px_rgba(16,185,129,0.04)] hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#F59E0B] mb-5 font-bold shadow-xs">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Placement Hub &amp; Quizzes</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Active job drives with eligibility checks, timed aptitude quizzes, question banks, and student application progress tracking.
              </p>
            </div>

            {/* Club Management */}
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_2px_12px_rgba(16,185,129,0.04)] hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF5FF] text-[#A855F7] mb-5 font-bold shadow-xs">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Club &amp; Event Ecosystem</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Membership requests and coordinator approval, event discovery with capacity quotas, and participant attendance management.
              </p>
            </div>

            {/* Lost & Found */}
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_2px_12px_rgba(16,185,129,0.04)] hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#EF4444] mb-5 font-bold shadow-xs">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Lost &amp; Found Community</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Community reporting portal for lost campus belongings with proof-of-ownership claim verification and administrative moderation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Access Section */}
      <section id="roles" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
              Role-Based Access Control
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Tailored Portals for Every Stakeholder
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                role: "STUDENT",
                title: "Student Portal",
                desc: "Attendance tracking, timetable, assignments, quizzes, clubs & lost-found.",
                color: "border-blue-200 bg-white",
                tagColor: "bg-blue-50 text-blue-700",
              },
              {
                role: "FACULTY",
                title: "Faculty Console",
                desc: "Attendance marking sheet, assignment grading drawer & subject rosters.",
                color: "border-emerald-200 bg-white",
                tagColor: "bg-emerald-50 text-emerald-700",
              },
              {
                role: "ADMIN",
                title: "Admin Command",
                desc: "Full institutional governance, timetable solver, users & audit logs.",
                color: "border-purple-200 bg-white",
                tagColor: "bg-purple-50 text-purple-700",
              },
              {
                role: "PLACEMENT_OFFICER",
                title: "Placement Cell",
                desc: "Drive management, corporate CRM, applicant shortlists & aptitude banks.",
                color: "border-amber-200 bg-white",
                tagColor: "bg-amber-50 text-amber-800",
              },
              {
                role: "CLUB_COORDINATOR",
                title: "Club Executive",
                desc: "Member approvals, event organizing, rosters & community broadcasts.",
                color: "border-rose-200 bg-white",
                tagColor: "bg-rose-50 text-rose-700",
              },
            ].map((item) => (
              <div
                key={item.role}
                className={`rounded-2xl border p-5 transition-all hover:shadow-sm ${item.color}`}
              >
                <div className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${item.tagColor}`}>
                  {item.role.replace("_", " ")}
                </div>
                <div className="mt-3 font-bold text-slate-900">{item.title}</div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-emerald-100/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="relative h-6 w-6 overflow-hidden rounded-md border border-emerald-100">
              <Image
                src="/brand-icon.png"
                alt="CampusConnect"
                fill
                className="object-cover"
                sizes="24px"
              />
            </div>
            <span>
              <strong className="text-slate-800">CampusConnect</strong> &mdash; Learn. Connect. Grow. &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
              Strict Server-Side RBAC
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <Layers className="h-3.5 w-3.5 text-[#10B981]" />
              Prisma + PostgreSQL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
