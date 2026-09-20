"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  LogOut,
  User,
  Loader2,
  Search,
  MessageSquare,
  LayoutGrid,
  Bot,
} from "lucide-react";
import { SessionUser } from "@/lib/auth/session";
import { NotificationBell } from "./notification-bell";

export function DashboardHeader({
  user,
  onOpenMobile,
}: {
  user: SessionUser;
  onOpenMobile: () => void;
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "AJ";

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-emerald-100/70 sticky top-0 z-30 shadow-[0_1px_3px_rgba(16,185,129,0.04)]">
      {/* Left section: Mobile trigger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile menu trigger & Mobile brand logo */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onOpenMobile}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-emerald-50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative h-7 w-7 overflow-hidden rounded-lg">
            <Image
              src="/brand-icon.png"
              alt="CampusConnect"
              fill
              className="object-cover"
              sizes="28px"
            />
          </div>
          <span className="text-sm font-extrabold text-slate-900">
            Campus<span className="text-[#10B981]">Connect</span>
          </span>
        </div>

        {/* Reference Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search courses, assignments, or documents..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/90 rounded-full text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right section: Utility Icons & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* CampusConnect AI Assistant Button */}
        <Link
          href="/dashboard/assistant"
          aria-label="CampusConnect AI Assistant"
          title="Open CampusConnect AI Assistant"
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-[#ECFDF5] transition-colors relative group"
        >
          <Bot className="h-4 w-4 text-[#10B981]" />
          <span className="sr-only">AI Assistant</span>
        </Link>

        {/* Interactive Notifications Bell */}
        <NotificationBell />

        {/* Grid / Applications Icon */}
        <button
          type="button"
          aria-label="Applications"
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-[#ECFDF5] transition-colors"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Account Section matching reference */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-amber-100 border-2 border-emerald-200 text-amber-800 flex items-center justify-center font-bold text-xs shadow-xs">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight font-medium">
                {user.departmentName || "Computer Science"} &bull; {user.role === "STUDENT" ? "Yr 3" : user.role}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-emerald-100 bg-white p-2 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
              <div className="p-3 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
                <div className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                  Role: {user.role}
                </div>
              </div>

              <div className="p-1 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    const profileRouteMap: Record<string, string> = {
                      STUDENT: "/dashboard/student/profile",
                      FACULTY: "/dashboard/faculty/profile",
                      ADMIN: "/dashboard/admin",
                      PLACEMENT_OFFICER: "/dashboard/placement",
                      CLUB_COORDINATOR: "/dashboard/club",
                    };
                    router.push(profileRouteMap[user.role] || "/dashboard/student/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-[#ECFDF5] hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>View Profile & Settings</span>
                </button>

                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
