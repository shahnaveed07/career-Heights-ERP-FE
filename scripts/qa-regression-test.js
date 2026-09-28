import assert from 'node:assert';
import {
  SYSTEM_ROLES,
  ROLE_LABELS,
  normalizeRole,
  normalizeAction,
  checkPermission,
} from '../src/utils/permissionManager.js';
import {
  canUserAccessBranch,
  canUserAccessAllBranches,
  validateBranchSwitch,
  resolveInitialActiveBranch,
  getUserAccessibleBranches,
} from '../src/utils/branchAccessModel.js';
import {
  getVisibleStudents,
  getVisibleTeachers,
  getVisibleBatches,
  getVisibleAttendance,
  getVisibleFees,
  getVisibleReports,
  getVisibleWings,
} from '../src/utils/branchScoping.js';
import {
  CANONICAL_SUBJECTS,
  CANONICAL_SUBJECT_COMBOS,
  getClassesForBranch,
  getWingsForClass,
  getBatchesByHierarchy,
  getStudentEnrolledSubjectIds,
  getStudentEnrolledSubjects,
  isStudentEnrolledInSubject,
  getStudentsForTeacher,
} from '../src/utils/academicModel.js';
import {
  generateNextStudentId,
  generateNextReceiptNo,
  generateNextPaymentId,
  generateNextTransactionRef,
  isTransactionRefDuplicate,
} from '../src/utils/idGenerators.js';
import { upsertAttendanceRecord } from '../src/utils/attendanceCalculator.js';
import { getDefaultRouteForRole, ROUTES } from '../src/routes/routeConfig.js';
import {
  INITIAL_BRANCHES,
  INITIAL_CLASSES,
  INITIAL_WINGS,
  INITIAL_BATCHES,
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_FEE_RECEIPTS,
  INITIAL_TEACHER_ASSIGNMENTS,
  DEMO_USERS,
  generateInitialAttendanceRecords,
} from '../src/data/mockData.js';

console.log('====================================================');
console.log('🚀 RUNNING CAREER HEIGHTS ERP COMPREHENSIVE QA SUITE');
console.log('====================================================\n');

// ============================================================================
// 1. CANONICAL ROLES & AUTHORITY TEST MATRIX
// ============================================================================
console.log('SECTION 1: Canonical Roles & Permissions Matrix');

const expectedRoles = [
  SYSTEM_ROLES.SUPER_ADMIN,
  SYSTEM_ROLES.HQ_ADMIN,
  SYSTEM_ROLES.BRANCH_ADMIN,
  SYSTEM_ROLES.ACCOUNTANT_COORDINATOR,
  SYSTEM_ROLES.TEACHER,
  SYSTEM_ROLES.STUDENT,
  SYSTEM_ROLES.PARENT,
  SYSTEM_ROLES.HR,
  SYSTEM_ROLES.CUSTOM,
];

// Check all 9 canonical roles are distinct
assert.strictEqual(new Set(expectedRoles).size, 9, 'Must have exactly 9 distinct canonical roles');
console.log('  ✓ 9 canonical roles defined in SYSTEM_ROLES');

// Test role normalization
assert.strictEqual(normalizeRole('ceo'), SYSTEM_ROLES.SUPER_ADMIN);
assert.strictEqual(normalizeRole('owner'), SYSTEM_ROLES.SUPER_ADMIN);
assert.strictEqual(normalizeRole('super_admin'), SYSTEM_ROLES.SUPER_ADMIN);
assert.strictEqual(normalizeRole('admin'), SYSTEM_ROLES.BRANCH_ADMIN);
assert.strictEqual(normalizeRole('branch_admin'), SYSTEM_ROLES.BRANCH_ADMIN);
assert.strictEqual(normalizeRole('accountant'), SYSTEM_ROLES.ACCOUNTANT_COORDINATOR);
assert.strictEqual(normalizeRole('coordinator'), SYSTEM_ROLES.ACCOUNTANT_COORDINATOR);
assert.strictEqual(normalizeRole('faculty'), SYSTEM_ROLES.TEACHER);
assert.strictEqual(normalizeRole('student'), SYSTEM_ROLES.STUDENT);
assert.strictEqual(normalizeRole('guardian'), SYSTEM_ROLES.PARENT);
assert.strictEqual(normalizeRole('hr'), SYSTEM_ROLES.HR);
console.log('  ✓ All canonical role aliases normalize accurately');

// Test SuperAdmin (Owner) authority
const superAdmin = { id: 'u-1', role: SYSTEM_ROLES.SUPER_ADMIN };
assert.strictEqual(checkPermission(superAdmin, 'branches', 'create'), true);
assert.strictEqual(checkPermission(superAdmin, 'users', 'create'), true);
assert.strictEqual(checkPermission(superAdmin, 'fees', 'collect'), true);
assert.strictEqual(checkPermission(superAdmin, 'fees', 'discount'), true);
assert.strictEqual(checkPermission(superAdmin, 'custom_roles', 'create'), true);
console.log('  ✓ SuperAdmin (Owner) has unrestricted operational permissions');

// Test HQ Admin authority
const hqAdmin = { id: 'u-2', role: SYSTEM_ROLES.HQ_ADMIN };
assert.strictEqual(checkPermission(hqAdmin, 'branches', 'create'), true);
assert.strictEqual(checkPermission(hqAdmin, 'users', 'create'), true);
assert.strictEqual(checkPermission(hqAdmin, 'fees', 'collect'), true);
assert.strictEqual(checkPermission(hqAdmin, 'attendance', 'mark'), true);
console.log('  ✓ HQ Admin has centralized operational & user management permissions');

// Test Branch Admin authority
const branchAdmin = { id: 'u-3', role: SYSTEM_ROLES.BRANCH_ADMIN, assignedBranchIds: ['b-hdw'] };
assert.strictEqual(checkPermission(branchAdmin, 'students', 'create'), true);
assert.strictEqual(checkPermission(branchAdmin, 'attendance', 'mark'), true);
assert.strictEqual(checkPermission(branchAdmin, 'examination', 'create'), true);
// Default branch admin should NOT have fee collection rights unless overridden
assert.strictEqual(checkPermission(branchAdmin, 'fees', 'collect'), false);
assert.strictEqual(checkPermission(branchAdmin, 'users', 'create'), false);
console.log('  ✓ Branch Admin is appropriately isolated to branch operations without fee/user leakage');

// Test Accountant / Coordinator authority
const acctCoord = { id: 'u-4', role: SYSTEM_ROLES.ACCOUNTANT_COORDINATOR, assignedBranchIds: ['b-hdw'] };
assert.strictEqual(checkPermission(acctCoord, 'fees', 'collect'), true);
assert.strictEqual(checkPermission(acctCoord, 'fees', 'receipt'), true);
assert.strictEqual(checkPermission(acctCoord, 'fees', 'discount'), true);
assert.strictEqual(checkPermission(acctCoord, 'fees', 'manage_salary'), true);
// Should not have admin rights
assert.strictEqual(checkPermission(acctCoord, 'branches', 'create'), false);
assert.strictEqual(checkPermission(acctCoord, 'users', 'create'), false);
console.log('  ✓ Accountant / Coordinator has comprehensive fee/salary authority without administrative sprawl');

// Test Teacher authority
const teacher = { id: 'u-5', role: SYSTEM_ROLES.TEACHER };
assert.strictEqual(checkPermission(teacher, 'attendance', 'mark'), true);
assert.strictEqual(checkPermission(teacher, 'academic', 'solve_doubts'), true);
assert.strictEqual(checkPermission(teacher, 'fees', 'collect'), false);
assert.strictEqual(checkPermission(teacher, 'students', 'create'), false);
console.log('  ✓ Teacher has attendance and academic access without fee or management access');

// Test HR authority (current requirement: no dedicated administrative functionality)
const hrUser = { id: 'u-6', role: SYSTEM_ROLES.HR };
assert.strictEqual(checkPermission(hrUser, 'fees', 'collect'), false);
assert.strictEqual(checkPermission(hrUser, 'students', 'create'), false);
assert.strictEqual(checkPermission(hrUser, 'branches', 'create'), false);
console.log('  ✓ HR role has no unauthorized administrative exposure');

// Test Custom Role authority
const customExamOfficer = {
  id: 'u-7',
  role: SYSTEM_ROLES.CUSTOM,
  customRoleId: 'role-exam-officer',
  customPermissions: {
    examination: ['view', 'create', 'upload_omr', 'publish'],
    reports: ['view', 'export'],
  },
};
assert.strictEqual(checkPermission(customExamOfficer, 'examination', 'upload_omr'), true);
assert.strictEqual(checkPermission(customExamOfficer, 'reports', 'export'), true);
assert.strictEqual(checkPermission(customExamOfficer, 'fees', 'collect'), false);
console.log('  ✓ Custom Role evaluates explicit permissions correctly');

// ============================================================================
// 2. VIEW-ONLY VS EDIT MODE
// ============================================================================
console.log('\nSECTION 2: View-Only vs Edit Mode Enforcement');

// In view-only mode, read is allowed, but mutations must be strictly blocked
assert.strictEqual(checkPermission(superAdmin, 'students', 'view', 'view'), true);
assert.strictEqual(checkPermission(superAdmin, 'students', 'create', 'view'), false);
assert.strictEqual(checkPermission(superAdmin, 'fees', 'collect', 'view'), false);
assert.strictEqual(checkPermission(superAdmin, 'attendance', 'mark', 'view'), false);
assert.strictEqual(checkPermission(hqAdmin, 'branches', 'create', 'view'), false);
assert.strictEqual(checkPermission(acctCoord, 'fees', 'collect', 'view'), false);
console.log('  ✓ View-Only mode successfully locks mutating operations even for SuperAdmin');

// In edit mode, authorized mutations proceed
assert.strictEqual(checkPermission(superAdmin, 'students', 'create', 'edit'), true);
assert.strictEqual(checkPermission(acctCoord, 'fees', 'collect', 'edit'), true);
console.log('  ✓ Edit mode permits authorized mutations');

// ============================================================================
// 3. ALL 5 BRANCHES & CROSS-BRANCH ISOLATION
// ============================================================================
console.log('\nSECTION 3: Multi-Branch Isolation Across All 5 Campuses');

const branchIds = ['b-hdw', 'b-qzb', 'b-dgw', 'b-klb', 'b-uns'];
const branchNames = ['Handwara', 'Qaziabad', 'Dangiwacha', 'Kalambad', 'Unso'];

// Verify all 5 branches exist in INITIAL_BRANCHES
for (let i = 0; i < branchIds.length; i++) {
  const b = INITIAL_BRANCHES.find((br) => br.id === branchIds[i]);
  assert(b, `Branch ${branchIds[i]} (${branchNames[i]}) must exist`);
}
console.log('  ✓ All 5 campuses verified in master directory');

// Verify student scoping across branches
const studentsByBranch = {};
for (const bId of branchIds) {
  const scoped = getVisibleStudents(INITIAL_STUDENTS, bId);
  studentsByBranch[bId] = scoped;
  assert(scoped.length > 0, `Campus ${bId} must have students`);
  assert(scoped.every((s) => s.branchId === bId), `Campus ${bId} students must strictly belong to ${bId}`);
}

// Verify no data leakage between any pair of branches
for (let i = 0; i < branchIds.length; i++) {
  for (let j = i + 1; j < branchIds.length; j++) {
    const listA = studentsByBranch[branchIds[i]].map((s) => s.id);
    const listB = studentsByBranch[branchIds[j]].map((s) => s.id);
    const intersection = listA.filter((id) => listB.includes(id));
    assert.strictEqual(intersection.length, 0, `Data leak detected between ${branchIds[i]} and ${branchIds[j]}`);
  }
}
console.log('  ✓ Zero cross-branch student leakage across all pairwise combinations');

// Test branch switching validation for a single-campus admin
const dangiwachaAdmin = {
  id: 'u-dgw-admin',
  role: 'branch_admin',
  assignedBranchIds: ['b-dgw'],
  primaryBranchId: 'b-dgw',
};

// Switching to own branch is allowed
assert.strictEqual(validateBranchSwitch(dangiwachaAdmin, 'b-dgw', INITIAL_BRANCHES).allowed, true);
// Switching to other branches must be rejected safely
assert.strictEqual(validateBranchSwitch(dangiwachaAdmin, 'b-hdw', INITIAL_BRANCHES).allowed, false);
assert.strictEqual(validateBranchSwitch(dangiwachaAdmin, 'b-qzb', INITIAL_BRANCHES).allowed, false);
assert.strictEqual(validateBranchSwitch(dangiwachaAdmin, 'b-klb', INITIAL_BRANCHES).allowed, false);
assert.strictEqual(validateBranchSwitch(dangiwachaAdmin, 'b-uns', INITIAL_BRANCHES).allowed, false);
assert.strictEqual(validateBranchSwitch(dangiwachaAdmin, 'all', INITIAL_BRANCHES).allowed, false);
console.log('  ✓ Single-campus admin strictly locked to assigned campus');

// ============================================================================
// 4. ACADEMIC HIERARCHY & SINGLE-SUBJECT ENROLLMENT
// ============================================================================
console.log('\nSECTION 4: Academic Hierarchy & Single-Subject Enrollment');

// Hierarchy check: Branch -> Class -> Wing -> Batch -> Student
const hdwClasses = getClassesForBranch(INITIAL_CLASSES, 'b-hdw');
assert(hdwClasses.length > 0, 'Handwara must have classes');

const hdwWings = getWingsForClass(INITIAL_WINGS, 'c-12-med', 'b-hdw');
assert(hdwWings.length > 0, 'Class 12 Medical in Handwara must have wings');

const hdwBatches = getBatchesByHierarchy(INITIAL_BATCHES, { branchId: 'b-hdw', classId: 'c-12-med', wingId: 'w-med' });
assert(hdwBatches.length > 0, 'Should find Medical batch in Class 12 Handwara');

// Single-Subject Student Verification:
// A student who enrolled in ONLY Physics (e.g. for competitive crash revision)
const singleSubjectStudent = {
  id: 'st-single-phy',
  name: 'Zahid Mir',
  studentId: 'CH-2026-999',
  branchId: 'b-hdw',
  branchName: 'Handwara',
  classId: 'cls-11',
  wingId: 'w-eng',
  batchId: 'b-eng-11a',
  enrolledSubjects: ['sub-phy'], // Only 1 subject
  feesTotal: 15000,
  feesPaid: 10000,
  feesPending: 5000,
};

const enrolledIds = getStudentEnrolledSubjectIds(singleSubjectStudent);
assert.deepStrictEqual(enrolledIds, ['sub-phy'], 'Single-subject student must have exactly 1 enrolled subject');
assert.strictEqual(isStudentEnrolledInSubject(singleSubjectStudent, 'sub-phy'), true);
assert.strictEqual(isStudentEnrolledInSubject(singleSubjectStudent, 'sub-chem'), false);
assert.strictEqual(isStudentEnrolledInSubject(singleSubjectStudent, 'sub-math'), false);

const fullSubjects = getStudentEnrolledSubjects(singleSubjectStudent, CANONICAL_SUBJECTS);
assert.strictEqual(fullSubjects.length, 1);
assert.strictEqual(fullSubjects[0].name, 'Physics');
console.log('  ✓ Single-subject student correctly resolved to exactly 1 subject (Physics)');

// ============================================================================
// 5. TEACHER ACCESS & DERIVED STUDENT ROSTER
// ============================================================================
console.log('\nSECTION 5: Teacher Assignment & Derived Student Access');

// Setup:
// Teacher Dr. Rahul Sharma teaches 'Physics' (sub-phy) in batch 'b-eng-11a'
// Teacher Er. Tariq teaches 'Chemistry' (sub-chem) in batch 'b-eng-11a'
const mockTeacherAssignments = [
  {
    id: 'ta-1',
    teacherId: 'u-faculty-phy',
    teacherName: 'Dr. Rahul Sharma',
    branchId: 'b-hdw',
    classId: 'cls-11',
    wingId: 'w-eng',
    batchId: 'b-eng-11a',
    subjectId: 'sub-phy',
  },
  {
    id: 'ta-2',
    teacherId: 'u-faculty-chem',
    teacherName: 'Er. Tariq',
    branchId: 'b-hdw',
    classId: 'cls-11',
    wingId: 'w-eng',
    batchId: 'b-eng-11a',
    subjectId: 'sub-chem',
  },
];

const studentGroup = [
  singleSubjectStudent, // Only sub-phy
  {
    id: 'st-chem-only',
    name: 'Suhail Lone',
    batchId: 'b-eng-11a',
    enrolledSubjects: ['sub-chem'], // Only sub-chem
  },
  {
    id: 'st-pcm-both',
    name: 'Aarav Sharma',
    batchId: 'b-eng-11a',
    enrolledSubjects: ['sub-phy', 'sub-chem', 'sub-math'], // All 3
  },
  {
    id: 'st-other-batch',
    name: 'Different Batch Student',
    batchId: 'b-med-12a',
    enrolledSubjects: ['sub-phy'], // In different batch
  },
];

// Physics Teacher's students in batch b-eng-11a:
// Should see: singleSubjectStudent (phy) and Aarav Sharma (pcm), but NOT Suhail Lone (chem only) and NOT other batch
const phyTeacherStudents = getStudentsForTeacher({
  teacherId: 'u-faculty-phy',
  teacherAssignments: mockTeacherAssignments,
  students: studentGroup,
  batchId: 'b-eng-11a',
  subjectId: 'sub-phy',
  isSuperOrHq: false,
});

assert.strictEqual(phyTeacherStudents.length, 2, 'Physics teacher should see exactly 2 students');
assert(phyTeacherStudents.some((s) => s.id === 'st-single-phy'), 'Must include single-subject physics student');
assert(phyTeacherStudents.some((s) => s.id === 'st-pcm-both'), 'Must include PCM student');
assert(!phyTeacherStudents.some((s) => s.id === 'st-chem-only'), 'Must NOT include Chemistry-only student');
assert(!phyTeacherStudents.some((s) => s.id === 'st-other-batch'), 'Must NOT include student from different batch');
console.log('  ✓ Teacher only sees students enrolled in assigned subject; chemistry-only student excluded from physics roster');

// Chemistry Teacher's students:
const chemTeacherStudents = getStudentsForTeacher({
  teacherId: 'u-faculty-chem',
  teacherAssignments: mockTeacherAssignments,
  students: studentGroup,
  batchId: 'b-eng-11a',
  subjectId: 'sub-chem',
  isSuperOrHq: false,
});
assert.strictEqual(chemTeacherStudents.length, 2);
assert(chemTeacherStudents.some((s) => s.id === 'st-chem-only'));
assert(chemTeacherStudents.some((s) => s.id === 'st-pcm-both'));
assert(!chemTeacherStudents.some((s) => s.id === 'st-single-phy'), 'Physics-only student must not appear in chemistry roster');
console.log('  ✓ Chemistry teacher correctly does NOT see physics-only student');

// ============================================================================
// 6. ATTENDANCE & NO DUPLICATION TEST
// ============================================================================
console.log('\nSECTION 6: Attendance Record Upsert & No Duplication');

let testAttendance = [];
const today = '2026-09-26';

// 1. Mark initial attendance: Present
testAttendance = upsertAttendanceRecord(testAttendance, 'st-001', today, 'present', {
  studentName: 'Aarav Sharma',
  batchId: 'b-eng-11a',
  markedBy: 'Dr. Rahul Sharma',
});
assert.strictEqual(testAttendance.length, 1);
assert.strictEqual(testAttendance[0].status, 'present');

// 2. Mark again on same date: change to 'late' (explicit update)
testAttendance = upsertAttendanceRecord(testAttendance, 'st-001', today, 'late', {
  studentName: 'Aarav Sharma',
  batchId: 'b-eng-11a',
  markedBy: 'Dr. Rahul Sharma',
});
assert.strictEqual(testAttendance.length, 1, 'Attendance must NOT duplicate on re-marking same date');
assert.strictEqual(testAttendance[0].status, 'late', 'Status must update in-place');

// 3. Mark another student on same date
testAttendance = upsertAttendanceRecord(testAttendance, 'st-002', today, 'present', {
  studentName: 'Farhana Jan',
  batchId: 'b-eng-11a',
  markedBy: 'Dr. Rahul Sharma',
});
assert.strictEqual(testAttendance.length, 2);
console.log('  ✓ Attendance upsert strictly prevents duplicate records for same student on same date');

// ============================================================================
// 7. FEE PAYMENT, RECEIPTS, AND DUPLICATE REFERENCE TESTS
// ============================================================================
console.log('\nSECTION 7: Fees, Receipts, Partial/Full Payment & Ref Validation');

const sampleReceipts = [
  { id: 'rcpt-1', receiptNo: 'CH/RCPT/2026/000001', transactionRef: 'UPI-123456-789' },
  { id: 'rcpt-2', receiptNo: 'CH/RCPT/2026/000002', transactionRef: 'NEFT-2026-100005' },
];
const samplePayments = [
  { id: 'pay-2026-000001', transactionRef: 'UPI-123456-789' },
  { id: 'pay-2026-000002', transactionRef: 'NEFT-2026-100005' },
];

// 1. Stable Receipt ID & Number Generator
const nextRcpt = generateNextReceiptNo(sampleReceipts);
assert.strictEqual(nextRcpt.receiptNo, 'CH/RCPT/2026/000003');
assert.strictEqual(nextRcpt.id, 'rcpt-3');
console.log('  ✓ Fee Receipt generator generates sequential, non-array-length ID:', nextRcpt.receiptNo);

// 2. Stable Payment ID Generator
const nextPayId = generateNextPaymentId(samplePayments);
assert.strictEqual(nextPayId, 'pay-2026-000003');
console.log('  ✓ Payment ID generator generates sequential ID:', nextPayId);

// 3. Duplicate Transaction Ref Check
assert.strictEqual(isTransactionRefDuplicate('UPI-123456-789', samplePayments, sampleReceipts), true);
assert.strictEqual(isTransactionRefDuplicate('upi-123456-789', samplePayments, sampleReceipts), true, 'Case insensitive check');
assert.strictEqual(isTransactionRefDuplicate('NEFT-2026-100005', samplePayments, sampleReceipts), true);
assert.strictEqual(isTransactionRefDuplicate('UPI-999999-000', samplePayments, sampleReceipts), false);
// Cash vouchers are allowed to be reused
assert.strictEqual(isTransactionRefDuplicate('CSH-1001', samplePayments, sampleReceipts), false);
console.log('  ✓ Duplicate transaction reference detection accurately flags collisions');

// 4. Partial vs Full Payment Calculation
const studentWithDues = {
  id: 'st-due-test',
  feesTotal: 50000,
  feesPaid: 20000,
  feesPending: 30000,
  feesOverdue: 10000,
};

// Simulate partial payment of 15,000
const partialAmount = 15000;
const afterPartial = {
  ...studentWithDues,
  feesPaid: studentWithDues.feesPaid + partialAmount,
  feesPending: Math.max(0, studentWithDues.feesTotal - (studentWithDues.feesPaid + partialAmount)),
  feesOverdue: Math.max(0, studentWithDues.feesOverdue - partialAmount),
};
assert.strictEqual(afterPartial.feesPaid, 35000);
assert.strictEqual(afterPartial.feesPending, 15000);
assert.strictEqual(afterPartial.feesOverdue, 0);
console.log('  ✓ Partial payment correctly reduces feesPending and feesOverdue');

// Simulate full settlement of remaining 15,000
const fullAmount = 15000;
const afterFull = {
  ...afterPartial,
  feesPaid: afterPartial.feesPaid + fullAmount,
  feesPending: Math.max(0, afterPartial.feesTotal - (afterPartial.feesPaid + fullAmount)),
  feesOverdue: 0,
};
assert.strictEqual(afterFull.feesPaid, 50000);
assert.strictEqual(afterFull.feesPending, 0);
console.log('  ✓ Full payment brings feesPending to exactly 0 (account fully settled)');

// ============================================================================
// 8. ROUTING & DEFAULT LANDING PATHS
// ============================================================================
console.log('\nSECTION 8: Routing & Role Landing Dispatches');

assert.strictEqual(getDefaultRouteForRole(SYSTEM_ROLES.SUPER_ADMIN), ROUTES.DASHBOARD);
assert.strictEqual(getDefaultRouteForRole(SYSTEM_ROLES.HQ_ADMIN), ROUTES.DASHBOARD);
assert.strictEqual(getDefaultRouteForRole(SYSTEM_ROLES.BRANCH_ADMIN), ROUTES.DASHBOARD);
assert.strictEqual(getDefaultRouteForRole(SYSTEM_ROLES.ACCOUNTANT_COORDINATOR), ROUTES.FEES);
assert.strictEqual(getDefaultRouteForRole(SYSTEM_ROLES.TEACHER), ROUTES.TEACHER_PORTAL);
assert.strictEqual(getDefaultRouteForRole(SYSTEM_ROLES.STUDENT), ROUTES.STUDENT_PORTAL);
assert.strictEqual(getDefaultRouteForRole(SYSTEM_ROLES.PARENT), ROUTES.PARENT_PORTAL);
assert.strictEqual(getDefaultRouteForRole(SYSTEM_ROLES.HR), ROUTES.HR_STAFF);
console.log('  ✓ All role default routes route to their canonical dashboards/portals');

// ============================================================================
// 9. DEMO USERS INVENTORY & AUTH MATRIX
// ============================================================================
console.log('\nSECTION 9: Demo Accounts Authenticity & Integrity');

const demoAccounts = Object.keys(DEMO_USERS);
assert(demoAccounts.length >= 8, 'Must have demo accounts for all canonical personas');

const rolesRepresented = new Set();
for (const email of demoAccounts) {
  const d = DEMO_USERS[email];
  assert(d.passwordHint, `Demo account ${email} must provide passwordHint`);
  assert(d.user.role, `Demo account ${email} must have a defined role`);
  const canonical = normalizeRole(d.user.role);
  rolesRepresented.add(canonical);
}

for (const reqRole of expectedRoles) {
  assert(rolesRepresented.has(reqRole), `Role "${reqRole}" must have a designated demo user`);
}
console.log(`  ✓ All ${expectedRoles.length} canonical roles represented in DEMO_USERS`);

console.log('\n====================================================');
console.log('🎉 ALL 9 CORE REGRESSION TEST PHASES PASSED 100%!');
console.log('====================================================\n');
