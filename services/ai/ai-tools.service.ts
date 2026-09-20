import { Role, NoticeCategory, EventCategory } from "@prisma/client";
import { SessionUser } from "@/lib/auth/session";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceIntelligenceService } from "./attendance-intelligence.service";
import { TimetableService } from "@/services/timetable.service";
import { AssignmentService } from "@/services/assignment.service";
import { NoticeService } from "@/services/notice.service";
import { EventService } from "@/services/event.service";
import { ClubService } from "@/services/club.service";
import { PlacementService } from "@/services/placement.service";
import { ProfileService } from "@/services/profile.service";
import { DEMO_FACULTY_SUBJECTS, DEMO_ATTENDANCE_DATABASE, DEMO_ENROLLED_STUDENTS } from "@/lib/attendance/demo-attendance";
import { StudentDirectoryService } from "@/lib/data/campusconnect-students";

export interface NavigationAction {
  type: "navigate";
  url: string;
  label: string;
  description?: string;
}

export function matchesSubject(query: string, code: string, name: string): boolean {
  const q = query.toLowerCase().trim();
  const c = code.toLowerCase();
  const n = name.toLowerCase();

  if (c.includes(q) || n.includes(q)) return true;

  if (q === "dbms" && (n.includes("database") || c.includes("301"))) return true;
  if ((q === "cn" || q === "networks" || q === "network") && (n.includes("network") || c.includes("302"))) return true;
  if (q === "os" && (n.includes("operating") || c.includes("303"))) return true;
  if (q === "spm" && (n.includes("software") || c.includes("304"))) return true;

  return false;
}

export class AIToolsService {
  /**
   * Safe Attendance Intelligence Tool for Students
   */
  static async getStudentAttendanceTool(
    user: SessionUser,
    params: { subjectQuery?: string; targetPercentage?: number }
  ) {
    if (user.role !== Role.STUDENT && user.role !== Role.ADMIN) {
      return {
        authorized: false,
        error: "Student attendance records can only be retrieved for students or administrators.",
      };
    }

    const targetPct = params.targetPercentage || 75;
    const summary = await AttendanceService.getStudentSummary(user.id, targetPct);

    // If specific subject requested
    if (params.subjectQuery && params.subjectQuery.trim()) {
      const q = params.subjectQuery.toLowerCase().trim();
      const subject = summary.subjectBreakdown.find((s) =>
        matchesSubject(q, s.subjectCode, s.subjectName)
      );

      if (!subject) {
        return {
          authorized: true,
          found: false,
          message: `Could not find any enrolled subject matching "${params.subjectQuery}" in your registered semester courses.`,
          availableSubjects: summary.subjectBreakdown.map((s) => `${s.subjectName} (${s.subjectCode})`),
        };
      }

      const metrics = AttendanceIntelligenceService.evaluateMetrics(
        subject.present,
        subject.conducted,
        targetPct
      );

      return {
        authorized: true,
        found: true,
        subject: {
          code: subject.subjectCode,
          name: subject.subjectName,
          faculty: subject.facultyName,
          conducted: subject.conducted,
          present: subject.present,
          absent: subject.absent,
          percentage: subject.percentage,
          risk: subject.risk,
        },
        metrics,
        targetPercentage: targetPct,
        navigationAction: {
          type: "navigate",
          url: "/dashboard/student/attendance",
          label: "View Detailed Attendance & Risk Matrix",
        } as NavigationAction,
      };
    }

    // Overall attendance analysis
    const comparison = AttendanceIntelligenceService.compareSubjects(summary, targetPct);
    const overallMetrics = AttendanceIntelligenceService.evaluateMetrics(
      summary.overallPresent,
      summary.overallConducted,
      targetPct
    );

    return {
      authorized: true,
      found: true,
      overall: {
        conducted: summary.overallConducted,
        present: summary.overallPresent,
        absent: summary.overallAbsent,
        percentage: summary.overallPercentage,
        risk: summary.overallRisk,
      },
      overallMetrics,
      comparison,
      targetPercentage: targetPct,
      navigationAction: {
        type: "navigate",
        url: "/dashboard/student/attendance",
        label: "Open Attendance & Risk Station",
      } as NavigationAction,
    };
  }

  /**
   * Date-based / Timetable Attendance Projection Tool
   */
  static async getTimetableProjectionTool(
    user: SessionUser,
    params: { subjectQuery?: string; daysAhead?: number; targetPercentage?: number }
  ) {
    if (user.role !== Role.STUDENT && user.role !== Role.ADMIN) {
      return {
        authorized: false,
        error: "Timetable projections are available for enrolled students.",
      };
    }

    const timetableData = await TimetableService.getStudentTimetable(user.id);
    const summary = await AttendanceService.getStudentSummary(user.id, params.targetPercentage || 75);
    const slots = (timetableData.timetable?.slots || []).map((s) => ({
      subjectCode: s.subjectCode,
      dayOfWeek: s.dayOfWeek,
      periodNumber: s.periodNumber,
    }));

    let currentPresent = summary.overallPresent;
    let currentConducted = summary.overallConducted;
    let code: string | undefined = undefined;

    if (params.subjectQuery && params.subjectQuery.trim()) {
      const q = params.subjectQuery.toLowerCase().trim();
      const subject = summary.subjectBreakdown.find(
        (s) =>
          s.subjectCode.toLowerCase().includes(q) ||
          s.subjectName.toLowerCase().includes(q)
      );
      if (subject) {
        code = subject.subjectCode;
        currentPresent = subject.present;
        currentConducted = subject.conducted;
      }
    }

    const projection = AttendanceIntelligenceService.projectAgainstTimetable(
      slots,
      code,
      currentPresent,
      currentConducted,
      params.daysAhead || 7,
      params.targetPercentage || 75
    );

    return {
      authorized: true,
      projection,
      timetableSlotsToday: timetableData.todaySlots.length,
      navigationAction: {
        type: "navigate",
        url: "/dashboard/student/timetable",
        label: "View Academic Timetable",
      } as NavigationAction,
    };
  }

  /**
   * Authorized Attendance Tool for Faculty
   */
  static async getFacultyAttendanceTool(
    user: SessionUser,
    params: { subjectQuery?: string }
  ) {
    if (user.role !== Role.FACULTY && user.role !== Role.ADMIN) {
      return {
        authorized: false,
        error: "Faculty class attendance intelligence is strictly restricted to Faculty and Administrators.",
      };
    }

    const assignedSubjects = await AttendanceService.getFacultySubjects(user.id);

    // Calculate students at risk across assigned subjects
    const atRiskStudents: Array<{
      studentName: string;
      rollNumber: string;
      subjectName: string;
      percentage: number;
    }> = [];

    // Calculate per-subject attendance averages
    const subjectSummaries = assignedSubjects.map((sub) => {
      const sessions = DEMO_ATTENDANCE_DATABASE.filter(
        (r) => r.facultySubjectId === sub.facultySubjectId
      );
      const totalConducted = new Set(sessions.map((s) => s.attendanceId)).size;
      const totalPresences = sessions.filter((s) => s.status === "PRESENT" || s.status === "EXCUSED").length;
      const averagePct = sessions.length > 0 ? (totalPresences / sessions.length) * 100 : 85.0;

      // Check enrolled students
      const enrolled = DEMO_ENROLLED_STUDENTS;
      enrolled.forEach((stu) => {
        const studentSessions = sessions.filter((s) => s.studentId === stu.id);
        if (studentSessions.length > 0) {
          const present = studentSessions.filter((s) => s.status === "PRESENT" || s.status === "EXCUSED").length;
          const pct = (present / studentSessions.length) * 100;
          if (pct < 75) {
            atRiskStudents.push({
              studentName: stu.name,
              rollNumber: stu.rollNumber,
              subjectName: sub.name,
              percentage: Math.round(pct * 10) / 10,
            });
          }
        }
      });

      return {
        subjectCode: sub.code,
        subjectName: sub.name,
        divisionName: sub.divisionName,
        enrolledCount: enrolled.length,
        conductedLectures: totalConducted,
        averageAttendancePercentage: Math.round(averagePct * 10) / 10,
      };
    });

    let filteredSummaries = subjectSummaries;
    if (params.subjectQuery && params.subjectQuery.trim()) {
      const q = params.subjectQuery.toLowerCase().trim();
      filteredSummaries = subjectSummaries.filter(
        (s) => s.subjectCode.toLowerCase().includes(q) || s.subjectName.toLowerCase().includes(q)
      );
    }

    return {
      authorized: true,
      assignedSubjectsCount: assignedSubjects.length,
      subjects: filteredSummaries,
      atRiskCount: atRiskStudents.length,
      atRiskStudents: atRiskStudents.slice(0, 10),
      navigationAction: {
        type: "navigate",
        url: "/dashboard/faculty/attendance/history",
        label: "View Faculty Attendance Register",
      } as NavigationAction,
    };
  }

  /**
   * Assignment Intelligence Tool
   */
  static async getAssignmentsTool(
    user: SessionUser,
    params: { filter?: "pending" | "due_soon" | "overdue" | "all"; subjectQuery?: string }
  ) {
    if (user.role === Role.STUDENT) {
      const studentData = await AssignmentService.getStudentAssignments(user.id);
      let list = studentData.assignments;

      if (params.filter === "pending") {
        list = list.filter((a) => a.submissionStatus === "NOT_SUBMITTED");
      } else if (params.filter === "due_soon") {
        list = list.filter((a) => a.isUrgent);
      } else if (params.filter === "overdue") {
        list = list.filter((a) => a.isOverdue);
      }

      if (params.subjectQuery && params.subjectQuery.trim()) {
        const q = params.subjectQuery.toLowerCase().trim();
        list = list.filter(
          (a) =>
            a.subjectName.toLowerCase().includes(q) ||
            a.subjectCode.toLowerCase().includes(q) ||
            a.title.toLowerCase().includes(q)
        );
      }

      return {
        authorized: true,
        kpi: studentData.kpi,
        assignments: list.map((a) => ({
          id: a.id,
          title: a.title,
          subjectName: a.subjectName,
          dueDate: a.dueDate,
          maxMarks: a.maxMarks,
          submissionStatus: a.submissionStatus,
          isUrgent: a.isUrgent,
          isOverdue: a.isOverdue,
          urgencyText: a.urgencyText,
        })),
        navigationAction: {
          type: "navigate",
          url: "/dashboard/student/assignments",
          label: "Go to Assignments Hub",
        } as NavigationAction,
      };
    }

    if (user.role === Role.FACULTY || user.role === Role.ADMIN) {
      const facultyData = await AssignmentService.getFacultyAssignments(user.id, user.role);
      const totalPendingGrading = facultyData.reduce((acc, a) => acc + a.pendingGradingCount, 0);

      return {
        authorized: true,
        totalAssignments: facultyData.length,
        totalPendingGrading,
        assignments: facultyData.map((a) => ({
          id: a.id,
          title: a.title,
          subjectName: a.subjectName,
          dueDate: a.dueDate,
          submittedCount: a.submittedCount,
          pendingGradingCount: a.pendingGradingCount,
          submissionRate: a.submissionRate,
        })),
        navigationAction: {
          type: "navigate",
          url: "/dashboard/faculty/assignments",
          label: "Go to Assignment Grading Desk",
        } as NavigationAction,
      };
    }

    return {
      authorized: false,
      error: "Role not authorized for assignment queries.",
    };
  }

  /**
   * Notices & Announcements Tool with strict audience permissions
   */
  static async getNoticesTool(
    user: SessionUser,
    params: { search?: string; category?: NoticeCategory; limit?: number }
  ) {
    const { notices } = await NoticeService.getNotices({
      userId: user.id,
      role: user.role,
      departmentId: "dept-comp",
      divisionId: user.role === Role.STUDENT ? "div-comp-a" : null,
      semester: user.role === Role.STUDENT ? 6 : null,
      category: params.category,
      search: params.search,
      limit: params.limit || 5,
    });

    const unreadCount = await NoticeService.getUnreadCount(user.id, user.role, "dept-comp");

    return {
      authorized: true,
      unreadCount,
      totalReturned: notices.length,
      notices: notices.map((n) => ({
        id: n.id,
        title: n.title,
        category: n.category,
        priority: n.priority,
        publishedAt: n.publishDate,
        authorName: n.authorName,
        authorRole: n.authorRole,
        summary: n.content.length > 180 ? `${n.content.slice(0, 180)}...` : n.content,
      })),
      navigationAction: {
        type: "navigate",
        url: user.role === Role.STUDENT ? "/dashboard/student/notices" : user.role === Role.FACULTY ? "/dashboard/faculty/notices" : "/dashboard/admin/notices",
        label: "Open Notice Center & Circulars",
      } as NavigationAction,
    };
  }

  /**
   * Campus Events Tool
   */
  static async getEventsTool(
    user: SessionUser,
    params: { search?: string; category?: EventCategory; limit?: number }
  ) {
    const { events } = await EventService.getEvents({
      userId: user.id,
      role: user.role,
      search: params.search,
      category: params.category,
      tab: "upcoming",
      limit: params.limit || 5,
    });

    return {
      authorized: true,
      totalUpcoming: events.length,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        venue: e.venue,
        startDate: e.startDateTime || e.eventDate,
        endDate: e.endDateTime,
        organizerName: e.organizerName,
        availableSeats: e.seatsRemaining,
        isUserRegistered: e.isUserRegistered,
      })),
      navigationAction: {
        type: "navigate",
        url: user.role === Role.STUDENT ? "/dashboard/student/events" : "/dashboard/faculty/events",
        label: "Explore Campus Events",
      } as NavigationAction,
    };
  }

  /**
   * Clubs & Committees Tool
   */
  static async getClubsTool(
    user: SessionUser,
    params: { search?: string; limit?: number }
  ) {
    const { clubs } = await ClubService.getClubs({
      userId: user.id,
      role: user.role,
      search: params.search,
      limit: params.limit || 6,
    });

    return {
      authorized: true,
      totalClubs: clubs.length,
      clubs: clubs.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        category: c.category,
        facultyAdvisorName: c.facultyAdvisorName,
        memberCount: c.membersCount,
        isMember: c.isUserMember,
      })),
      navigationAction: {
        type: "navigate",
        url: "/dashboard/student/clubs",
        label: "View Clubs Directory",
      } as NavigationAction,
    };
  }

  /**
   * Training & Placement Tool with Profile-Based Eligibility
   */
  static async getPlacementsTool(
    user: SessionUser,
    params: { search?: string }
  ) {
    if (user.role !== Role.STUDENT && user.role !== Role.ADMIN && (user.role as string) !== "PLACEMENT_OFFICER") {
      return {
        authorized: false,
        error: "Placement hub intelligence is only accessible to students and placement coordinators.",
      };
    }

    const { drives } = await PlacementService.getDrives({
      userId: user.id,
      role: user.role,
      search: params.search,
      limit: 6,
    });

    // If student, check eligibility for each drive
    let eligibleDrivesCount = 0;
    const drivesWithEligibility = drives.map((d) => {
      const isEligible = d.isEligible ?? true;
      if (isEligible) eligibleDrivesCount++;
      return {
        id: d.id,
        title: d.title,
        companyName: d.companyName,
        packageLPA: d.packageLPA,
        location: d.location,
        deadline: d.deadline,
        minCGPA: d.minCGPA,
        isEligible,
        eligibilityMessage: d.eligibilityStatus || (isEligible ? "Eligible" : "Not Eligible"),
      };
    });

    return {
      authorized: true,
      totalDrives: drives.length,
      eligibleDrivesCount,
      drives: drivesWithEligibility,
      navigationAction: {
        type: "navigate",
        url: "/dashboard/student/placements",
        label: "Visit Training & Placement Hub",
      } as NavigationAction,
    };
  }

  /**
   * Academic Profile & Structure Tool
   */
  static async getAcademicProfileTool(user: SessionUser) {
    const profile = await ProfileService.getProfile(user.id);
    if (!profile) {
      return {
        authorized: true,
        user: {
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          email: user.email,
        },
      };
    }

    const timetableData = user.role === Role.STUDENT ? await TimetableService.getStudentTimetable(user.id) : null;

    return {
      authorized: true,
      name: profile.fullName,
      email: profile.email,
      role: profile.role,
      phone: profile.phone,
      student: profile.student
        ? {
            studentId: profile.student.studentId,
            rollNumber: profile.student.rollNumber,
            prnNumber: profile.student.prnNumber,
            department: profile.student.department,
            semester: profile.student.semester,
            division: profile.student.division,
            batchYear: profile.student.batchYear,
            cgpa: profile.student.cgpa,
            skills: profile.student.skills,
          }
        : undefined,
      faculty: profile.faculty
        ? {
            employeeId: profile.faculty.employeeId,
            department: profile.faculty.department,
            designation: profile.faculty.designation,
            qualification: profile.faculty.qualification,
            specialization: profile.faculty.specialization,
            officeRoom: profile.faculty.officeRoom,
          }
        : undefined,
      enrolledSubjects: timetableData?.timetable?.slots
        ? Array.from(new Set(timetableData.timetable.slots.map((s) => `${s.subjectName} (${s.subjectCode})`)))
        : [],
      navigationAction: {
        type: "navigate",
        url: user.role === Role.STUDENT ? "/dashboard/student/profile" : "/dashboard/faculty/profile",
        label: "Go to My Institutional Profile",
      } as NavigationAction,
    };
  }

  /**
   * Institutional Governance & Administration Tool
   */
  static async getAdminMetricsTool(user: SessionUser) {
    if (user.role !== Role.ADMIN) {
      return {
        authorized: false,
        error: "Access Denied: Administrative metrics require Administrator privileges.",
      };
    }

    const dirStats = StudentDirectoryService.getDepartmentEnrollmentStats();

    return {
      authorized: true,
      institution: {
        name: "CampusConnect Institute of Engineering & Technology",
        accreditation: "NAAC Grade A+ Accredited",
        totalStudents: 1420,
        registeredDirectoryStudents: dirStats.totalEnrolled,
        totalFaculty: 86,
        academicDepartments: 5,
        streams: dirStats.streams,
        departments: [
          { name: "BSc IT (Information Technology)", code: "BSCIT", students: dirStats.streams["BSc IT"]?.total || 45 },
          { name: "BMM (Bachelor of Mass Media)", code: "BMM", students: dirStats.streams["BMM"]?.total || 45 },
          { name: "BMS (Bachelor of Management Studies)", code: "BMS", students: dirStats.streams["BMS"]?.total || 45 },
          { name: "Computer Engineering", code: "COMP", students: 480 },
          { name: "Information Technology", code: "IT", students: 360 },
          { name: "Electronics & Telecommunication", code: "EXTC", students: 280 },
          { name: "Mechanical Engineering", code: "MECH", students: 160 },
          { name: "Civil Engineering", code: "CIVIL", students: 140 },
        ],
        timetableEngine: {
          status: "ACTIVE",
          activeSolutionScore: 100,
          conflictsDetected: 0,
        },
        activeCirculars: 14,
        upcomingModeratedEvents: 6,
      },
      navigationAction: {
        type: "navigate",
        url: "/dashboard/admin",
        label: "Open Administrator Command Center",
      } as NavigationAction,
    };
  }

  /**
   * Actionable Navigation Resolver
   */
  static resolveNavigation(user: SessionUser, query: string): NavigationAction | null {
    const q = query.toLowerCase().trim();

    if (q.includes("attendance") || q.includes("risk") || q.includes("bunk")) {
      if (user.role === Role.STUDENT) {
        return { type: "navigate", url: "/dashboard/student/attendance", label: "Open Attendance & Risk" };
      } else if (user.role === Role.FACULTY) {
        return { type: "navigate", url: "/dashboard/faculty/attendance/mark", label: "Mark Attendance" };
      } else {
        return { type: "navigate", url: "/dashboard/admin/attendance", label: "Attendance Audit Station" };
      }
    }

    if (q.includes("assignment") || q.includes("homework") || q.includes("submission")) {
      return user.role === Role.STUDENT
        ? { type: "navigate", url: "/dashboard/student/assignments", label: "Open Assignments" }
        : { type: "navigate", url: "/dashboard/faculty/assignments", label: "Assignment Grading Desk" };
    }

    if (q.includes("timetable") || q.includes("schedule") || q.includes("calendar") || q.includes("lecture")) {
      if (user.role === Role.STUDENT) {
        return { type: "navigate", url: "/dashboard/student/timetable", label: "View Academic Timetable" };
      } else if (user.role === Role.FACULTY) {
        return { type: "navigate", url: "/dashboard/faculty/timetable", label: "View Teaching Schedule" };
      } else {
        return { type: "navigate", url: "/dashboard/admin/timetable", label: "Timetable Generator Engine" };
      }
    }

    if (q.includes("notice") || q.includes("circular") || q.includes("announcement")) {
      return user.role === Role.STUDENT
        ? { type: "navigate", url: "/dashboard/student/notices", label: "Notice Center" }
        : user.role === Role.FACULTY
        ? { type: "navigate", url: "/dashboard/faculty/notices", label: "Faculty Notice Board" }
        : { type: "navigate", url: "/dashboard/admin/notices", label: "Campus Notice Moderation" };
    }

    if (q.includes("event") || q.includes("fest") || q.includes("workshop") || q.includes("hackathon")) {
      return user.role === Role.STUDENT
        ? { type: "navigate", url: "/dashboard/student/events", label: "Campus Events Discovery" }
        : { type: "navigate", url: "/dashboard/faculty/events", label: "Campus Events Hub" };
    }

    if (q.includes("club") || q.includes("committee")) {
      return { type: "navigate", url: "/dashboard/student/clubs", label: "Clubs & Committees" };
    }

    if (q.includes("placement") || q.includes("internship") || q.includes("job") || q.includes("drive")) {
      return { type: "navigate", url: "/dashboard/student/placements", label: "Placement Hub" };
    }

    if (q.includes("grade") || q.includes("cgpa") || q.includes("result") || q.includes("marks")) {
      return { type: "navigate", url: "/dashboard/results", label: "Grades & Performance" };
    }

    if (q.includes("transcript")) {
      return { type: "navigate", url: "/dashboard/transcript", label: "Official Academic Transcript" };
    }

    if (q.includes("profile") || q.includes("account") || q.includes("setting")) {
      return user.role === Role.STUDENT
        ? { type: "navigate", url: "/dashboard/student/profile", label: "My Profile" }
        : { type: "navigate", url: "/dashboard/faculty/profile", label: "Faculty Profile" };
    }

    if (q.includes("course") || q.includes("subject") || q.includes("syllabus")) {
      return user.role === Role.STUDENT
        ? { type: "navigate", url: "/dashboard/student/courses", label: "My Courses" }
        : { type: "navigate", url: "/dashboard/admin/subjects", label: "Subjects & Syllabus" };
    }

    if (q.includes("lost") || q.includes("found")) {
      return { type: "navigate", url: "/dashboard/student/lost-found", label: "Lost & Found Community Desk" };
    }

    if (q.includes("admin") || q.includes("governance") || q.includes("department")) {
      if (user.role === Role.ADMIN) {
        return { type: "navigate", url: "/dashboard/admin", label: "Administrator Command Center" };
      }
    }

    return null;
  }
}
