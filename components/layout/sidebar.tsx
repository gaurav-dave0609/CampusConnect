"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Role } from "@prisma/client";
import {
  GraduationCap,
  LayoutDashboard,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Users,
  Search,
  User,
  ClipboardList,
  History,
  Building2,
  Layers,
  BookOpen,
  Sliders,
  BellRing,
  Award,
  ShieldCheck,
  Building,
  FileCheck,
  Megaphone,
  Inbox,
  Sparkles,
  Activity,
  LogOut,
  FolderKanban,
  FileText,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleNavItems: Record<Role, NavItem[]> = {
  STUDENT: [
    { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
    { name: "My Courses", href: "/dashboard/student/courses", icon: FolderKanban },
    { name: "Academic Calendar", href: "/dashboard/student/timetable", icon: CalendarDays },
    { name: "Grades & Performance", href: "/dashboard/results", icon: Award },
    { name: "Library & Resources", href: "/dashboard/student/placements/preparation", icon: BookOpen },
    { name: "Student Directory", href: "/dashboard/student/clubs", icon: Users },
    { name: "Attendance & Risk", href: "/dashboard/student/attendance", icon: TrendingUp },
    { name: "Assignments", href: "/dashboard/student/assignments", icon: CheckCircle2 },
    { name: "Notices & Circulars", href: "/dashboard/student/notices", icon: Megaphone },
    { name: "Campus Events", href: "/dashboard/student/events", icon: CalendarDays },
    { name: "Placement Hub", href: "/dashboard/student/placements", icon: Briefcase },
    { name: "Lost & Found Board", href: "/dashboard/student/lost-found", icon: Search },
    { name: "Academic Transcript", href: "/dashboard/transcript", icon: GraduationCap },
    { name: "My Profile", href: "/dashboard/student/profile", icon: User },
  ],
  FACULTY: [
    { name: "Dashboard", href: "/dashboard/faculty", icon: LayoutDashboard },
    { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
    { name: "Teaching Schedule", href: "/dashboard/faculty/timetable", icon: CalendarDays },
    { name: "Mark Attendance", href: "/dashboard/faculty/attendance/mark", icon: ClipboardList },
    { name: "Attendance Logs", href: "/dashboard/faculty/attendance/history", icon: History },
    { name: "Exam Gradebook", href: "/dashboard/faculty/exams", icon: FileCheck },
    { name: "Assignments & Grading", href: "/dashboard/faculty/assignments", icon: CheckCircle2 },
    { name: "Teaching Analytics", href: "/dashboard/faculty/analytics", icon: TrendingUp },
    { name: "My Classes & Rosters", href: "/dashboard/faculty/classes", icon: Users },
    { name: "Post Notice", href: "/dashboard/faculty/notices", icon: Megaphone },
    { name: "Campus Events", href: "/dashboard/faculty/events", icon: Award },
    { name: "Faculty Profile", href: "/dashboard/faculty/profile", icon: User },
  ],
  ADMIN: [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
    { name: "Analytics & Intelligence", href: "/dashboard/admin/analytics", icon: TrendingUp },
    { name: "Timetable Generator", href: "/dashboard/admin/timetable", icon: CalendarDays },
    { name: "Exam Management", href: "/dashboard/admin/exams", icon: FileCheck },
    { name: "Academic Setup", href: "/dashboard/admin/academic", icon: Sparkles },
    { name: "Departments", href: "/dashboard/admin/departments", icon: Building2 },
    { name: "Programs & Batches", href: "/dashboard/admin/programs", icon: GraduationCap },
    { name: "Classes & Divisions", href: "/dashboard/admin/classes", icon: Layers },
    { name: "Subjects & Syllabus", href: "/dashboard/admin/subjects", icon: BookOpen },
    { name: "Faculty Allocation", href: "/dashboard/admin/faculty-mapping", icon: Sliders },
    { name: "Rooms & Labs", href: "/dashboard/admin/rooms", icon: Building },
    { name: "Configuration Health", href: "/dashboard/admin/configuration-health", icon: Activity },
    { name: "Attendance Audit", href: "/dashboard/admin/attendance", icon: TrendingUp },
    { name: "Campus Notices", href: "/dashboard/admin/notices", icon: BellRing },
    { name: "Event Moderation", href: "/dashboard/admin/events", icon: Award },
    { name: "Club Governance", href: "/dashboard/admin/clubs", icon: Users },
    { name: "Placement Overseer", href: "/dashboard/admin/placements", icon: Briefcase },
    { name: "Claim Verification Desk", href: "/dashboard/admin/lost-found/claims", icon: FileCheck },
    { name: "Audit Trail Logs", href: "/dashboard/admin/audit-logs", icon: ShieldCheck },
  ],
  PLACEMENT_OFFICER: [
    { name: "Placement Cell", href: "/dashboard/placement", icon: LayoutDashboard },
    { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
    { name: "Notification Hub", href: "/dashboard/notifications", icon: BellRing },
    { name: "Recruiting Partners", href: "/dashboard/placement/companies", icon: Building2 },
    { name: "Placement Drives", href: "/dashboard/placement/drives", icon: Briefcase },
    { name: "Student Applicants", href: "/dashboard/placement/applications", icon: FileCheck },
    { name: "Placement Analytics", href: "/dashboard/placement/analytics", icon: TrendingUp },
  ],
  CLUB_COORDINATOR: [
    { name: "Station Overview", href: "/dashboard/club", icon: LayoutDashboard },
    { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
    { name: "Notification Hub", href: "/dashboard/notifications", icon: BellRing },
    { name: "Club Analytics", href: "/dashboard/club/analytics", icon: TrendingUp },
    { name: "Membership Roster", href: "/dashboard/club/members", icon: CheckCircle2 },
    { name: "Club Activities", href: "/dashboard/club/activities", icon: CalendarDays },
    { name: "Club Events", href: "/dashboard/club/events", icon: Award },
    { name: "Discover Clubs", href: "/dashboard/student/clubs", icon: Users },
  ],
};

const roleBadgeStyles: Record<Role, { label: string; color: string }> = {
  STUDENT: { label: "Student", color: "bg-blue-50 text-blue-700 border-blue-200" },
  FACULTY: { label: "Faculty", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ADMIN: { label: "System Admin", color: "bg-purple-50 text-purple-700 border-purple-200" },
  PLACEMENT_OFFICER: { label: "Placement Officer", color: "bg-amber-50 text-amber-700 border-amber-200" },
  CLUB_COORDINATOR: { label: "Club Lead", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function DashboardSidebar({
  role,
  onCloseMobile,
}: {
  role: Role;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navItems = roleNavItems[role] || roleNavItems.STUDENT;
  const badge = roleBadgeStyles[role] || roleBadgeStyles.STUDENT;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-white border-r border-emerald-100/70 select-none shadow-[2px_0_12px_rgba(16,185,129,0.03)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-100/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl shadow-xs border border-emerald-100/80 transition-transform group-hover:scale-105">
            <Image
              src="/brand-icon.png"
              alt="CampusConnect Official Logo"
              fill
              className="object-cover"
              sizes="36px"
              priority
            />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight block">
              Campus<span className="text-[#10B981]">Connect</span>
            </span>
            <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase block">
              Learn &bull; Connect &bull; Grow
            </span>
          </div>
        </Link>
      </div>

      {/* Role Pill Indicator */}
      <div className="px-5 py-2.5 border-b border-emerald-50 bg-[#F0FDF4]/50">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Active
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/dashboard/${role.toLowerCase()}` && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                isActive
                  ? "bg-[#ECFDF5] text-emerald-700 font-semibold"
                  : "text-slate-600 hover:bg-[#ECFDF5]/60 hover:text-emerald-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-[#10B981]" : "text-slate-400 group-hover:text-emerald-600"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* PRO TIP Widget Card from Reference */}
      <div className="mx-3 my-2 p-3.5 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#0D9488] text-white shadow-sm shadow-emerald-500/20">
        <div className="inline-block px-2 py-0.5 rounded-md bg-white/25 text-[10px] font-bold tracking-wider uppercase mb-1.5">
          PRO TIP
        </div>
        <p className="text-[11px] text-emerald-50 leading-relaxed font-medium">
          Early registration for Winter Term begins Nov 15th.
        </p>
        <Link
          href="/dashboard/student/timetable"
          className="mt-2.5 inline-flex items-center justify-center w-full py-1.5 px-3 bg-white text-emerald-800 text-xs font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-xs"
        >
          View Schedule
        </Link>
      </div>

      {/* Logout Action from Reference */}
      <div className="p-3 border-t border-emerald-100/60">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-4 w-4 text-slate-400 group-hover:text-rose-600" />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
