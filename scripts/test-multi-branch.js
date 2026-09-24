import assert from 'node:assert';
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
  getVisibleExams,
  getVisibleReports,
  getVisibleWings,
} from '../src/utils/branchScoping.js';
import {
  INITIAL_BRANCHES,
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_BATCHES,
  INITIAL_FEE_RECEIPTS,
  INITIAL_TESTS,
  INITIAL_ENQUIRIES,
  INITIAL_WINGS,
  generateInitialAttendanceRecords,
} from '../src/data/mockData.js';

const INITIAL_ATTENDANCE_RECORDS = generateInitialAttendanceRecords(INITIAL_STUDENTS);

console.log('🧪 Starting Multi-Branch Data Scoping & Active Branch Refactor Tests...\n');

// 1. SETUP TEST SCENARIO
// Admin assigned: Handwara + Qaziabad
const branchAdminUser = {
  id: 'u-admin-test',
  name: 'Branch Operations Admin',
  role: 'BRANCH_ADMIN',
  assignedBranchIds: ['b-hdw', 'b-qzb'],
  primaryBranchId: 'b-hdw',
};

const superAdminUser = {
  id: 'u-super-test',
  name: 'Dr. Ghulam Mohammad Lone',
  role: 'SUPER_ADMIN',
  assignedBranchIds: [], // All branches accessible
};

// 2. VERIFY INITIAL RESOLUTION
console.log('Test 1: Initial Active Branch Resolution');
const initialActive = resolveInitialActiveBranch(branchAdminUser, INITIAL_BRANCHES);
assert.strictEqual(initialActive, 'b-hdw', 'Initial branch should resolve to primary branch (b-hdw)');
console.log('  ✓ Initial active branch is Handwara (b-hdw)');

// 3. VERIFY ACCESSIBLE BRANCHES
console.log('\nTest 2: Accessible Branches Evaluation');
const accessible = getUserAccessibleBranches(branchAdminUser, INITIAL_BRANCHES);
assert.strictEqual(accessible.length, 2, 'Should only have 2 accessible branches');
assert.deepStrictEqual(
  accessible.map((b) => b.id).sort(),
  ['b-hdw', 'b-qzb'].sort(),
  'Accessible branches must be Handwara and Qaziabad'
);
console.log('  ✓ Admin only has access to Handwara and Qaziabad');

// 4. VERIFY DATA SCOPING FOR ACTIVE: HANDWARA
console.log('\nTest 3: Data Scoped to Active Branch: Handwara');
let currentActiveBranch = 'b-hdw';

const hdwStudents = getVisibleStudents(INITIAL_STUDENTS, currentActiveBranch);
assert(hdwStudents.length > 0, 'Handwara must have students');
assert(
  hdwStudents.every((s) => s.branchId === 'b-hdw'),
  'All visible students must strictly belong to Handwara'
);
console.log(`  ✓ Students scoped to Handwara count: ${hdwStudents.length}`);

const hdwTeachers = getVisibleTeachers(INITIAL_STAFF, currentActiveBranch);
assert(
  hdwTeachers.every((t) => t.branchId === 'b-hdw'),
  'All visible teachers must strictly belong to Handwara'
);
console.log(`  ✓ Teachers scoped to Handwara count: ${hdwTeachers.length}`);

const hdwBatches = getVisibleBatches(INITIAL_BATCHES, currentActiveBranch);
assert(
  hdwBatches.every((b) => b.branchId === 'b-hdw'),
  'All visible batches must strictly belong to Handwara'
);
console.log(`  ✓ Batches scoped to Handwara count: ${hdwBatches.length}`);

const hdwFees = getVisibleFees(INITIAL_FEE_RECEIPTS, currentActiveBranch, INITIAL_STUDENTS);
assert(
  hdwFees.every((f) => {
    if (f.branchId) return f.branchId === 'b-hdw';
    const s = INITIAL_STUDENTS.find((st) => st.id === f.studentId);
    return s ? s.branchId === 'b-hdw' : true;
  }),
  'All visible fees must belong to Handwara'
);
console.log(`  ✓ Fees scoped to Handwara count: ${hdwFees.length}`);

const hdwAttendance = getVisibleAttendance(INITIAL_ATTENDANCE_RECORDS, currentActiveBranch, INITIAL_STUDENTS);
assert(
  hdwAttendance.every((a) => {
    const s = INITIAL_STUDENTS.find((st) => st.id === a.studentId);
    return s ? s.branchId === 'b-hdw' : true;
  }),
  'All visible attendance records must belong to Handwara students'
);
console.log(`  ✓ Attendance records scoped to Handwara count: ${hdwAttendance.length}`);

const hdwReports = getVisibleReports({
  students: INITIAL_STUDENTS,
  enquiries: INITIAL_ENQUIRIES,
  feeReceipts: INITIAL_FEE_RECEIPTS,
  attendanceRecords: INITIAL_ATTENDANCE_RECORDS,
  employees: INITIAL_STAFF,
  branches: INITIAL_BRANCHES,
  activeBranchId: currentActiveBranch,
});
assert.strictEqual(hdwReports.totalStudents, hdwStudents.length, 'Reports student count must match Handwara students');
console.log(`  ✓ Reports scoped to Handwara (Total students: ${hdwReports.totalStudents}, Revenue: ₹${hdwReports.totalFeesCollected})`);

// 5. SWITCH TO QAZIABAD
console.log('\nTest 4: Switch Active Branch to Qaziabad');
const qzbSwitchValidation = validateBranchSwitch(branchAdminUser, 'b-qzb', INITIAL_BRANCHES);
assert.strictEqual(qzbSwitchValidation.allowed, true, 'Switch to assigned branch Qaziabad must be allowed');
currentActiveBranch = 'b-qzb';
console.log('  ✓ Branch switch to Qaziabad allowed by centralized validator');

const qzbStudents = getVisibleStudents(INITIAL_STUDENTS, currentActiveBranch);
assert(qzbStudents.length > 0, 'Qaziabad must have students');
assert(
  qzbStudents.every((s) => s.branchId === 'b-qzb'),
  'All visible students must strictly belong to Qaziabad'
);
assert.notDeepStrictEqual(
  hdwStudents.map((s) => s.id),
  qzbStudents.map((s) => s.id),
  'Handwara and Qaziabad students must not leak into each other'
);
console.log(`  ✓ Students successfully switched to Qaziabad count: ${qzbStudents.length}`);

const qzbTeachers = getVisibleTeachers(INITIAL_STAFF, currentActiveBranch);
assert(
  qzbTeachers.every((t) => t.branchId === 'b-qzb'),
  'All visible teachers must strictly belong to Qaziabad'
);
console.log(`  ✓ Teachers switched to Qaziabad count: ${qzbTeachers.length}`);

const qzbBatches = getVisibleBatches(INITIAL_BATCHES, currentActiveBranch);
assert(
  qzbBatches.every((b) => b.branchId === 'b-qzb'),
  'All visible batches must strictly belong to Qaziabad'
);
console.log(`  ✓ Batches switched to Qaziabad count: ${qzbBatches.length}`);

const qzbReports = getVisibleReports({
  students: INITIAL_STUDENTS,
  enquiries: INITIAL_ENQUIRIES,
  feeReceipts: INITIAL_FEE_RECEIPTS,
  attendanceRecords: INITIAL_ATTENDANCE_RECORDS,
  employees: INITIAL_STAFF,
  branches: INITIAL_BRANCHES,
  activeBranchId: currentActiveBranch,
});
assert.strictEqual(qzbReports.totalStudents, qzbStudents.length, 'Reports student count must match Qaziabad students');
console.log(`  ✓ Reports recalculate to Qaziabad (Total students: ${qzbReports.totalStudents}, Revenue: ₹${qzbReports.totalFeesCollected})`);

// 6. TRY UNASSIGNED BRANCH (DANGIWACHA) -> MUST FAIL SAFELY
console.log('\nTest 5: Switch to Unassigned Branch (Dangiwacha) -> Must Fail Safely');
const unassignedSwitchValidation = validateBranchSwitch(branchAdminUser, 'b-dgw', INITIAL_BRANCHES);
assert.strictEqual(unassignedSwitchValidation.allowed, false, 'Switch to unassigned branch must be disallowed');
assert(
  unassignedSwitchValidation.reason.length > 0,
  'Validation must return clear security denial message'
);
console.log(`  ✓ Switch to Dangiwacha rejected safely: "${unassignedSwitchValidation.reason}"`);

// 7. TRY "ALL" BRANCHES AS NORMAL ADMIN -> MUST FAIL SAFELY
console.log('\nTest 6: Switch to "all" as Branch Admin -> Must Fail Safely');
const allSwitchValidation = validateBranchSwitch(branchAdminUser, 'all', INITIAL_BRANCHES);
assert.strictEqual(allSwitchValidation.allowed, false, 'Non-HQ admin must NOT be allowed to switch to "all"');
console.log(`  ✓ Switch to "all" rejected safely: "${allSwitchValidation.reason}"`);

// 8. TRY "ALL" BRANCHES AS SUPERADMIN -> MUST SUCCEED
console.log('\nTest 7: Switch to "all" as SuperAdmin -> Must Succeed');
const superAdminAllSwitch = validateBranchSwitch(superAdminUser, 'all', INITIAL_BRANCHES);
assert.strictEqual(superAdminAllSwitch.allowed, true, 'SuperAdmin must be allowed to view all branches');
const allStudents = getVisibleStudents(INITIAL_STUDENTS, 'all');
assert.strictEqual(allStudents.length, INITIAL_STUDENTS.length, 'SuperAdmin with "all" sees all students');
console.log(`  ✓ SuperAdmin can view all branches consolidated (${allStudents.length} students total)`);

console.log('\n🎉 ALL MULTI-BRANCH VERIFICATION TESTS PASSED SUCCESSFULLY!');
