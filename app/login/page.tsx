"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { DEMO_USERS } from "@/lib/auth/demo-users";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectDemo = (demo: (typeof DEMO_USERS)[0]) => {
    setEmail(demo.email);
    setPassword(demo.passwordPlainText);
    setSelectedRole(demo.role);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Failed to sign in. Please check credentials.");
        setIsLoading(false);
        return;
      }

      // Route mapping based on server-verified role
      const redirectMap: Record<string, string> = {
        STUDENT: "/dashboard/student",
        FACULTY: "/dashboard/faculty",
        ADMIN: "/dashboard/admin",
        PLACEMENT_OFFICER: "/dashboard/placement",
        CLUB_COORDINATOR: "/dashboard/club",
      };

      const destination = redirectMap[data.user.role] || "/dashboard/student";
      router.push(destination);
      router.refresh();
    } catch {
      setErrorMessage("Network error connecting to authentication server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F0FDF4] via-[#F6FDF9] to-[#E0F7F1] relative overflow-hidden">
      {/* Ambient background mint glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-300/15 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block group">
          <div className="mx-auto relative w-56 h-28 transition-transform group-hover:scale-105">
            <Image
              src="/brand-logo.png"
              alt="CampusConnect Official Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <p className="mt-1 text-xs text-slate-500 font-semibold tracking-wide uppercase">
          Academic ERP &bull; Campus Lifecycle Operating System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* 1-Click Evaluation Demo Switcher */}
        <div className="mb-6 rounded-2xl border border-emerald-100/90 bg-white p-4 shadow-[0_2px_12px_rgba(16,185,129,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
              1-Click Demo Evaluation Roles
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Auto-fills credentials</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEMO_USERS.map((demo) => {
              const isSelected = selectedRole === demo.role || email === demo.email;
              return (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleSelectDemo(demo)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-left transition-all ${
                    isSelected
                      ? "border-[#10B981] bg-[#ECFDF5] text-emerald-900 font-semibold ring-1 ring-emerald-500 shadow-xs"
                      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-[#ECFDF5]/50 hover:border-emerald-200"
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">
                    {demo.role.replace("_", " ")}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {demo.firstName}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-emerald-100/90 bg-white p-8 shadow-[0_4px_24px_rgba(16,185,129,0.06)]">
          {errorMessage && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Institutional Email
              </label>
              <div className="relative mt-2 rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedRole(null);
                  }}
                  placeholder="user@campusconnect.edu"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#10B981] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative mt-2 rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#10B981] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 text-[#10B981] focus:ring-emerald-500"
                />
                Keep session active for 7 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] py-3 px-4 text-sm font-bold text-white shadow-sm shadow-emerald-500/30 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate &amp; Enter Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#10B981]" />
            <span>Server-side verification with encrypted HTTP-only session</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-[#10B981] transition-colors"
          >
            &larr; Back to CampusConnect Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
