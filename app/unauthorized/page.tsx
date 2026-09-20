import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth/session";

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string; current?: string }>;
}) {
  const params = await searchParams;
  const user = await getSession();

  const currentRole = user?.role || params.current || "UNKNOWN";
  const requiredRole = params.required || "ELEVATED_PRIVILEGE";

  const dashboardRouteMap: Record<string, string> = {
    STUDENT: "/dashboard/student",
    FACULTY: "/dashboard/faculty",
    ADMIN: "/dashboard/admin",
    PLACEMENT_OFFICER: "/dashboard/placement",
    CLUB_COORDINATOR: "/dashboard/club",
  };

  const returnUrl = dashboardRouteMap[currentRole] || "/login";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F0FDF4] via-[#F6FDF9] to-[#E0F7F1]">
      <div className="max-w-md w-full text-center p-8 rounded-3xl border border-emerald-100 bg-white/95 shadow-xl backdrop-blur-md">
        <div className="mx-auto mb-5 relative h-10 w-44">
          <Image
            src="/brand-logo.png"
            alt="CampusConnect"
            fill
            className="object-contain"
          />
        </div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 shadow-sm border border-rose-100">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900 mb-3">
          403 Forbidden &bull; Server-Side RBAC Guard
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Access Restricted
        </h1>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Your current session authenticated as{" "}
          <span className="font-semibold text-slate-900 dark:text-white px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
            {currentRole}
          </span>{" "}
          does not possess the required privilege level (
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {requiredRole}
          </span>
          ) to access this protected sector.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={returnUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#059669] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Authorized Dashboard
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4 text-slate-500" />
              Sign Out / Switch Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
