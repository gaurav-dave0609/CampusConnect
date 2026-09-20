import {
  calculateAttendancePercentage,
  calculateAttendanceProjection,
  getAttendanceRisk,
  AttendanceRisk,
} from "@/lib/attendance/calculator";
import { StudentAttendanceSummary, SubjectAttendanceStat } from "@/services/attendance.service";

export interface AttendanceCalculationResult {
  currentPresent: number;
  currentConducted: number;
  currentPercentage: number;
  targetPercentage: number;
  isMeetingTarget: boolean;
  consecutiveNeeded: number;
  maxCanMiss: number;
  projectedAttendedIfConsecutive: number;
  projectedTotalIfConsecutive: number;
  projectedPercentageIfConsecutive: number;
  summaryText: string;
}

export interface SubjectComparisonResult {
  overallPercentage: number;
  overallRisk: AttendanceRisk;
  subjectsCount: number;
  lowestSubject: SubjectAttendanceStat | null;
  highestSubject: SubjectAttendanceStat | null;
  atRiskSubjects: SubjectAttendanceStat[];
  safeSubjects: SubjectAttendanceStat[];
  breakdown: Array<{
    code: string;
    name: string;
    faculty: string;
    conducted: number;
    present: number;
    absent: number;
    percentage: number;
    risk: AttendanceRisk;
    consecutiveNeeded: number;
    maxCanMiss: number;
  }>;
}

export interface TimetableProjectionResult {
  subjectCode?: string;
  subjectName?: string;
  targetDate?: string;
  scheduledLecturesCount: number;
  currentPercentage: number;
  targetPercentage: number;
  canReachTarget: boolean;
  projectedMaxPercentage: number;
  message: string;
}

export class AttendanceIntelligenceService {
  /**
   * Deterministically calculates lectures needed to reach target percentage P.
   * Formula: (Present + x) / (Conducted + x) >= P / 100
   * Solve: x = ceil((P * Conducted - 100 * Present) / (100 - P))
   */
  static calculateLecturesNeeded(
    present: number,
    conducted: number,
    targetPercentage = 75
  ): number {
    if (targetPercentage >= 100) return Infinity;
    if (conducted <= 0) return 0;

    const currentPct = calculateAttendancePercentage(present, conducted);
    if (currentPct >= targetPercentage) {
      return 0;
    }

    const numerator = targetPercentage * conducted - 100 * present;
    const denominator = 100 - targetPercentage;
    const needed = Math.ceil(numerator / denominator);
    return Math.max(0, needed);
  }

  /**
   * Deterministically calculates maximum lectures that can be missed while staying >= P%.
   * Formula: Present / (Conducted + m) >= P / 100
   * Solve: m = floor((100 * Present - P * Conducted) / P)
   */
  static calculateMaxCanMiss(
    present: number,
    conducted: number,
    targetPercentage = 75
  ): number {
    if (targetPercentage <= 0) return Infinity;
    if (conducted <= 0) return 0;

    const currentPct = calculateAttendancePercentage(present, conducted);
    if (currentPct < targetPercentage) {
      return 0;
    }

    const numerator = 100 * present - targetPercentage * conducted;
    const maxMiss = Math.floor(numerator / targetPercentage);
    return Math.max(0, maxMiss);
  }

  /**
   * Evaluates complete mathematical metrics for a given present and conducted count.
   */
  static evaluateMetrics(
    present: number,
    conducted: number,
    targetPercentage = 75
  ): AttendanceCalculationResult {
    const currentPercentage = calculateAttendancePercentage(present, conducted);
    const isMeetingTarget = currentPercentage >= targetPercentage;
    const consecutiveNeeded = this.calculateLecturesNeeded(present, conducted, targetPercentage);
    const maxCanMiss = this.calculateMaxCanMiss(present, conducted, targetPercentage);

    const projectedAttendedIfConsecutive = present + consecutiveNeeded;
    const projectedTotalIfConsecutive = conducted + consecutiveNeeded;
    const projectedPercentageIfConsecutive = calculateAttendancePercentage(
      projectedAttendedIfConsecutive,
      projectedTotalIfConsecutive
    );

    let summaryText = "";
    if (isMeetingTarget) {
      summaryText = `Your attendance is currently safe at ${currentPercentage.toFixed(1)}% (${present}/${conducted}). You can miss up to ${maxCanMiss} upcoming lecture${maxCanMiss === 1 ? "" : "s"} and still maintain the ${targetPercentage}% requirement.`;
    } else {
      summaryText = `Your attendance is currently ${currentPercentage.toFixed(1)}% (${present}/${conducted}), which is below the required ${targetPercentage}%. You must attend the next ${consecutiveNeeded} consecutive lecture${consecutiveNeeded === 1 ? "" : "s"} without missing any to reach ${projectedPercentageIfConsecutive.toFixed(1)}% (${projectedAttendedIfConsecutive}/${projectedTotalIfConsecutive}).`;
    }

    return {
      currentPresent: present,
      currentConducted: conducted,
      currentPercentage,
      targetPercentage,
      isMeetingTarget,
      consecutiveNeeded,
      maxCanMiss,
      projectedAttendedIfConsecutive,
      projectedTotalIfConsecutive,
      projectedPercentageIfConsecutive,
      summaryText,
    };
  }

  /**
   * Compares all subjects in student's academic record, ranking by risk and attendance percentage.
   */
  static compareSubjects(
    summary: StudentAttendanceSummary,
    targetPercentage = 75
  ): SubjectComparisonResult {
    const subjects = summary.subjectBreakdown;
    if (subjects.length === 0) {
      return {
        overallPercentage: summary.overallPercentage,
        overallRisk: summary.overallRisk,
        subjectsCount: 0,
        lowestSubject: null,
        highestSubject: null,
        atRiskSubjects: [],
        safeSubjects: [],
        breakdown: [],
      };
    }

    // Sort ascending by percentage
    const sorted = [...subjects].sort((a, b) => a.percentage - b.percentage);
    const lowestSubject = sorted[0];
    const highestSubject = sorted[sorted.length - 1];

    const atRiskSubjects = sorted.filter((s) => s.percentage < targetPercentage);
    const safeSubjects = sorted.filter((s) => s.percentage >= targetPercentage);

    const breakdown = sorted.map((s) => {
      const consecutiveNeeded = this.calculateLecturesNeeded(s.present, s.conducted, targetPercentage);
      const maxCanMiss = this.calculateMaxCanMiss(s.present, s.conducted, targetPercentage);
      return {
        code: s.subjectCode,
        name: s.subjectName,
        faculty: s.facultyName,
        conducted: s.conducted,
        present: s.present,
        absent: s.absent,
        percentage: s.percentage,
        risk: s.risk,
        consecutiveNeeded,
        maxCanMiss,
      };
    });

    return {
      overallPercentage: summary.overallPercentage,
      overallRisk: summary.overallRisk,
      subjectsCount: subjects.length,
      lowestSubject,
      highestSubject,
      atRiskSubjects,
      safeSubjects,
      breakdown,
    };
  }

  /**
   * Computes date-based attendance projections against active timetable schedule.
   */
  static projectAgainstTimetable(
    timetableSlots: Array<{ subjectCode: string; dayOfWeek: string; periodNumber: number }>,
    subjectCode: string | undefined,
    currentPresent: number,
    currentConducted: number,
    daysAhead = 7,
    targetPercentage = 75
  ): TimetableProjectionResult {
    // Count how many slots are scheduled in a regular 5-day week
    const matchingSlots = subjectCode
      ? timetableSlots.filter((s) => s.subjectCode.toLowerCase() === subjectCode.toLowerCase())
      : timetableSlots;

    const weeklyLectures = matchingSlots.length;
    // Estimate upcoming lectures in daysAhead
    const estimatedUpcoming = Math.round((weeklyLectures / 7) * daysAhead);

    const currentPercentage = calculateAttendancePercentage(currentPresent, currentConducted);
    const maxProjectedPresent = currentPresent + estimatedUpcoming;
    const maxProjectedTotal = currentConducted + estimatedUpcoming;
    const projectedMaxPercentage = calculateAttendancePercentage(maxProjectedPresent, maxProjectedTotal);
    const canReachTarget = projectedMaxPercentage >= targetPercentage;

    const consecutiveNeeded = this.calculateLecturesNeeded(currentPresent, currentConducted, targetPercentage);

    let message = "";
    if (estimatedUpcoming === 0) {
      message = `There are no scheduled lectures found for ${subjectCode || "this subject"} in the specified ${daysAhead}-day timeframe.`;
    } else if (currentPercentage >= targetPercentage) {
      const missable = this.calculateMaxCanMiss(currentPresent, currentConducted, targetPercentage);
      message = `Your attendance is currently safe at ${currentPercentage.toFixed(1)}%. In the next ${daysAhead} days, there are ${estimatedUpcoming} scheduled lectures. You can miss up to ${missable} lecture${missable === 1 ? "" : "s"} while maintaining the ${targetPercentage}% requirement.`;
    } else if (canReachTarget) {
      message = `There are ${estimatedUpcoming} upcoming lectures in the next ${daysAhead} days. If you attend all of them, your attendance will rise from ${currentPercentage.toFixed(1)}% to ${projectedMaxPercentage.toFixed(1)}%, successfully reaching your ${targetPercentage}% target! You need ${consecutiveNeeded} consecutive attendance${consecutiveNeeded === 1 ? "" : "s"}.`;
    } else {
      message = `In the next ${daysAhead} days, there are only ${estimatedUpcoming} scheduled lectures. Even if you attend every upcoming lecture, your maximum achievable attendance by then is ${projectedMaxPercentage.toFixed(1)}% (${maxProjectedPresent}/${maxProjectedTotal}), which remains below ${targetPercentage}%. You need ${consecutiveNeeded} total consecutive attendances across future weeks to recover.`;
    }

    return {
      subjectCode,
      targetDate: `+${daysAhead} days`,
      scheduledLecturesCount: estimatedUpcoming,
      currentPercentage,
      targetPercentage,
      canReachTarget,
      projectedMaxPercentage,
      message,
    };
  }
}
