export function calculateStudentAttendanceSummary(studentId, records) {
  const studentRecords = records.filter((r) => r.studentId === studentId);
  const presentCount = studentRecords.filter(
    (r) => r.status === 'present'
  ).length;
  const lateCount = studentRecords.filter((r) => r.status === 'late').length;
  const absentCount = studentRecords.filter(
    (r) => r.status === 'absent'
  ).length;
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
export function upsertAttendanceRecord(
  records,
  studentId,
  date,
  status,
  extra
) {
  const existingIdx = records.findIndex(
    (r) => r.studentId === studentId && r.date === date
  );
  if (existingIdx !== -1) {
    const updated = [...records];
    updated[existingIdx] = {
      ...updated[existingIdx],
      status,
      markedBy: extra.markedBy || updated[existingIdx].markedBy,
    };
    return updated;
  }
  const newRecord = {
    id: `att-${Date.now()}-${studentId}-${date}`,
    studentId,
    studentName: extra.studentName,
    studentCode: extra.studentCode,
    batchId: extra.batchId,
    batchName: extra.batchName,
    branchId: extra.branchId,
    date,
    status,
    checkInTime:
      status === 'present' || status === 'late' ? '08:30 AM' : void 0,
    markedBy: extra.markedBy || 'Faculty / Mentor',
  };
  return [newRecord, ...records];
}
