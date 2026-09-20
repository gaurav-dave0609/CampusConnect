"use client";

import { DayOfWeek } from "@prisma/client";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  BookOpen,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import { CSPSlotAssignment } from "@/lib/timetable/csp-solver";
import { WeeklyTimetableGrid } from "./weekly-timetable-grid";

export interface FacultyTimetableViewProps {
  facultyName: string;
  totalWeeklyPeriods: number;
  todayDay: DayOfWeek;
  todaySlots: CSPSlotAssignment[];
  allSlots: CSPSlotAssignment[];
}

export function FacultyTimetableView({
  facultyName,
  totalWeeklyPeriods,
  todayDay,
  todaySlots,
  allSlots,
}: FacultyTimetableViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white border border-emerald-100/80 p-6 sm:p-8 text-slate-900 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
              Faculty Academic Station
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Teaching Schedule &bull; {facultyName}
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Consolidated lecture and practical lab timetable across all assigned academic divisions.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F0FDF4] px-4 py-3 rounded-xl border border-emerald-100">
            <CalendarDays className="h-8 w-8 text-emerald-600" />
            <div>
              <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                Weekly Teaching Load
              </div>
              <div className="text-lg font-bold text-slate-900">
                {totalWeeklyPeriods} Period{totalWeeklyPeriods === 1 ? "" : "s"} / Week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Teaching Schedule */}
      <div className="bg-white border border-emerald-100/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-100/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Today&apos;s Teaching Schedule ({todayDay})
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#ECFDF5] text-emerald-800 border border-emerald-200">
            {todaySlots.length} Lecture{todaySlots.length === 1 ? "" : "s"} / Labs Today
          </span>
        </div>

        {todaySlots.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No teaching commitments scheduled for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {todaySlots.map((slot) => (
              <div
                key={slot.variableId}
                className={`p-4 rounded-xl border flex flex-col justify-between transition hover:shadow-md ${
                  slot.isLabSession
                    ? "bg-[#F0FDF4] border-emerald-200 text-slate-900"
                    : "bg-[#F9FDFB] border-emerald-100 text-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-100 font-extrabold text-[10px]">
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

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-emerald-50 pt-2.5 mt-3">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Users className="h-3.5 w-3.5 text-[#10B981]" />
                    {slot.divisionId === "div-comp-a" ? "Div A" : "Div B"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-800 bg-white border border-emerald-100 px-2 py-0.5 rounded text-[10px]">
                    <MapPin className="h-3 w-3 text-[#10B981]" />
                    {slot.roomNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Weekly Teaching Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#10B981]" />
            Weekly Consolidated Teaching Matrix
          </h2>
        </div>

        <WeeklyTimetableGrid slots={allSlots} readonly />
      </div>
    </div>
  );
}
