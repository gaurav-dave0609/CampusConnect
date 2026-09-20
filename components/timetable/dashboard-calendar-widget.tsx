"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon } from "lucide-react";

interface ScheduleSlot {
  id: string;
  time: string;
  subject: string;
  code: string;
  room: string;
  faculty?: string;
  accentColor?: string;
}

interface DashboardCalendarWidgetProps {
  todaySlots?: Array<{
    periodNumber: number;
    startTime: string;
    endTime: string;
    subjectName: string;
    subjectCode: string;
    roomNumber: string;
    facultyName?: string;
  }>;
}

export function DashboardCalendarWidget({ todaySlots = [] }: DashboardCalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 19)); // Sep 19, 2026
  const [selectedDay, setSelectedDay] = useState(19);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar days generation
  const daysInMonth = 30; // Sep has 30 days
  const startDayOffset = 1; // Tuesday

  const fallbackSchedule: ScheduleSlot[] = [
    {
      id: "slot-1",
      time: "09:00 - 10:30 AM",
      subject: "Data Structures & Algorithms",
      code: "CS-201",
      room: "Room 402",
      faculty: "Dr. Sarah Mitchell",
      accentColor: "#6366F1",
    },
    {
      id: "slot-2",
      time: "11:00 - 12:30 PM",
      subject: "Intro to Artificial Intelligence",
      code: "AI-301",
      room: "Online / Lab 3",
      faculty: "Prof. David Chen",
      accentColor: "#10B981",
    },
    {
      id: "slot-3",
      time: "02:00 - 03:30 PM",
      subject: "Database Management Systems",
      code: "DBMS-204",
      room: "Lab 19",
      faculty: "Dr. Elena Rodriguez",
      accentColor: "#F59E0B",
    },
  ];

  const displaySlots: ScheduleSlot[] =
    todaySlots.length > 0
      ? todaySlots.map((s, idx) => ({
          id: `slot-${idx}`,
          time: `${s.startTime} - ${s.endTime}`,
          subject: s.subjectName,
          code: s.subjectCode,
          room: `Room ${s.roomNumber}`,
          faculty: s.facultyName,
          accentColor: idx % 3 === 0 ? "#6366F1" : idx % 3 === 1 ? "#10B981" : "#F59E0B",
        }))
      : fallbackSchedule;

  return (
    <div className="bg-white rounded-2xl border border-emerald-100/80 p-5 shadow-[0_2px_12px_rgba(16,185,129,0.04)] flex flex-col justify-between">
      <div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Calendar</h3>
            <span className="text-xs text-slate-400 font-medium">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 text-center mt-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
          <span>Su</span>
        </div>

        {/* Calendar Dates Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mt-2">
          {/* Previous month trailing days */}
          <span className="h-7 w-7 mx-auto flex items-center justify-center text-[11px] text-slate-300">
            31
          </span>

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = day === selectedDay;
            const hasClass = [4, 6, 7, 11, 14, 18, 19, 21, 25].includes(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center text-[11px] font-medium transition-all relative ${
                  isSelected
                    ? "bg-[#10B981] text-white font-bold shadow-xs shadow-emerald-500/40"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                {day}
                {hasClass && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#10B981]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Today's Schedule Section from Reference */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Today&apos;s Schedule
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-[#ECFDF5] px-2 py-0.5 rounded-full">
              {displaySlots.length} Classes
            </span>
          </div>

          <div className="space-y-2.5">
            {displaySlots.map((slot) => (
              <div
                key={slot.id}
                className="p-3 rounded-xl border border-slate-100 bg-[#F8FAFC]/80 hover:bg-[#F0FDF4]/70 hover:border-emerald-200/60 transition-all text-left"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate pr-2">
                    {slot.subject}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white shrink-0"
                    style={{ backgroundColor: slot.accentColor || "#10B981" }}
                  >
                    {slot.code}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {slot.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {slot.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
