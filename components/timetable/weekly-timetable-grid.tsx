"use client";

import { DayOfWeek } from "@prisma/client";
import { CSPSlotAssignment } from "@/lib/timetable/csp-solver";
import { BookOpen, FlaskConical, MapPin, User, Clock, Sparkles } from "lucide-react";

export interface TimetableGridProps {
  slots: CSPSlotAssignment[];
  workingDays?: DayOfWeek[];
  periodsCount?: number;
  periodTimings?: Array<{ periodNumber: number; startTime: string; endTime: string }>;
  onSlotClick?: (slot: CSPSlotAssignment) => void;
  highlightFaculty?: string;
  highlightSubject?: string;
  readonly?: boolean;
  currentDay?: DayOfWeek;
}

const DEFAULT_DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

const DEFAULT_TIMINGS = [
  { periodNumber: 1, startTime: "09:00", endTime: "10:00" },
  { periodNumber: 2, startTime: "10:00", endTime: "11:00" },
  { periodNumber: 3, startTime: "11:15", endTime: "12:15" },
  { periodNumber: 4, startTime: "12:15", endTime: "01:15" },
  { periodNumber: 5, startTime: "02:00", endTime: "03:00" },
  { periodNumber: 6, startTime: "03:00", endTime: "04:00" },
];

export function WeeklyTimetableGrid({
  slots,
  workingDays = DEFAULT_DAYS,
  periodsCount = 6,
  periodTimings = DEFAULT_TIMINGS,
  onSlotClick,
  highlightFaculty,
  highlightSubject,
  readonly = false,
  currentDay,
}: TimetableGridProps) {
  // Map slots by "DAY-PERIOD" for quick O(1) cell lookup
  const slotMap = new Map<string, CSPSlotAssignment>();
  for (const s of slots) {
    slotMap.set(`${s.dayOfWeek}-${s.periodNumber}`, s);
  }

  const periods = Array.from({ length: periodsCount }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-100/90 bg-white shadow-[0_4px_25px_-4px_rgba(16,185,129,0.06)]">
      <table className="w-full border-collapse text-left min-w-[840px]">
        {/* Table Header: Working Days */}
        <thead>
          <tr className="bg-[#F0FDF4] border-b border-emerald-100 text-xs font-bold uppercase tracking-wider text-slate-700">
            <th className="p-4 w-32 text-center border-r border-emerald-100/70">
              <span className="text-slate-500 font-semibold text-[11px]">Period / Time</span>
            </th>
            {workingDays.map((day) => {
              const isToday = currentDay === day;
              return (
                <th
                  key={day}
                  className={`p-4 text-center border-r border-emerald-100/70 last:border-r-0 transition-colors ${
                    isToday ? "bg-emerald-100/60 text-emerald-900" : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{day}</span>
                    {isToday && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#10B981] text-white text-[9px] font-extrabold normal-case">
                        Today
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body: Periods */}
        <tbody className="divide-y divide-emerald-50">
          {periods.map((periodNum) => {
            const timing = periodTimings.find((t) => t.periodNumber === periodNum) || {
              startTime: `${periodNum + 8}:00`,
              endTime: `${periodNum + 9}:00`,
            };

            return (
              <tr key={periodNum} className="hover:bg-[#F6FDF9]/50 transition-colors">
                {/* Period Time Column */}
                <td className="p-3.5 text-center bg-[#F8FCF9] border-r border-emerald-100/70 align-middle">
                  <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-white border border-emerald-100 shadow-2xs font-extrabold text-xs text-slate-800">
                    Period {periodNum}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1.5 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-600" />
                    <span>{timing.startTime} – {timing.endTime}</span>
                  </div>
                </td>

                {/* Day Columns */}
                {workingDays.map((day) => {
                  const slot = slotMap.get(`${day}-${periodNum}`);
                  const isToday = currentDay === day;

                  if (!slot) {
                    return (
                      <td
                        key={`${day}-${periodNum}`}
                        className={`p-2 border-r border-emerald-100/50 last:border-r-0 align-top ${
                          isToday ? "bg-emerald-50/20" : ""
                        }`}
                      >
                        <div className="h-28 rounded-xl border border-dashed border-slate-200/90 flex flex-col items-center justify-center text-xs text-slate-400 select-none bg-slate-50/40 hover:bg-slate-50/80 transition-colors">
                          <span className="text-[11px] font-medium text-slate-400">Free Slot</span>
                        </div>
                      </td>
                    );
                  }

                  const isHighlighted =
                    (highlightFaculty && slot.facultyId === highlightFaculty) ||
                    (highlightSubject && slot.subjectId === highlightSubject);

                  return (
                    <td
                      key={`${day}-${periodNum}`}
                      className={`p-2 border-r border-emerald-100/50 last:border-r-0 align-top ${
                        isToday ? "bg-emerald-50/20" : ""
                      }`}
                    >
                      <div
                        onClick={() => !readonly && onSlotClick?.(slot)}
                        className={`h-28 p-3 rounded-xl border transition-all text-left flex flex-col justify-between group ${
                          slot.isLabSession
                            ? "bg-white hover:bg-[#ECFDF5]/50 border-emerald-200/90 shadow-[0_2px_8px_rgba(16,185,129,0.06)] hover:shadow-md hover:border-emerald-400"
                            : "bg-white hover:bg-slate-50 border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-300"
                        } ${
                          isHighlighted ? "ring-2 ring-emerald-500 shadow-md scale-[1.02]" : ""
                        } ${!readonly ? "cursor-pointer active:scale-98" : ""}`}
                      >
                        {/* Top: Code & Badge */}
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                            {slot.subjectCode}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border shrink-0 ${
                              slot.isLabSession
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {slot.isLabSession ? "Lab" : "Lecture"}
                          </span>
                        </div>

                        {/* Middle: Subject Name */}
                        <div className="text-xs font-semibold text-slate-800 line-clamp-1 mt-1 leading-snug">
                          {slot.subjectName}
                        </div>

                        {/* Bottom: Faculty & Room */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 mt-1.5">
                          <span className="flex items-center gap-1 truncate max-w-[110px]" title={slot.facultyName}>
                            <User className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{slot.facultyName.split(" ").slice(-1)[0]}</span>
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100/80 px-1.5 py-0.5 rounded text-[10px]">
                            <MapPin className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                            {slot.roomNumber.replace("Room ", "R-").replace("Computer Lab ", "Lab-")}
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
