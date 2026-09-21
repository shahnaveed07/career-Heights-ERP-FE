import { useState } from 'react';
import {
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { isToday, isPastOrToday, isCurrentMonth } from '../utils/dateUtils';
import { StudentAvatar } from '../components/common/StudentAvatar';
export const CeoDashboardView = ({
  onNavigateToStudent,
  onNavigateToModule,
}) => {
  const {
    branches,
    wings,
    classes,
    batches,
    students,
    enquiries,
    tests,
    employees,
    documents,
    feeReceipts,
  } = useErpData();
  const { activeBranchFilter, setActiveBranchFilter } = useAuth();
  const [drillLevel, setDrillLevel] = useState('hq');
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedWingId, setSelectedWingId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const filteredStudents =
    activeBranchFilter === 'all'
      ? students
      : students.filter((s) => s.branchId === activeBranchFilter);
  const filteredEnquiries =
    activeBranchFilter === 'all'
      ? enquiries
      : enquiries.filter((e) => e.branchId === activeBranchFilter);
  const filteredReceipts =
    activeBranchFilter === 'all'
      ? feeReceipts
      : feeReceipts.filter((r) => {
          const student = students.find((s) => s.id === r.studentId);
          if (student) return student.branchId === activeBranchFilter;
          const targetBranch = branches.find(
            (b) => b.id === activeBranchFilter
          );
          return targetBranch ? r.branchName === targetBranch.name : true;
        });
  const filteredBranches =
    activeBranchFilter === 'all'
      ? branches
      : branches.filter((b) => b.id === activeBranchFilter);
  const filteredEmployees =
    activeBranchFilter === 'all'
      ? employees
      : employees.filter((e) => e.branchId === activeBranchFilter);
  const totalStudents = filteredStudents.length;
  const newAdmissions = filteredStudents.filter((s) =>
    isCurrentMonth(s.admissionDate)
  ).length;
  const todayAdmissions = filteredStudents.filter((s) =>
    isToday(s.admissionDate)
  ).length;
  const todayEnquiries = filteredEnquiries.filter((e) =>
    isToday(e.date)
  ).length;
  const totalEnquiriesCount = filteredEnquiries.length;
  const convertedEnquiries = filteredEnquiries.filter(
    (e) => e.status === 'admission'
  ).length;
  const admissionConversionRate =
    totalEnquiriesCount > 0
      ? ((convertedEnquiries / totalEnquiriesCount) * 100).toFixed(1)
      : '0.0';
  const todayReceipts = filteredReceipts.filter((r) => isToday(r.date));
  const todayCollection = todayReceipts.reduce((sum, r) => sum + r.amount, 0);
  const outstandingFees = filteredStudents.reduce(
    (sum, s) => sum + s.feesPending,
    0
  );
  const avgAttendance =
    filteredStudents.length > 0
      ? (
          filteredStudents.reduce((sum, s) => sum + s.attendanceRate, 0) /
          filteredStudents.length
        ).toFixed(1)
      : '0.0';
  const totalTestsConducted = tests.length;
  const activeFacultyCount = filteredEmployees.filter(
    (e) => e.role === 'faculty' && e.status === 'active'
  ).length;
  const pendingDocsCount = documents.filter(
    (d) => d.status === 'pending'
  ).length;
  const criticalAttendanceStudents = filteredStudents.filter(
    (s) => s.attendanceRate < 75
  );
  const overdueFeeStudents = filteredStudents.filter((s) => s.feesOverdue > 0);
  const criticalAcademicStudents = filteredStudents.filter(
    (s) => s.academicRisk === 'Critical'
  );
  const lowAttendanceStudents = filteredStudents.filter(
    (s) => s.attendanceRate >= 75 && s.attendanceRate < 80
  );
  const pendingDocStudents = filteredStudents.filter(
    (s) => s.pendingDocuments > 0
  );
  const followUpDueEnquiries = filteredEnquiries.filter(
    (e) =>
      e.status !== 'admission' &&
      e.status !== 'lost' &&
      isPastOrToday(e.nextFollowUp)
  );
  const activeBranch = branches.find((b) => b.id === selectedBranchId);
  const activeWing = wings.find((w) => w.id === selectedWingId);
  const activeClass = classes.find((c) => c.id === selectedClassId);
  const activeBatch = batches.find((b) => b.id === selectedBatchId);
  const branchWings = wings.filter((w) => w.branchId === selectedBranchId);
  const wingClasses = classes.filter((c) => c.wingId === selectedWingId);
  const classBatches = batches.filter((b) => b.classId === selectedClassId);
  const batchStudents = students.filter((s) => s.batchId === selectedBatchId);
  const resetToHq = () => {
    setDrillLevel('hq');
    setSelectedBranchId(null);
    setSelectedWingId(null);
    setSelectedClassId(null);
    setSelectedBatchId(null);
  };
  const handleBranchClick = (branchId) => {
    setSelectedBranchId(branchId);
    setSelectedWingId(null);
    setSelectedClassId(null);
    setSelectedBatchId(null);
    setDrillLevel('branch');
  };
  const handleWingClick = (wingId) => {
    setSelectedWingId(wingId);
    setSelectedClassId(null);
    setSelectedBatchId(null);
    setDrillLevel('wing');
  };
  const handleClassClick = (classId) => {
    setSelectedClassId(classId);
    setSelectedBatchId(null);
    setDrillLevel('class');
  };
  const handleBatchClick = (batchId) => {
    setSelectedBatchId(batchId);
    setDrillLevel('batch');
  };
  return (
    <div className="space-y-6 pb-12">
      {/* Primary Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-900 px-2 py-0.5 text-xs font-bold text-white tracking-wider uppercase">
                EXECUTIVE INTELLIGENCE
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Live Consolidated View
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              CAREER HEIGHTS — CEO DASHBOARD
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Multi-branch centralized command for Handwara, Qaziabad,
              Dangiwacha, Kalambad &amp; Unso campuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateToModule?.('admissions_crm')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
            >
              <Users className="h-3.5 w-3.5 text-blue-900" />
              <span>Lead Pipeline</span>
            </button>
            <button
              onClick={() => onNavigateToModule?.('fees')}
              className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>Collect / View Fees</span>
            </button>
          </div>
        </div>

        {/* 10 Vital Key Performance Indicators (KPIs) */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {/* 1. Total Students */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Total Students
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {totalStudents}
              </span>
              <span className="flex items-center text-[10px] font-bold text-emerald-700">
                <ArrowUpRight className="h-3 w-3" /> +14.2%
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Enrolled across 5 branches
            </p>
          </div>

          {/* 2. New Admissions */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              New Admissions
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-900">
                {newAdmissions}
              </span>
              <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-blue-800">
                {todayAdmissions > 0
                  ? `+${todayAdmissions} Today`
                  : 'This Month'}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Regular + Scholarship intakes
            </p>
          </div>

          {/* 3. Today's Enquiries */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Today's Enquiries
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-700">
                {todayEnquiries}
              </span>
              <span className="flex items-center text-[10px] font-bold text-emerald-700">
                <ArrowUpRight className="h-3 w-3" /> Live
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Walk-in &amp; Telephonic
            </p>
          </div>

          {/* 4. Admission Conversion % */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Conversion %
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-700">
                {admissionConversionRate}%
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Target: 30%
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Lead-to-enrollment ratio
            </p>
          </div>

          {/* 5. Today's Collection */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Today's Collection
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-800">
                {todayCollection > 0
                  ? `\u20B9${(todayCollection / 1e3).toFixed(1)}k`
                  : '\u20B90'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700">
                Verified
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              {todayReceipts.length > 0
                ? `${todayReceipts.length} official receipt${todayReceipts.length === 1 ? '' : 's'} issued`
                : 'No receipts logged today'}
            </p>
          </div>

          {/* 6. Outstanding Fees */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Outstanding Fees
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-red-700">
                ₹{(outstandingFees / 1e5).toFixed(2)}L
              </span>
              <span className="flex items-center text-[10px] font-bold text-amber-700">
                <AlertTriangle className="h-3 w-3" /> Due
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Installments pending
            </p>
          </div>

          {/* 7. Overall Attendance % */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Overall Attendance
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {avgAttendance}%
              </span>
              <span className="text-[10px] font-semibold text-emerald-700">
                &gt;85% Standard
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Real-time daily average
            </p>
          </div>

          {/* 8. Tests Conducted */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Tests Conducted
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-900">
                {totalTestsConducted}
              </span>
              <span className="text-[10px] font-bold text-blue-700">
                OMR + Online
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Evaluated &amp; processed
            </p>
          </div>

          {/* 9. Active Faculty */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Active Faculty
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {activeFacultyCount}
              </span>
              <span className="text-[10px] font-bold text-emerald-700">
                100% Present
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Academic staff on duty
            </p>
          </div>

          {/* 10. Pending Documents */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Pending Documents
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-600">
                {pendingDocsCount}
              </span>
              <span className="text-[10px] font-bold text-amber-700">
                Needs Audit
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Verification vault queue
            </p>
          </div>
        </div>
      </div>

      {/* "Attention Required" Section (RED / AMBER / GREEN) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Attention Required — Priority Escalation Matrix</span>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                {criticalAttendanceStudents.length +
                  overdueFeeStudents.length +
                  criticalAcademicStudents.length}{' '}
                Critical Action Items
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Automated algorithmic flags triaged into Red, Amber, and Green
              management tiers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* RED Tier */}
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-red-200">
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-800 uppercase tracking-wide">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>RED: Urgent Action</span>
              </span>
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                {criticalAttendanceStudents.length + overdueFeeStudents.length}{' '}
                Items
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              {/* Critical Attendance */}
              <div className="rounded-lg bg-white p-2.5 border border-red-100 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-red-900">
                  <span>Critical Attendance (&lt;75%)</span>
                  <span className="text-red-700">
                    {criticalAttendanceStudents.length} Students
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  e.g. <strong>Faizan Dar</strong> (Handwara JEE-A) at{' '}
                  <strong>64.2%</strong>. Absent for 4 tests.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Auto SMS triggered to parent
                  </span>
                  <button
                    onClick={() => onNavigateToModule?.('attendance')}
                    className="text-[11px] font-bold text-red-700 hover:underline"
                  >
                    View Roster &rarr;
                  </button>
                </div>
              </div>

              {/* Overdue Fees */}
              <div className="rounded-lg bg-white p-2.5 border border-red-100 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-red-900">
                  <span>Overdue Fee Accounts</span>
                  <span className="text-red-700">
                    {overdueFeeStudents.length} Cases
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  Totaling{' '}
                  <strong>
                    ₹
                    {overdueFeeStudents
                      .reduce((a, b) => a + b.feesOverdue, 0)
                      .toLocaleString()}
                  </strong>{' '}
                  pending beyond due date.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Notice issued
                  </span>
                  <button
                    onClick={() => onNavigateToModule?.('fees')}
                    className="text-[11px] font-bold text-red-700 hover:underline"
                  >
                    Remind Parents &rarr;
                  </button>
                </div>
              </div>

              {/* Critical Academic Risk */}
              <div className="rounded-lg bg-white p-2.5 border border-red-100 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-red-900">
                  <span>Academic Risk (Score &lt; 40%)</span>
                  <span className="text-red-700">
                    {criticalAcademicStudents.length} Students
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  Requiring remedial batch allocation and weekly mentor 1-on-1
                  check-ins.
                </p>
              </div>
            </div>
          </div>

          {/* AMBER Tier */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>AMBER: Attention Required</span>
              </span>
              <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                {lowAttendanceStudents.length +
                  pendingDocsCount +
                  followUpDueEnquiries.length}{' '}
                Items
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              {/* Low Attendance Warning */}
              <div className="rounded-lg bg-white p-2.5 border border-amber-100 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Borderline Attendance (75-80%)</span>
                  <span className="text-amber-800">
                    {lowAttendanceStudents.length} Students
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  Approaching minimum threshold. Faculty mentors notified to
                  issue early warning.
                </p>
              </div>

              {/* Pending Documents */}
              <div className="rounded-lg bg-white p-2.5 border border-amber-100 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Documents Pending Approval</span>
                  <span className="text-amber-800">
                    {pendingDocsCount} Docs
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  Unverified Aadhaar cards and blurred Class 10 marksheet scans
                  in vault.
                </p>
                <div className="mt-2 text-right">
                  <button
                    onClick={() => onNavigateToModule?.('documents')}
                    className="text-[11px] font-bold text-amber-800 hover:underline"
                  >
                    Open Document Vault &rarr;
                  </button>
                </div>
              </div>

              {/* Follow-ups Due */}
              <div className="rounded-lg bg-white p-2.5 border border-amber-100 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Counselling Follow-ups Due</span>
                  <span className="text-amber-800">
                    {followUpDueEnquiries.length} Leads
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  Includes top CHTQ scorers pending seat confirmation at
                  Handwara &amp; Qaziabad.
                </p>
                <div className="mt-2 text-right">
                  <button
                    onClick={() => onNavigateToModule?.('admissions_crm')}
                    className="text-[11px] font-bold text-amber-800 hover:underline"
                  >
                    View Follow-ups &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* GREEN Tier */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>GREEN: Healthy / On-Track</span>
              </span>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                Stable
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>Faculty Regularity</span>
                  <span className="text-emerald-700">98.2%</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  All 30+ faculty and staff logged biometric checks. Syllabus
                  running on schedule.
                </p>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>Fee Collection Efficiency</span>
                  <span className="text-emerald-700">92.4% at Handwara</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  Strong fee recovery in Q2 tuition installments across top
                  cohorts.
                </p>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>Exam Performance Trajectory</span>
                  <span className="text-emerald-700">92.6% Top Score</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  JEE Advanced mock tests showing steady upward percentile
                  migration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Organization Hierarchy Drill-Down Section */}
      {/* HQ -> Branch -> Wing -> Class -> Batch -> Student */}
      <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                Interactive Organizational Hierarchy
              </span>
              <span className="text-xs text-slate-400">
                Click any level to drill down
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Drill-down: HQ &rarr; Branch &rarr; Wing &rarr; Class &rarr; Batch
              &rarr; Student
            </h2>
          </div>

          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
            <button
              onClick={resetToHq}
              className={`rounded px-2 py-1 transition ${drillLevel === 'hq' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Career Heights HQ
            </button>

            {selectedBranchId && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <button
                  onClick={() => setDrillLevel('branch')}
                  className={`rounded px-2 py-1 transition ${drillLevel === 'branch' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {activeBranch?.name} Branch
                </button>
              </>
            )}

            {selectedWingId && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <button
                  onClick={() => setDrillLevel('wing')}
                  className={`rounded px-2 py-1 transition ${drillLevel === 'wing' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {activeWing?.name}
                </button>
              </>
            )}

            {selectedClassId && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <button
                  onClick={() => setDrillLevel('class')}
                  className={`rounded px-2 py-1 transition ${drillLevel === 'class' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {activeClass?.name}
                </button>
              </>
            )}

            {selectedBatchId && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="rounded bg-blue-900 text-white px-2 py-1">
                  Batch: {activeBatch?.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Drill-down View Body */}
        <div className="mt-5">
          {/* LEVEL: HQ (Show all 5 branches cards with metrics) */}
          {drillLevel === 'hq' && (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                <span>
                  Select a branch below to explore its academic wings and
                  cohorts:
                </span>
                <span className="font-semibold text-slate-700">
                  5 Operational Campuses
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleBranchClick(b.id)}
                    className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:border-blue-800 hover:bg-blue-50/30 hover:shadow-md transition text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-blue-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {b.code}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-900 transition-transform group-hover:translate-x-0.5" />
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-blue-900">
                      {b.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {b.city} Campus
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Students:</span>
                        <span className="font-bold text-slate-900">
                          {b.studentCount} / {b.capacity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Attendance:</span>
                        <span className="font-semibold text-emerald-700">
                          {b.attendanceRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Revenue:</span>
                        <span className="font-bold text-slate-900">
                          ₹{(b.monthlyRevenue / 1e5).toFixed(2)}L
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 inline-flex items-center text-[10px] font-bold text-blue-900 group-hover:underline">
                      Explore Wings &rarr;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL: BRANCH (Show Wings inside selected branch) */}
          {drillLevel === 'branch' && activeBranch && (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <div>
                  <span className="text-slate-500">Branch: </span>
                  <strong className="text-slate-900 text-sm">
                    {activeBranch.name}
                  </strong>
                  <span className="ml-2 text-slate-400">
                    ({activeBranch.address})
                  </span>
                </div>
                <button
                  onClick={resetToHq}
                  className="text-xs font-semibold text-blue-900 hover:underline"
                >
                  &larr; Back to All Branches
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {branchWings.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => handleWingClick(w.id)}
                    className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-900 hover:shadow-md transition text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {w.code}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-900" />
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-blue-900">
                      {w.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {w.description}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Classes enrolled in wing
                      </span>
                      <span className="font-bold text-blue-900">
                        View Classes &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL: WING (Show Classes inside selected wing) */}
          {drillLevel === 'wing' && activeWing && (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <div>
                  <span className="text-slate-500">Wing: </span>
                  <strong className="text-slate-900 text-sm">
                    {activeWing.name}
                  </strong>
                  <span className="ml-2 text-slate-400">
                    in {activeBranch?.name}
                  </span>
                </div>
                <button
                  onClick={() => setDrillLevel('branch')}
                  className="text-xs font-semibold text-blue-900 hover:underline"
                >
                  &larr; Back to Wings
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wingClasses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleClassClick(c.id)}
                    className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-900 hover:shadow-md transition text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {c.grade}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-900" />
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-blue-900">
                      {c.name}
                    </h3>
                    <p className="text-xs text-blue-900 font-semibold mt-0.5">
                      {c.stream}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Assigned Batches</span>
                      <span className="font-bold text-blue-900">
                        Select Batch &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL: CLASS (Show Batches inside selected class) */}
          {drillLevel === 'class' && activeClass && (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <div>
                  <span className="text-slate-500">Class: </span>
                  <strong className="text-slate-900 text-sm">
                    {activeClass.name}
                  </strong>
                </div>
                <button
                  onClick={() => setDrillLevel('wing')}
                  className="text-xs font-semibold text-blue-900 hover:underline"
                >
                  &larr; Back to Classes
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classBatches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleBatchClick(b.id)}
                    className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-900 hover:shadow-md transition text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                        {b.code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Att: {b.attendanceToday}%
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-blue-900">
                      Batch {b.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Mentor: {b.facultyMentor}
                    </p>

                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Timing:</span>
                        <span className="font-semibold text-slate-800">
                          {b.timing}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Students:</span>
                        <span className="font-bold text-slate-900">
                          {b.studentCount} / {b.capacity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Room:</span>
                        <span className="font-semibold text-slate-800">
                          {b.roomNumber}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900">
                      <span>View Enrolled Students</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL: BATCH (Show Students in this batch) */}
          {drillLevel === 'batch' && activeBatch && (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <div>
                  <span className="text-slate-500">Batch: </span>
                  <strong className="text-slate-900 text-sm">
                    {activeBatch.name} ({activeBatch.code})
                  </strong>
                  <span className="ml-2 text-slate-500">
                    Mentor: {activeBatch.facultyMentor} • {batchStudents.length}{' '}
                    Students
                  </span>
                </div>
                <button
                  onClick={() => setDrillLevel('class')}
                  className="text-xs font-semibold text-blue-900 hover:underline"
                >
                  &larr; Back to Batches
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Student ID</th>
                      <th className="py-2.5 px-3 text-left">Student Name</th>
                      <th className="py-2.5 px-3 text-left">Parent Contact</th>
                      <th className="py-2.5 px-3 text-left">Scholarship</th>
                      <th className="py-2.5 px-3 text-left">Attendance</th>
                      <th className="py-2.5 px-3 text-left">Fee Status</th>
                      <th className="py-2.5 px-3 text-left">Risk</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {batchStudents.slice(0, 15).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                          {s.studentId}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <StudentAvatar
                              photo={s.photo}
                              name={s.name}
                              size="xs"
                            />
                            <span className="font-bold text-slate-900">
                              {s.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div>{s.parentName}</div>
                          <div className="text-[10px] text-slate-400">
                            {s.parentPhone}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${s.scholarshipPercent > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}
                          >
                            {s.scholarshipType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-bold ${s.attendanceRate < 75 ? 'text-red-700' : s.attendanceRate < 80 ? 'text-amber-700' : 'text-emerald-700'}`}
                          >
                            {s.attendanceRate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {s.feesPending === 0 ? (
                            <span className="text-emerald-700 font-semibold">
                              Fully Paid
                            </span>
                          ) : s.feesOverdue > 0 ? (
                            <span className="text-red-700 font-bold">
                              ₹{s.feesOverdue.toLocaleString()} Overdue
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              ₹{s.feesPending.toLocaleString()} Pending
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${s.academicRisk === 'Critical' ? 'bg-red-100 text-red-800' : s.academicRisk === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                          >
                            {s.academicRisk}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onNavigateToStudent?.(s.id)}
                            className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-800 hover:bg-blue-900 hover:text-white transition"
                          >
                            Full Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Branch-Wise Analytics Table & Comparisons */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Branch-Wise Comparative Analytics Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Cross-branch benchmarking of enrollments, revenue, collections,
              and academic attendance.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Currency: INR (₹)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Branch Name</th>
                <th className="py-3 px-4 text-left">Campus Code</th>
                <th className="py-3 px-4 text-right">Students</th>
                <th className="py-3 px-4 text-right">Capacity Utilization</th>
                <th className="py-3 px-4 text-right">Monthly Revenue</th>
                <th className="py-3 px-4 text-right">Collection %</th>
                <th className="py-3 px-4 text-right">Attendance %</th>
                <th className="py-3 px-4 text-right">Faculty</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-8 text-center text-xs text-slate-500"
                  >
                    No operating branch records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => {
                  const util = (
                    (branch.studentCount / branch.capacity) *
                    100
                  ).toFixed(0);
                  return (
                    <tr
                      key={branch.id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        {branch.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                          {branch.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {branch.studentCount}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-blue-900 rounded-full"
                              style={{ width: `${util}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-700">
                            {util}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{branch.monthlyRevenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold ${branch.collectionRate >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}
                        >
                          {branch.collectionRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold ${branch.attendanceRate >= 85 ? 'text-emerald-700' : 'text-amber-700'}`}
                        >
                          {branch.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-700">
                        {branch.facultyCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleBranchClick(branch.id)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-900 hover:bg-blue-50 transition shadow-2xs"
                        >
                          Drill Down
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics / Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Admissions & Inflows */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Admissions &amp; Enquiries
              </h3>
              <p className="text-xs text-slate-500">
                6-Month Trend across Academic Year 2025-26
              </p>
            </div>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800">
              Admission Season
            </span>
          </div>

          <div className="h-56 flex items-end gap-4 pt-4 px-2 border-b border-slate-100">
            {[
              { month: 'Apr', admissions: 110, enquiries: 180 },
              { month: 'May', admissions: 95, enquiries: 145 },
              { month: 'Jun', admissions: 52, enquiries: 85 },
              { month: 'Jul', admissions: 42, enquiries: 65 },
              { month: 'Aug', admissions: 38, enquiries: 55 },
              { month: 'Sep', admissions: 28, enquiries: 48 },
            ].map((m) => (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
              >
                <div className="w-full flex items-end justify-center gap-1 h-44">
                  {/* Admissions Bar */}
                  <div
                    style={{ height: `${(m.admissions / 200) * 100}%` }}
                    className="w-1/2 bg-blue-900 rounded-t-sm transition-all group-hover:bg-blue-800 relative"
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.2 rounded font-bold transition">
                      {m.admissions}
                    </span>
                  </div>
                  {/* Enquiries Bar */}
                  <div
                    style={{ height: `${(m.enquiries / 200) * 100}%` }}
                    className="w-1/2 bg-amber-400 rounded-t-sm transition-all group-hover:bg-amber-300 relative"
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.2 rounded font-bold transition">
                      {m.enquiries}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-600">
                  {m.month}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-blue-900" />
              <span className="text-slate-600 font-medium">
                Confirmed Admissions
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-amber-400" />
              <span className="text-slate-600 font-medium">
                Walk-in &amp; Online Leads
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue & Collection Realization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Revenue &amp; Collection (₹ Lakhs)
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled vs Realized tuition payments
              </p>
            </div>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Avg: 88.5% Realized
            </span>
          </div>

          <div className="h-56 flex items-end gap-4 pt-4 px-2 border-b border-slate-100">
            {[
              { month: 'Apr', scheduled: 42, collected: 39 },
              { month: 'May', scheduled: 38, collected: 36 },
              { month: 'Jun', scheduled: 34, collected: 30 },
              { month: 'Jul', scheduled: 32, collected: 29 },
              { month: 'Aug', scheduled: 35, collected: 31 },
              { month: 'Sep', scheduled: 40, collected: 36.6 },
            ].map((m) => (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
              >
                <div className="w-full flex items-end justify-center gap-1 h-44">
                  {/* Scheduled Bar */}
                  <div
                    style={{ height: `${(m.scheduled / 50) * 100}%` }}
                    className="w-1/2 bg-slate-300 rounded-t-sm transition-all relative"
                  />
                  {/* Collected Bar */}
                  <div
                    style={{ height: `${(m.collected / 50) * 100}%` }}
                    className="w-1/2 bg-emerald-700 rounded-t-sm transition-all group-hover:bg-emerald-600 relative"
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.2 rounded font-bold transition">
                      ₹{m.collected}L
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-600">
                  {m.month}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-slate-300" />
              <span className="text-slate-600 font-medium">Scheduled Dues</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-emerald-700" />
              <span className="text-slate-600 font-medium">
                Realized Collections
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
