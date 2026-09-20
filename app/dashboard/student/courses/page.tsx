import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth/rbac";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  MapPin,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  Shield,
  Database,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

interface CourseCardData {
  id: string;
  code: string;
  title: string;
  instructor: string;
  location: string;
  schedule: string;
  grade: string;
  materialsCount: number;
  assignmentsDue: number;
  credits: number;
  color: string;
  bgLight: string;
  icon: "layers" | "sparkles" | "database" | "shield";
}

const COURSES_DATA: CourseCardData[] = [
  {
    id: "cs-201",
    code: "CS-201",
    title: "Data Structures & Algorithms",
    instructor: "Dr. Sarah Mitchell",
    location: "Room 402",
    schedule: "Mon, Wed, Fri • 09:00 - 10:30 AM",
    grade: "Grade A-",
    materialsCount: 24,
    assignmentsDue: 3,
    credits: 4.0,
    color: "#6366F1",
    bgLight: "#EEF2FF",
    icon: "layers",
  },
  {
    id: "ai-301",
    code: "AI-301",
    title: "Intro to Artificial Intelligence",
    instructor: "Prof. David Chen",
    location: "Online",
    schedule: "Tue, Thu • 02:00 - 04:00 PM",
    grade: "Grade A",
    materialsCount: 18,
    assignmentsDue: 2,
    credits: 3.8,
    color: "#10B981",
    bgLight: "#ECFDF5",
    icon: "sparkles",
  },
  {
    id: "dbms-204",
    code: "DBMS-204",
    title: "Database Management Systems",
    instructor: "Dr. Elena Rodriguez",
    location: "Lab 19",
    schedule: "Mon, Wed • 02:00 - 03:30 PM",
    grade: "Grade A-",
    materialsCount: 32,
    assignmentsDue: 0,
    credits: 3.0,
    color: "#F59E0B",
    bgLight: "#FEF3C7",
    icon: "database",
  },
  {
    id: "sec-102",
    code: "SEC-102",
    title: "Cybersecurity Fundamentals",
    instructor: "James Wilson",
    location: "Room 102",
    schedule: "Thu • 01:00 - 02:30 PM",
    grade: "Grade A-",
    materialsCount: 12,
    assignmentsDue: 2,
    credits: 2.0,
    color: "#A855F7",
    bgLight: "#FAF5FF",
    icon: "shield",
  },
];

export default async function EnrolledCoursesPage() {
  await requireRole([Role.STUDENT, Role.ADMIN]);

  const totalCourses = COURSES_DATA.length + 2;
  const totalCredits = 18;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            My Enrolled Courses
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Fall Semester 2024 &bull; Academic Excellence Track
          </p>
        </div>

        {/* Right total count cards from reference */}
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-2xl border border-emerald-100/80 px-4 py-2.5 shadow-xs flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Courses
            </span>
            <span className="text-xl font-extrabold text-[#10B981]">
              0{totalCourses}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100/80 px-4 py-2.5 shadow-xs flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Credits
            </span>
            <span className="text-xl font-extrabold text-[#10B981]">
              {totalCredits}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Row matching reference */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <span>Fall Semester 2024</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <span>All Departments</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      {/* 2x2 Course Cards Grid matching reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {COURSES_DATA.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-[0_2px_14px_rgba(16,185,129,0.04)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Left Icon Badge & Right Course/Grade tags */}
              <div className="flex items-start justify-between">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm"
                  style={{ backgroundColor: course.color, color: "#FFFFFF" }}
                >
                  {course.icon === "layers" && <Layers className="h-6 w-6" />}
                  {course.icon === "sparkles" && <Sparkles className="h-6 w-6" />}
                  {course.icon === "database" && <Database className="h-6 w-6" />}
                  {course.icon === "shield" && <Shield className="h-6 w-6" />}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{ color: course.color }}
                  >
                    {course.code}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-emerald-700 border border-emerald-200/60">
                    &bull; {course.grade}
                  </span>
                </div>
              </div>

              {/* Title & Instructor */}
              <div className="mt-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {course.instructor} &bull; {course.location}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{course.schedule}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Stats & Launch Classroom Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Materials</div>
                  <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {course.materialsCount} Files
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-100" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Assignments</div>
                  <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {course.assignmentsDue > 0 ? `0${course.assignmentsDue} Due` : "00 Due"}
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-100" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Credits</div>
                  <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {course.credits.toFixed(1)}
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/student/assignments"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#10B981] text-white hover:bg-emerald-600 text-xs font-bold rounded-xl transition-colors shadow-xs shadow-emerald-500/20"
              >
                Launch Classroom
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
