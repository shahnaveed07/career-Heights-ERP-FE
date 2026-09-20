/**
 * Centralized Attendance Calculation & Derivation
 * Derived strictly from AttendanceRecord[]:
 * Attendance Percentage = Present / Eligible Attendance Days * 100
 * Eligible statuses: present, absent, late (leave is excused)
 */

import { AttendanceRecord, AttendanceStatus } from '../types';

export interface AttendanceSummary {
  rate: number;
  totalEligible: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
}

/**
 * Calculates a student's attendance summary directly from records.
 */
export function calculateStudentAttendanceSummary(
  studentId: string,
  records: AttendanceRecord[]
): AttendanceSummary {
  const studentRecords = records.filter(r => r.studentId === studentId);
  const presentCount = studentRecords.filter(r => r.status === 'present').length;
  const lateCount = studentRecords.filter(r => r.status === 'late').length;
  const absentCount = studentRecords.filter(r => r.status === 'absent').length;
  const leaveCount = studentRecords.filter(r => r.status === 'leave').length;

  const totalEligible = presentCount + absentCount + lateCount;

  if (totalEligible === 0) {
    return {
      rate: 100,
      totalEligible: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      leaveCount: 0,
    };
  }

  // Late counts as 0.5 attendance, present as 1.0
  const attendedScore = presentCount + lateCount * 0.5;
  const rawRate = (attendedScore / totalEligible) * 100;
  const rate = Math.min(100, Math.max(0, Math.round(rawRate * 10) / 10));

  return {
    rate,
    totalEligible,
    presentCount,
    absentCount,
    lateCount,
    leaveCount,
  };
}

/**
 * Derives the updated AttendanceRecord list without duplicates for (studentId, date).
 * If a record exists for that date, updates it. If not, prepends/appends the new one.
 */
export function upsertAttendanceRecord(
  records: AttendanceRecord[],
  studentId: string,
  date: string,
  status: AttendanceStatus,
  extra: {
    studentName: string;
    studentCode?: string;
    batchId: string;
    batchName: string;
    branchId?: string;
    markedBy?: string;
  }
): AttendanceRecord[] {
  const existingIdx = records.findIndex(r => r.studentId === studentId && r.date === date);

  if (existingIdx !== -1) {
    const updated = [...records];
    updated[existingIdx] = {
      ...updated[existingIdx],
      status,
      markedBy: extra.markedBy || updated[existingIdx].markedBy,
    };
    return updated;
  }

  const newRecord: AttendanceRecord = {
    id: `att-${Date.now()}-${studentId}-${date}`,
    studentId,
    studentName: extra.studentName,
    studentCode: extra.studentCode,
    batchId: extra.batchId,
    batchName: extra.batchName,
    branchId: extra.branchId,
    date,
    status,
    checkInTime: status === 'present' || status === 'late' ? '08:30 AM' : undefined,
    markedBy: extra.markedBy || 'Faculty / Mentor',
  };

  return [newRecord, ...records];
}
