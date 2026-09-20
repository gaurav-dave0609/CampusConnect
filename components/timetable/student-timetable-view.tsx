"use client";

import { DayOfWeek } from "@prisma/client";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  BookOpen,
  FlaskConical,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Coffee,
  Users,
  Printer,
  Download,
  CalendarCheck,
} from "lucide-react";
import { CSPSlotAssignment } from "@/lib/timetable/csp-solver";
import { DemoTimetableRecord } from "@/lib/timetable/demo-timetable";
import { WeeklyTimetableGrid } from "./weekly-timetable-grid";

export interface StudentTimetableViewProps {
  divisionName: string;
  className: string;
  timetable: DemoTimetableRecord | null;
  todayDay: DayOfWeek;
  todaySlots: CSPSlotAssignment[];
}

export function StudentTimetableView({
  divisionName,
  className,
  timetable,
  todayDay,
  todaySlots,
}: StudentTimetableViewProps) {
  const isWeekend = todayDay === DayOfWeek.SATURDAY;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Welcome Header Section - Clean & Attractive Light Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-emerald-100/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-emerald-800 border border-emerald-200/80 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Official Institutional Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Class Timetable &bull; {divisionName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            {className} &bull; Semester 6. View verified lecture schedules, laboratory practicals, and daily classroom allocations.
          </p>
        </div>

        {/* Right Header Badges and Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-emerald-100/90 shadow-[0_2px_10px_rgba(16,185,129,0.05)]">
            <div className="h-8 w-8 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Schedule State
              </div>
              <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>{timetable ? timetable.status : "PUBLISHED"}</span>
                {timetable && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ECFDF5] text-emerald-700 font-bold border border-emerald-200">
                    v{timetable.version}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:text-emerald-700 hover:bg-[#F0FDF4] border border-slate-200/90 hover:border-emerald-200 text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* 4 Pastel Stat Cards (Directly matching Reference Image Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Weekly Lectures */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:border-emerald-200 transition-all">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-[#6366F1] text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-emerald-700 border border-emerald-200/60">
              Active Term
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Theory Lectures
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              22 <span className="text-sm font-semibold text-slate-500">Periods</span>
            </div>
          </div>
        </div>

        {/* Card 2: Practical Labs */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:border-emerald-200 transition-all">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-[#10B981] text-white flex items-center justify-center font-bold shadow-sm">
              <FlaskConical className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              8 Hours
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Practical Labs
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              4 <span className="text-sm font-semibold text-slate-500">Sessions</span>
            </div>
          </div>
        </div>

        {/* Card 3: Teaching Faculty */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:border-emerald-200 transition-all">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center font-bold shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
              Allocated
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Teaching Faculty
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              6 <span className="text-sm font-semibold text-slate-500">Professors</span>
            </div>
          </div>
        </div>

        {/* Card 4: Classroom & Labs */}
        <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:border-emerald-200 transition-all">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-[#A855F7] text-white flex items-center justify-center font-bold shadow-sm">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200/60">
              CSP Solved
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Allocated Venues
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              R-201 &bull; Lab-1
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule Card - Beautiful & Engaging */}
      <div className="bg-white border border-emerald-100/90 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-100/70 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Today&apos;s Lectures &amp; Labs ({todayDay})
              </h2>
              <p className="text-xs text-slate-500">Live attendance status and session timeline</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ECFDF5] text-emerald-800 border border-emerald-200">
            {todaySlots.length} Session{todaySlots.length === 1 ? "" : "s"} Scheduled
          </span>
        </div>

        {todaySlots.length === 0 ? (
          <div className="py-8 px-4 rounded-2xl bg-[#F6FDF9] border border-emerald-100/60 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-white border border-emerald-100 text-[#10B981] flex items-center justify-center shadow-xs mb-3">
              <Coffee className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isWeekend ? "Academic Study Break (Weekend)" : "No Scheduled Lectures for Today"}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md leading-relaxed">
              No classroom lectures or practical laboratories are scheduled on {todayDay}. Use this time for project work, assignment submission, or library review.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Next Regular Session: Monday 09:00 AM &bull; Database Management Systems (Room 201)</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {todaySlots.map((slot) => (
              <div
                key={slot.variableId}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md ${
                  slot.isLabSession
                    ? "bg-[#F0FDF4] border-emerald-200 text-slate-900"
                    : "bg-white border-slate-200/90 text-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-extrabold text-[10px]">
                      Period {slot.periodNumber}
                    </span>
                    <span className="font-mono text-slate-600">{slot.startTime} – {slot.endTime}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-700">
                    {slot.subjectCode}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                    {slot.subjectName}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5 mt-3">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{slot.facultyName.split(" ").slice(-1)[0]}</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                    <MapPin className="h-3 w-3 text-[#10B981]" />
                    {slot.roomNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Weekly Academic Matrix Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[#10B981]" />
              Complete Weekly Academic Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Conflict-free schedule computed by the CSP Backtracking Solver
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-blue-200 text-blue-800 shadow-2xs">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              Theory Lecture
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-emerald-200 text-emerald-800 shadow-2xs">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
              Practical Lab (2 Periods)
            </span>
          </div>
        </div>

        {timetable ? (
          <WeeklyTimetableGrid slots={timetable.slots} readonly currentDay={todayDay} />
        ) : (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-emerald-100 shadow-sm">
            No published timetable is currently active for your division.
          </div>
        )}
      </div>
    </div>
  );
}
