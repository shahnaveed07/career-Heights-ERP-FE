import { useState } from 'react';
import {
  CalendarCheck,
  Award,
  CreditCard,
  HelpCircle,
  Send,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Download,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useErpData } from '../context/ErpDataContext';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { INSTITUTE_CONFIG } from '../config/instituteConfig';
import { generateNextTransactionRef } from '../utils/idGenerators';
import {
  getStudentEnrolledSubjects,
  CANONICAL_SUBJECTS,
} from '../utils/academicModel';

export const StudentPortalView = () => {
  const { currentUser } = useAuth();
  const {
    students,
    testResults,
    tests,
    timetable,
    homework,
    attendanceRecords,
    submitDoubt,
    doubts,
    feePayments,
    feeReceipts,
    recordFeePayment,
    getStudentFeeDetails,
  } = useErpData();

  const student =
    students.find((s) => s.id === currentUser?.linkedStudentId) ||
    (currentUser?.role === 'student' ? students.find((s) => s.email === currentUser?.email) : null) ||
    students[0];

  const myResults = testResults.filter((r) => r.studentId === student?.id);
  const myDoubts = doubts.filter(
    (d) => d.studentId === student?.id || d.studentName === student?.name
  );
  const myAttendance = (attendanceRecords || []).filter((r) => r.studentId === student?.id);
  const mySchedule = (timetable || []).filter((t) => !t.batchId || t.batchId === student?.batchId);
  const myNotes = (homework || []).filter((h) => !h.batchId || h.batchId === student?.batchId);
  const myExams = (tests || []).filter((t) => !t.batchId || t.batchId === student?.batchId || t.classId === student?.classId);
  const enrolledSubjects = student ? getStudentEnrolledSubjects(student, CANONICAL_SUBJECTS) : [];

  // Strictly student-scoped fee data
  const feeDetails = student ? getStudentFeeDetails(student.id) : null;
  const myPayments = feeDetails?.payments || [];
  const myReceipts = feeDetails?.receipts || [];
  const myInstallments = feeDetails?.installments || [];

  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'fees'
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtSubject, setDoubtSubject] = useState('Physics');
  const [doubtSuccess, setDoubtSuccess] = useState(false);

  // Online Mock Payment Simulation State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(
    feeDetails?.pending > 0 ? Math.min(25000, feeDetails.pending) : 0
  );
  const [payMethod, setPayMethod] = useState('UPI');
  const [selectedInstallment, setSelectedInstallment] = useState(
    myInstallments.find((i) => i.status !== 'Paid')?.name || 'Tuition Fee Installment'
  );
  const [mockCardNumber, setMockCardNumber] = useState('4532 •••• •••• 8910');
  const [mockUpiId, setMockUpiId] = useState(`${student?.email?.split('@')[0] || 'student'}@okhdfcbank`);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [payError, setPayError] = useState(null);
  const [receiptToPrint, setReceiptToPrint] = useState(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState(null);

  const handleAskDoubt = (e) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;
    submitDoubt({
      subject: doubtSubject,
      question: doubtQuestion,
    });
    setDoubtQuestion('');
    setDoubtSuccess(true);
    setTimeout(() => setDoubtSuccess(false), 3000);
  };

  const handleOpenPayModal = () => {
    if (!student || student.feesPending <= 0) return;
    const unpaidInst = myInstallments.find((i) => i.status !== 'Paid');
    setSelectedInstallment(unpaidInst ? unpaidInst.name : 'Tuition Fee Installment');
    setPayAmount(unpaidInst ? Math.min(unpaidInst.remainingAmount, student.feesPending) : student.feesPending);
    setPayError(null);
    setShowPayModal(true);
  };

  const handleSimulatePaymentSubmit = (e) => {
    e.preventDefault();
    setPayError(null);
    const numAmount = Number(payAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setPayError('Please enter a valid payment amount greater than ₹0.');
      return;
    }
    if (numAmount > student.feesPending) {
      setPayError(
        `Amount cannot exceed total outstanding pending fees of ₹${student.feesPending.toLocaleString()}.`
      );
      return;
    }

    setIsProcessingPay(true);
    // Simulate network latency for realistic demo experience
    setTimeout(() => {
      try {
        const mockRef =
          payMethod === 'UPI'
            ? `UPI-MOCK-${Date.now().toString().slice(-6)}`
            : payMethod === 'Card'
            ? `CRD-MOCK-${Date.now().toString().slice(-6)}`
            : generateNextTransactionRef(payMethod, feePayments, feeReceipts);

        const createdReceipt = recordFeePayment({
          studentId: student.id,
          amount: numAmount,
          paymentMethod: payMethod,
          transactionRef: mockRef,
          installment: selectedInstallment,
          notes: `Online portal payment by ${student.name} (${selectedInstallment})`,
        });

        setIsProcessingPay(false);
        setShowPayModal(false);
        setPaySuccessMsg(
          `Demo action recorded locally: Payment of ₹${numAmount.toLocaleString()} recorded. Receipt ${createdReceipt.receiptNo} generated in local state.`
        );
        setTimeout(() => setPaySuccessMsg(null), 6000);
        setReceiptToPrint(createdReceipt);
      } catch (err) {
        setIsProcessingPay(false);
        setPayError(err.message || 'Payment simulation failed.');
      }
    }, 1200);
  };

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        Student record not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Identity Card Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <StudentAvatar
              photo={student.photo || student.avatar}
              name={student.name}
              size="xl"
              className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Student Portal
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Attendance: {student.attendanceRate}%
                </span>
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight">
                {student.name}
              </h1>
              <p className="text-xs text-blue-200">
                Roll:{' '}
                <span className="font-mono font-bold text-white">
                  {student.studentCode || student.studentId}
                </span>{' '}
                • Class: <strong className="text-white">{student.className}</strong> • Wing: <strong className="text-white">{student.wingName || 'Medical'}</strong> • Batch: <strong className="text-white">{student.batchName}</strong> • {student.branchName}
              </p>
              {/* Enrolled Subjects Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-blue-300 font-semibold uppercase">Enrolled Subjects:</span>
                {enrolledSubjects.map((sub) => (
                  <span
                    key={sub.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white/15 text-white backdrop-blur-xs border border-white/20"
                  >
                    {sub.name} ({sub.code || sub.id})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-xs">
              <span className="block text-[10px] text-blue-200">
                CHTQ Merit Scholarship
              </span>
              <span className="text-xl font-black text-amber-300">
                {student.scholarshipPercent}%
              </span>
            </div>
            <div
              onClick={() => setActiveTab('fees')}
              className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-xs cursor-pointer hover:bg-white/20 transition"
              title="Click to view fee breakdown"
            >
              <span className="block text-[10px] text-blue-200">
                Outstanding Balance
              </span>
              <span className="text-xl font-black text-white">
                {student.feesPending === 0
                  ? 'NIL'
                  : `₹${(student.feesPending / 1e3).toFixed(1)}k`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {paySuccessMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{paySuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Biometric Attendance
            </span>
            <CalendarCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {student.attendanceRate}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Verified campus RFID attendance
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Latest Test Rank
            </span>
            <Award className="h-5 w-5 text-blue-900" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-900">
            AIR #{myResults[0]?.instituteRank || 1}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Score: {myResults[0]?.totalMarksObtained || 284} /{' '}
            {myResults[0]?.totalMaxMarks || 300} (
            {myResults[0]?.percentile || 99.4}th %ile)
          </p>
        </div>

        <div
          onClick={() => setActiveTab('fees')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer hover:border-blue-900 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Tuition Fee Account
            </span>
            <CreditCard className="h-5 w-5 text-indigo-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {student.feesPending === 0 ? (
              <span className="text-emerald-700">Fully Cleared</span>
            ) : (
              <span>₹{student.feesPending.toLocaleString()} Due</span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Paid: ₹{student.feesPaid.toLocaleString()}</span>
            <span className="font-semibold text-blue-900 flex items-center gap-0.5">
              View History <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 space-x-1 sm:space-x-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('academic')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'academic'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Exams &amp; Results</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          <span>Biometric Attendance ({myAttendance.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Class Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'notes'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Notes &amp; DPP ({myNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'fees'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Tuition Fees &amp; Receipts ({myReceipts.length})</span>
        </button>
      </div>

      {activeTab === 'academic' && (
        /* ACADEMIC & DOUBTS TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Test Performance Table */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  My Mock Test Scores &amp; OMR Evaluation
                </h3>
                <span className="text-xs text-blue-900 font-bold">
                  Career Heights Assessment Series
                </span>
              </div>

              <div className="space-y-3">
                {myResults.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No mock test records recorded yet.
                  </p>
                ) : (
                  myResults.map((res) => (
                    <div
                      key={res.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {res.testTitle}
                          </h4>
                          <p className="text-slate-500 text-[11px]">
                            {res.testDate} • All-India Pattern
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-800">
                          Rank #{res.instituteRank}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-y border-slate-200 text-xs">
                        <span>
                          Marks:{' '}
                          <strong>
                            {res.totalMarksObtained} / {res.totalMaxMarks}
                          </strong>
                        </span>
                        <span>
                          Percentile:{' '}
                          <strong className="text-blue-900">
                            {res.percentile}%
                          </strong>
                        </span>
                        <span>
                          Batch Rank: <strong>#{res.batchRank}</strong>
                        </span>
                      </div>

                      {res.weakTopics?.length > 0 && (
                        <div className="text-[11px]">
                          <span className="text-slate-500 font-semibold">
                            Focus Areas Identified:{' '}
                          </span>
                          <span className="text-red-700 font-medium">
                            {res.weakTopics.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's Lectures */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Today's Class Schedule ({student.batchName})
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="font-bold text-blue-900">
                    08:30 - 10:00 AM
                  </span>
                  <span className="font-bold text-slate-800">
                    Physics: Electrodynamics
                  </span>
                  <span className="text-slate-500">Hall 1 • Dr. Rahul Sharma</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-200 bg-blue-50/30">
                  <span className="font-bold text-blue-900">
                    10:15 - 11:45 AM
                  </span>
                  <span className="font-bold text-slate-800">
                    Chemistry: Thermodynamics
                  </span>
                  <span className="text-slate-500">Room 3 • Sana Mir</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="font-bold text-blue-900">
                    01:00 - 02:30 PM
                  </span>
                  <span className="font-bold text-slate-800">
                    DPP Doubt Problem Clinic
                  </span>
                  <span className="text-slate-500">Doubt Lab</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ask Doubt + Doubts History */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-blue-900" />
                <span>Ask Subject Faculty a Doubt</span>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Direct line to faculty. Answers will appear below with steps.
              </p>

              {doubtSuccess && (
                <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-800">
                  Doubt dispatched to faculty desk!
                </div>
              )}

              <form onSubmit={handleAskDoubt} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={doubtSubject}
                    onChange={(e) => setDoubtSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Describe Question
                  </label>
                  <textarea
                    rows={3}
                    value={doubtQuestion}
                    onChange={(e) => setDoubtQuestion(e.target.value)}
                    placeholder="Explain step where you get stuck..."
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-900 py-2 text-xs font-bold text-white hover:bg-blue-800 flex items-center justify-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Doubt</span>
                </button>
              </form>
            </div>

            {/* Doubt History */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                My Questions &amp; Answers
              </h3>
              {myDoubts.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  You haven't submitted any doubts yet.
                </p>
              ) : (
                myDoubts.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-lg border border-slate-200 p-3 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-900">{d.subject}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          d.status === 'answered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">"{d.question}"</p>
                    {d.status === 'answered' && (
                      <div className="bg-emerald-50/50 p-2 rounded text-[11px] text-emerald-950 border border-emerald-100">
                        <strong>Ans ({d.answeredBy}):</strong> {d.answer}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. BIOMETRIC ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Attendance Regularity</span>
              <div className="mt-1 text-2xl font-black text-emerald-800">{student.attendanceRate}%</div>
              <span className="text-[10px] text-slate-400">RFID Campus Scanner</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Days Logged</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{myAttendance.length > 0 ? myAttendance.length : 88}</div>
              <span className="text-[10px] text-slate-400">Total Recorded Sessions</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Present Sessions</span>
              <div className="mt-1 text-2xl font-black text-emerald-700">
                {myAttendance.filter(r => r.status === 'present' || r.status === 'late').length || 82}
              </div>
              <span className="text-[10px] text-emerald-600">Compliant (&gt;75% required)</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Absences Logged</span>
              <div className="mt-1 text-2xl font-black text-red-700">
                {myAttendance.filter(r => r.status === 'absent').length || 6}
              </div>
              <span className="text-[10px] text-slate-400">Automated Parent Alerts</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="border-b border-slate-200 px-5 py-3.5 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                My Verified RFID &amp; Classroom Punch Logs
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Student ID: {student.studentCode || student.studentId}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Session / Lecture</th>
                    <th className="py-2.5 px-4">Time Recorded</th>
                    <th className="py-2.5 px-4">Marked By</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        Regular attendance recorded at 98.4%. Daily logs will appear here upon morning RFID tap.
                      </td>
                    </tr>
                  ) : (
                    myAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-900">{rec.date}</td>
                        <td className="py-2.5 px-4 text-slate-700">{rec.session || 'Morning Lecture'}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{rec.checkInTime || '08:30 AM'}</td>
                        <td className="py-2.5 px-4 text-slate-500">{rec.markedBy || 'Campus RFID'}</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. CLASS SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Weekly Class Routine ({student.batchName})
                </h3>
                <p className="text-xs text-slate-500">
                  Standard instructional timetable for Class {student.className} • {student.branchName} Campus
                </p>
              </div>
              <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-900">
                {student.batchName} Roster
              </span>
            </div>

            <div className="space-y-3">
              {mySchedule.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center">
                  No classes scheduled for this batch today.
                </div>
              ) : (
                mySchedule.map((tt) => (
                  <div
                    key={tt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/80 gap-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1.5 rounded-lg bg-blue-900 text-white font-mono font-bold text-[11px] text-center min-w-[110px]">
                        {tt.startTime} - {tt.endTime}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{tt.subject}: {tt.topicTitle}</h4>
                        <p className="text-[11px] text-slate-500">
                          {tt.facultyName} • Room {tt.roomNumber} • {tt.dayOfWeek}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 self-start sm:self-auto">
                      Hall Lecture
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. NOTES & DPP TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daily Practice Problems (DPP) &amp; Revision Notes
                </h3>
                <p className="text-xs text-slate-500">
                  Instructional modules, assignments &amp; study materials for {student.batchName}
                </p>
              </div>
              <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                {myNotes.length} Modules Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myNotes.length === 0 ? (
                <div className="col-span-2 py-6 text-center text-slate-400 text-xs">
                  No DPP modules published yet.
                </div>
              ) : (
                myNotes.map((hw) => (
                  <div
                    key={hw.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition text-xs space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="rounded bg-blue-100 text-blue-900 px-2 py-0.5 text-[10px] font-bold">
                        {hw.subject}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Due: {hw.dueDate || '2026-09-30'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{hw.title}</h4>
                    <p className="text-slate-600 text-[11px] line-clamp-2">
                      {hw.description || 'Comprehensive conceptual problem set for home revision.'}
                    </p>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">Batch: {student.batchName}</span>
                      <span className="text-blue-900 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                        <Download className="h-3 w-3" /> Download Material
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TUITION FEES, INSTALLMENTS & RECEIPTS TAB */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* Fee Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">
                Contracted Course Fee
              </span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                ₹{student.feesTotal.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">
                Merit adjustment: {student.scholarshipPercent}%
              </span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-800">
                Total Paid to Date
              </span>
              <div className="mt-1 text-2xl font-black text-emerald-900">
                ₹{student.feesPaid.toLocaleString()}
              </div>
              <span className="text-[10px] font-bold text-emerald-700">
                {((student.feesPaid / student.feesTotal) * 100).toFixed(1)}% Settled
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">
                Outstanding Balance
              </span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {student.feesPending === 0 ? (
                  <span className="text-emerald-700">NIL</span>
                ) : (
                  <span>₹{student.feesPending.toLocaleString()}</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                {student.feesPending === 0 ? 'No due balance' : 'Remaining balance'}
              </span>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-blue-900">
                  Online Payment Action
                </span>
                <p className="text-[10px] text-blue-700 mt-0.5">
                  Demo Simulated Gateway
                </p>
              </div>
              {student.feesPending > 0 ? (
                <button
                  onClick={handleOpenPayModal}
                  className="mt-2 w-full rounded-lg bg-blue-900 py-1.5 px-3 text-xs font-bold text-white hover:bg-blue-800 transition shadow-2xs text-center"
                >
                  Pay Online (Demo)
                </button>
              ) : (
                <span className="mt-2 block rounded-md bg-emerald-100 py-1 text-center text-xs font-bold text-emerald-800">
                  Fully Cleared
                </span>
              )}
            </div>
          </div>

          {/* Installment Breakdown Schedule */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Course Fee Installment Schedule
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Scheduled installment dates, allocated payments, and current status.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {myInstallments.map((inst) => (
                <div
                  key={inst.installmentNumber}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    inst.status === 'Paid'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : inst.status === 'Overdue'
                      ? 'border-red-200 bg-red-50/40'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">
                      Installment {inst.installmentNumber}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                        inst.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inst.status === 'Partial'
                          ? 'bg-blue-100 text-blue-800'
                          : inst.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inst.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium">{inst.name}</p>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-baseline">
                    <span className="text-slate-500 text-[11px]">Due Amount:</span>
                    <span className="font-black text-slate-900 text-sm">
                      ₹{inst.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Paid: ₹{inst.paidAmount.toLocaleString()}</span>
                    <span>Due: {inst.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Payment History Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              My Payment Transaction Records ({myPayments.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All payment submissions credited to student account {student.studentCode || student.studentId}.
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Payment ID</th>
                    <th className="py-2.5 px-4 text-left">Date</th>
                    <th className="py-2.5 px-4 text-left">Installment / Component</th>
                    <th className="py-2.5 px-4 text-left">Method</th>
                    <th className="py-2.5 px-4 text-left">Reference ID</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No payment records logged yet.
                      </td>
                    </tr>
                  ) : (
                    myPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-900">
                          {pay.id}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{pay.date}</td>
                        <td className="py-2.5 px-4 text-slate-800 font-medium">
                          {pay.installment || pay.feeComponent}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {pay.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px]">
                          {pay.transactionRef}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-emerald-800">
                          ₹{pay.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block rounded px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            {pay.status || 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Fee Receipts Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Fee Receipts ({myReceipts.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Computer-generated receipts belonging exclusively to your account.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Receipt No</th>
                    <th className="py-2.5 px-4 text-left">Date</th>
                    <th className="py-2.5 px-4 text-left">Linked Payment</th>
                    <th className="py-2.5 px-4 text-left">Payment Mode</th>
                    <th className="py-2.5 px-4 text-left">Received By</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No receipts generated in this session yet.
                      </td>
                    </tr>
                  ) : (
                    myReceipts.map((rcpt) => (
                      <tr key={rcpt.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-900">
                          {rcpt.receiptNo}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{rcpt.date}</td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                          {rcpt.paymentId || 'pay-ref'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {rcpt.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {rcpt.receivedBy || 'Accounts Desk'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-emerald-800">
                          ₹{rcpt.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => setReceiptToPrint(rcpt)}
                            className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                          >
                            <Printer className="h-3 w-3 text-slate-500" />
                            <span>View / Print Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ONLINE PAYMENT DEMO MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-900" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Student Online Fee Payment
                  </h3>
                  <span className="inline-block rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 uppercase">
                    Frontend Demo Simulation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSimulatePaymentSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-3 text-[11px] text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                  <span>Demo Gateway Simulator</span>
                </p>
                <p className="text-[10px] text-blue-700">
                  This mock service records the payment in local state and generates a receipt for verification. No real charge will occur.
                </p>
              </div>

              {payError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs font-semibold text-red-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{payError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Installment
                </label>
                <select
                  value={selectedInstallment}
                  onChange={(e) => {
                    const sel = e.target.value;
                    setSelectedInstallment(sel);
                    const inst = myInstallments.find((i) => i.name === sel);
                    if (inst) {
                      setPayAmount(Math.min(inst.remainingAmount > 0 ? inst.remainingAmount : inst.amount, student.feesPending));
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  {myInstallments.map((inst) => (
                    <option key={inst.installmentNumber} value={inst.name}>
                      {inst.name} — Due: ₹{inst.remainingAmount.toLocaleString()} ({inst.status})
                    </option>
                  ))}
                  <option value="Custom Installment Payment">Custom Installment Payment</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">
                    Payment Amount (INR ₹) *
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Max: ₹{student.feesPending.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={student.feesPending}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  <option value="UPI">UPI / QR Simulation</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Bank Transfer / NEFT">Net Banking / NEFT</option>
                </select>
              </div>

              {payMethod === 'UPI' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Virtual Payment Address (VPA)
                  </label>
                  <input
                    type="text"
                    value={mockUpiId}
                    onChange={(e) => setMockUpiId(e.target.value)}
                    placeholder="student@okhdfcbank"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </div>
              )}

              {payMethod === 'Card' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Card Number (Demo)
                  </label>
                  <input
                    type="text"
                    value={mockCardNumber}
                    onChange={(e) => setMockCardNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isProcessingPay}
                  onClick={() => setShowPayModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPay || payAmount <= 0}
                  className="rounded-lg bg-blue-900 px-5 py-2 font-bold text-white hover:bg-blue-800 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {isProcessingPay ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Simulating Checkout...</span>
                    </>
                  ) : (
                    <span>Pay ₹{Number(payAmount).toLocaleString()} (Demo)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE FEE RECEIPT MODAL */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-300 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-600">
                Fee Receipt Acknowledgment
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setReceiptToPrint(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white font-black text-lg mb-1">
                  CH
                </div>
                <h2 className="text-base font-black tracking-tight text-slate-900">
                  {INSTITUTE_CONFIG.name.toUpperCase()}
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  {receiptToPrint.branchName || 'Handwara'} Campus • {INSTITUTE_CONFIG.tagline}
                </p>
                <p className="text-[10px] text-slate-400">
                  Email: {INSTITUTE_CONFIG.contact.email} | Contact: {INSTITUTE_CONFIG.contact.phone}
                </p>
              </div>

              <div className="flex justify-between text-xs font-semibold py-1">
                <div>
                  <span className="text-slate-400">Receipt No: </span>
                  <span className="font-mono text-blue-900 font-bold">
                    {receiptToPrint.receiptNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Date: </span>
                  <span>{receiptToPrint.date}</span>
                </div>
              </div>

              <div className="rounded-lg bg-white p-3 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <strong className="text-slate-900">{receiptToPrint.studentName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Roll / Code:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {receiptToPrint.studentCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Linked Payment ID:</span>
                  <span className="font-mono text-slate-700">
                    {receiptToPrint.paymentId || 'pay-verified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee Component:</span>
                  <span className="font-semibold text-slate-800">
                    {receiptToPrint.installment || receiptToPrint.feeComponent || 'Tuition Fee Installment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-bold text-slate-800">{receiptToPrint.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Reference:</span>
                  <span className="font-mono text-slate-700">{receiptToPrint.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remarks:</span>
                  <span className="text-slate-600 italic">
                    {receiptToPrint.notes || 'Online Tuition Fee Payment'}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Amount Received
                </span>
                <p className="text-2xl font-black text-emerald-900">
                  ₹{receiptToPrint.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-700">
                  Computer-Generated Fee Acknowledgment
                </p>
              </div>

              <div className="pt-3 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <p className="text-slate-400">Authorized Signatory / Received By:</p>
                  <p className="font-semibold text-slate-800">{receiptToPrint.receivedBy || 'Accounts Desk'}</p>
                </div>
                <div className="text-right">
                  <p className="border-t border-slate-300 pt-1 font-semibold text-slate-700">
                    Career Heights Accounts Division
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
