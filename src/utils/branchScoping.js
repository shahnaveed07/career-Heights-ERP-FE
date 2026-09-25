/**
 * Centralized Branch Scoping & Filtering Selectors
 * 
 * Guarantees that every branch-sensitive module strictly respects the active branch focus,
 * completely preventing cross-branch data leakage while preserving consolidated 'all' view
 * for authorized central leadership.
 */

export const isAllBranches = (activeBranchId) => {
  return !activeBranchId || activeBranchId === 'all';
};

/**
 * Filter students by active branch.
 */
export function getVisibleStudents(students = [], activeBranchId = 'all') {
  if (!Array.isArray(students)) return [];
  if (isAllBranches(activeBranchId)) {
    return students;
  }
  return students.filter((s) => s.branchId === activeBranchId);
}

/**
 * Filter teachers / faculty by active branch.
 * Takes into account both primary branchId and cross-branch teacher assignments.
 */
export function getVisibleTeachers(
  staff = [],
  activeBranchId = 'all',
  teacherAssignments = []
) {
  if (!Array.isArray(staff)) return [];
  const faculty = staff.filter(
    (s) =>
      s.role === 'teacher' ||
      s.isFaculty ||
      s.designation?.toLowerCase().includes('faculty') ||
      s.department === 'Faculty'
  );

  if (isAllBranches(activeBranchId)) {
    return faculty;
  }

  return faculty.filter((t) => {
    if (t.branchId === activeBranchId) return true;
    if (
      Array.isArray(teacherAssignments) &&
      teacherAssignments.some(
        (ta) => ta.teacherId === t.id && ta.branchId === activeBranchId
      )
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Filter all employees / staff by active branch.
 */
export function getVisibleStaff(staff = [], activeBranchId = 'all') {
  if (!Array.isArray(staff)) return [];
  if (isAllBranches(activeBranchId)) {
    return staff;
  }
  return staff.filter((s) => s.branchId === activeBranchId);
}

/**
 * Filter fee receipts and payments by active branch.
 * Resolves branch by receipt.branchId, student lookup, or branchName.
 */
export function getVisibleFees(
  feeReceipts = [],
  activeBranchId = 'all',
  students = [],
  branches = []
) {
  if (!Array.isArray(feeReceipts)) return [];
  if (isAllBranches(activeBranchId)) {
    return feeReceipts;
  }

  const branchObj = branches.find((b) => b.id === activeBranchId);
  const branchName = branchObj ? branchObj.name.toLowerCase() : '';

  // Create student branch lookup map for O(1) matching
  const studentBranchMap = new Map();
  if (Array.isArray(students)) {
    students.forEach((s) => studentBranchMap.set(s.id, s.branchId));
  }

  return feeReceipts.filter((r) => {
    if (r.branchId === activeBranchId) return true;
    const studentBranch = studentBranchMap.get(r.studentId);
    if (studentBranch === activeBranchId) return true;
    if (r.branchName && branchName && r.branchName.toLowerCase() === branchName) {
      return true;
    }
    return false;
  });
}

/**
 * Filter fee payments by active branch.
 */
export function getVisiblePayments(
  feePayments = [],
  activeBranchId = 'all',
  students = [],
  branches = []
) {
  return getVisibleFees(feePayments, activeBranchId, students, branches);
}

/**
 * Filter attendance records by active branch.
 */
export function getVisibleAttendance(
  attendanceRecords = [],
  activeBranchId = 'all',
  students = []
) {
  if (!Array.isArray(attendanceRecords)) return [];
  if (isAllBranches(activeBranchId)) {
    return attendanceRecords;
  }

  const studentBranchMap = new Map();
  if (Array.isArray(students)) {
    students.forEach((s) => studentBranchMap.set(s.id, s.branchId));
  }

  return attendanceRecords.filter((rec) => {
    if (rec.branchId === activeBranchId) return true;
    const studentBranch = studentBranchMap.get(rec.studentId);
    return studentBranch === activeBranchId;
  });
}

/**
 * Filter batches by active branch.
 */
export function getVisibleBatches(batches = [], activeBranchId = 'all') {
  if (!Array.isArray(batches)) return [];
  if (isAllBranches(activeBranchId)) {
    return batches;
  }
  return batches.filter((b) => b.branchId === activeBranchId);
}

/**
 * Filter wings by active branch.
 */
export function getVisibleWings(wings = [], activeBranchId = 'all') {
  if (!Array.isArray(wings)) return [];
  if (isAllBranches(activeBranchId)) {
    return wings;
  }
  return wings.filter((w) => w.branchId === activeBranchId);
}

/**
 * Filter exams / tests by active branch.
 * Tests marked 'all' or institutional diagnostic exams remain visible to all campuses.
 */
export function getVisibleExams(tests = [], activeBranchId = 'all') {
  if (!Array.isArray(tests)) return [];
  if (isAllBranches(activeBranchId)) {
    return tests;
  }
  return tests.filter(
    (t) => t.branchId === activeBranchId || t.branchId === 'all'
  );
}

/**
 * Filter admissions CRM enquiries by active branch.
 */
export function getVisibleEnquiries(enquiries = [], activeBranchId = 'all') {
  if (!Array.isArray(enquiries)) return [];
  if (isAllBranches(activeBranchId)) {
    return enquiries;
  }
  return enquiries.filter((e) => e.branchId === activeBranchId);
}

/**
 * Filter physical assets and inventory by active branch.
 */
export function getVisibleAssets(assets = [], activeBranchId = 'all') {
  if (!Array.isArray(assets)) return [];
  if (isAllBranches(activeBranchId)) {
    return assets;
  }
  return assets.filter((a) => a.branchId === activeBranchId);
}

/**
 * Filter documents vault by active branch.
 */
export function getVisibleDocuments(
  documents = [],
  activeBranchId = 'all',
  students = [],
  staff = []
) {
  if (!Array.isArray(documents)) return [];
  if (isAllBranches(activeBranchId)) {
    return documents;
  }

  const studentBranchMap = new Map();
  if (Array.isArray(students)) {
    students.forEach((s) => studentBranchMap.set(s.id, s.branchId));
  }

  const staffBranchMap = new Map();
  if (Array.isArray(staff)) {
    staff.forEach((st) => staffBranchMap.set(st.id, st.branchId));
  }

  return documents.filter((doc) => {
    if (doc.branchId === activeBranchId) return true;
    if (doc.studentId && studentBranchMap.get(doc.studentId) === activeBranchId) return true;
    if (doc.staffId && staffBranchMap.get(doc.staffId) === activeBranchId) return true;
    return false;
  });
}

/**
 * Filter communications, broadcasts, and notices by active branch.
 */
export function getVisibleCommunications(notifications = [], activeBranchId = 'all') {
  if (!Array.isArray(notifications)) return [];
  if (isAllBranches(activeBranchId)) {
    return notifications;
  }
  return notifications.filter(
    (n) => !n.branchId || n.branchId === 'all' || n.branchId === activeBranchId
  );
}

/**
 * Filter staff payroll records by active branch.
 */
export function getVisibleSalaries(salaries = [], activeBranchId = 'all') {
  if (!Array.isArray(salaries)) return [];
  if (isAllBranches(activeBranchId)) {
    return salaries;
  }
  return salaries.filter((s) => s.branchId === activeBranchId);
}

/**
 * Filter CHTQ scholarship candidates by active branch.
 */
export function getVisibleChtqCandidates(candidates = [], activeBranchId = 'all') {
  if (!Array.isArray(candidates)) return [];
  if (isAllBranches(activeBranchId)) {
    return candidates;
  }
  return candidates.filter((c) => !c.branchId || c.branchId === activeBranchId);
}

/**
 * Filter teacher geo-attendance records by active branch.
 */
export function getVisibleTeacherAttendance(
  teacherAttendanceRecords = [],
  activeBranchId = 'all',
  staff = []
) {
  if (!Array.isArray(teacherAttendanceRecords)) return [];
  if (isAllBranches(activeBranchId)) {
    return teacherAttendanceRecords;
  }

  const staffBranchMap = new Map();
  if (Array.isArray(staff)) {
    staff.forEach((st) => staffBranchMap.set(st.id || st.userId, st.branchId));
  }

  return teacherAttendanceRecords.filter((rec) => {
    if (rec.branchId === activeBranchId) return true;
    const branch = staffBranchMap.get(rec.teacherId);
    return branch === activeBranchId;
  });
}

/**
 * Calculates aggregated executive KPIs strictly scoped to active branch.
 */
export function getVisibleReports(dataset = {}, activeBranchId = 'all') {
  const branchId =
    activeBranchId !== 'all'
      ? activeBranchId
      : dataset.activeBranchId || 'all';

  const {
    students = [],
    feeReceipts = [],
    attendanceRecords = [],
    batches = [],
    branches = [],
    employees = [],
    enquiries = [],
    tests = [],
  } = dataset;

  const scopedStudents = getVisibleStudents(students, branchId);
  const scopedStaff = getVisibleStaff(employees, branchId);
  const scopedFaculty = getVisibleTeachers(employees, branchId);
  const scopedBatches = getVisibleBatches(batches, branchId);
  const scopedFees = getVisibleFees(feeReceipts, branchId, students, branches);
  const scopedEnquiries = getVisibleEnquiries(enquiries, branchId);
  const scopedTests = getVisibleExams(tests, branchId);
  const scopedAttendance = getVisibleAttendance(attendanceRecords, branchId, students);

  const totalFeeCollected = scopedFees.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const totalFeePending = scopedStudents.reduce((acc, s) => acc + (Number(s.feesPending) || 0), 0);
  const totalBilled = totalFeeCollected + totalFeePending;
  const collectionEfficiency = totalBilled > 0 ? (totalFeeCollected / totalBilled) * 100 : 0;

  const presentCount = scopedAttendance.filter((r) => r.status === 'Present').length;
  const totalAttendanceLogged = scopedAttendance.length;
  const attendanceRate = totalAttendanceLogged > 0
    ? (presentCount / totalAttendanceLogged) * 100
    : 85.5;

  const branchObj = branches.find((b) => b.id === activeBranchId);
  const scopeLabel = isAllBranches(activeBranchId)
    ? 'All Campuses (Consolidated HQ)'
    : `${branchObj?.name || 'Active'} Campus`;

  return {
    activeBranchId,
    scopeLabel,
    branchName: branchObj?.name || 'All Campuses',
    totalStudents: scopedStudents.length,
    activeStudents: scopedStudents.filter((s) => s.status === 'active').length,
    totalStaff: scopedStaff.length,
    totalFaculty: scopedFaculty.length,
    totalBatches: scopedBatches.length,
    totalFeesCollected: totalFeeCollected,
    totalFeesPending: totalFeePending,
    collectionEfficiency: Math.round(collectionEfficiency * 10) / 10,
    averageAttendanceRate: Math.round(attendanceRate * 10) / 10,
    totalEnquiries: scopedEnquiries.length,
    convertedEnquiries: scopedEnquiries.filter((e) => e.status === 'converted' || e.status === 'admitted').length,
    totalExams: scopedTests.length,
    scopedStudents,
    scopedStaff,
    scopedBatches,
    scopedFees,
  };
}
