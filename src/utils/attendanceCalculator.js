export function calculateStudentAttendanceSummary(studentId, records = []) {
  const studentRecords = records.filter((r) => r.studentId === studentId);
  const presentCount = studentRecords.filter((r) => r.status === 'present').length;
  const lateCount = studentRecords.filter((r) => r.status === 'late').length;
  const absentCount = studentRecords.filter((r) => r.status === 'absent').length;
  const leaveCount = studentRecords.filter((r) => r.status === 'leave').length;
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
 * Upserts an attendance record while preventing duplicate attendance records
 * for the same student + date + batch/session.
 * 
 * If a record already exists:
 * - If status is unchanged, returns the existing records without redundant mutation.
 * - If status is modified (explicit edit), updates the existing record in-place.
 * 
 * Never silently creates duplicate entries.
 */
export function upsertAttendanceRecord(
  records = [],
  studentId,
  date,
  status,
  extra = {}
) {
  if (!studentId || !date || !status) return records;

  const targetBatchId = extra.batchId;
  const targetSession = extra.session || 'Morning Lecture';

  // Prevent duplicate attendance records for the same:
  // student + date + batch/session
  const existingIdx = records.findIndex((r) => {
    if (r.studentId !== studentId || r.date !== date) return false;
    if (targetBatchId && r.batchId && r.batchId !== targetBatchId) return false;
    const rSession = r.session || 'Morning Lecture';
    if (targetSession && rSession && rSession !== targetSession) return false;
    return true;
  });

  if (existingIdx !== -1) {
    const existing = records[existingIdx];
    // If identical status and markedBy, do not duplicate or mutate unnecessarily
    if (existing.status === status && (!extra.markedBy || existing.markedBy === extra.markedBy)) {
      return records;
    }

    // Explicit editing performed on existing record
    const updated = [...records];
    updated[existingIdx] = {
      ...existing,
      status,
      markedBy: extra.markedBy || existing.markedBy,
      checkInTime:
        status === 'present' || status === 'late'
          ? existing.checkInTime || '08:30 AM'
          : null,
      updatedAt: new Date().toISOString(),
      isEdited: true,
    };
    return updated;
  }

  // Insert fresh record (no duplicate exists)
  const newRecord = {
    id: `att-${Date.now()}-${studentId}-${date}`,
    studentId,
    studentName: extra.studentName || '',
    studentCode: extra.studentCode || '',
    batchId: targetBatchId || extra.batchId,
    batchName: extra.batchName || '',
    branchId: extra.branchId || '',
    session: targetSession,
    date,
    status,
    checkInTime:
      status === 'present' || status === 'late' ? '08:30 AM' : null,
    markedBy: extra.markedBy || 'Faculty / Mentor',
    createdAt: new Date().toISOString(),
  };

  return [newRecord, ...records];
}
