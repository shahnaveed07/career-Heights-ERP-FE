import { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  Send,
  X,
  AlertCircle,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { generateNextTransactionRef } from '../utils/idGenerators';
export const FeesAccountsView = () => {
  const { students, feeReceipts, recordFeePayment, branches } = useErpData();
  const { activeBranchFilter, setActiveBranchFilter, uiMode, can } = useAuth();
  const canEditFees = uiMode !== 'view' && can('fees', 'edit');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(
    activeBranchFilter === 'all' ? 'all' : activeBranchFilter
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState(null);
  useEffect(() => {
    setSelectedBranch(activeBranchFilter);
  }, [activeBranchFilter]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState(
    students.find((s) => s.feesPending > 0)?.id || students[0]?.id || ''
  );
  const [paymentAmount, setPaymentAmount] = useState(25e3);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentNotes, setPaymentNotes] = useState(
    'Second installment tuition fee'
  );
  const [modalError, setModalError] = useState(null);
  const [receiptToPrint, setReceiptToPrint] = useState(null);
  const filteredStudents = students.filter((s) => {
    const searchMatch =
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentCode || s.studentId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm);
    const branchMatch =
      selectedBranch === 'all' || s.branchId === selectedBranch;
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'overdue' && s.feesOverdue > 0) ||
      (statusFilter === 'pending' &&
        s.feesPending > 0 &&
        s.feesOverdue === 0) ||
      (statusFilter === 'cleared' && s.feesPending === 0);
    return searchMatch && branchMatch && statusMatch;
  });
  const branchScopedStudents =
    selectedBranch === 'all'
      ? students
      : students.filter((s) => s.branchId === selectedBranch);
  const totalBilled = branchScopedStudents.reduce(
    (acc, s) => acc + s.feesTotal,
    0
  );
  const totalCollected = branchScopedStudents.reduce(
    (acc, s) => acc + s.feesPaid,
    0
  );
  const totalPending = branchScopedStudents.reduce(
    (acc, s) => acc + s.feesPending,
    0
  );
  const totalOverdue = branchScopedStudents.reduce(
    (acc, s) => acc + s.feesOverdue,
    0
  );
  const recoveryRate =
    totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0';
  const openRecordPaymentModal = (studentId) => {
    let candidate = studentId
      ? students.find((s) => s.id === studentId)
      : void 0;
    if (!candidate) {
      candidate =
        branchScopedStudents.find((s) => s.feesPending > 0) ||
        students.find((s) => s.feesPending > 0) ||
        students[0];
    }
    if (candidate) {
      setTargetStudentId(candidate.id);
      setPaymentAmount(
        candidate.feesPending > 0 ? Math.min(25e3, candidate.feesPending) : 0
      );
    }
    setModalError(null);
    setShowPayModal(true);
  };
  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    setModalError(null);
    if (!targetStudentId) {
      setModalError('Please select a student.');
      return;
    }
    const currentStudent = students.find((s) => s.id === targetStudentId);
    if (!currentStudent) {
      setModalError('Selected student was not found.');
      return;
    }
    if (currentStudent.feesPending <= 0) {
      setModalError(
        `Student ${currentStudent.name} has no outstanding balance (\u20B90 due). Account is already cleared.`
      );
      return;
    }
    if (paymentAmount <= 0) {
      setModalError('Payment amount must be greater than \u20B90.');
      return;
    }
    if (paymentAmount > currentStudent.feesPending) {
      setModalError(
        `Payment amount (\u20B9${paymentAmount.toLocaleString()}) cannot exceed the outstanding balance of \u20B9${currentStudent.feesPending.toLocaleString()}.`
      );
      return;
    }
    try {
      const createdReceipt = recordFeePayment({
        studentId: targetStudentId,
        amount: Number(paymentAmount),
        paymentMethod,
        transactionRef: generateNextTransactionRef(feeReceipts),
        notes: paymentNotes,
      });
      setShowPayModal(false);
      setModalError(null);
      if (createdReceipt) {
        setReceiptToPrint(createdReceipt);
        setActionMessage(
          `Receipt ${createdReceipt.receiptNo} generated successfully for \u20B9${createdReceipt.amount.toLocaleString()}.`
        );
        setTimeout(() => setActionMessage(null), 5e3);
      }
    } catch (err) {
      setModalError(err.message || 'Failed to record fee payment.');
    }
  };
  const handleTriggerDueReminders = () => {
    const overdueList = branchScopedStudents.filter((s) => s.feesOverdue > 0);
    setActionMessage(
      `Automated SMS fee reminders successfully sent to parents of ${overdueList.length} students with overdue accounts.`
    );
    setTimeout(() => setActionMessage(null), 5e3);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider">
              Finance &amp; Accounts Ledger
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Fees Management &amp; Official Receipts
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Multi-branch fee reconciliation, installment schedules, and GST
            receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerDueReminders}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>
              Remind Overdue (
              {branchScopedStudents.filter((s) => s.feesOverdue > 0).length})
            </span>
          </button>

          {canEditFees ? (
            <button
              onClick={() => openRecordPaymentModal()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Record Payment</span>
            </button>
          ) : (
            <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500">
              Payment Locked (View Mode)
            </span>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Financial KPIs Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            Total Course Fee Billing
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900">
            ₹{(totalBilled / 1e5).toFixed(2)}L
          </div>
          <span className="text-[10px] text-slate-400">
            Total contracted fee pool
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800">
            Total Collected
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-900">
            ₹{(totalCollected / 1e5).toFixed(2)}L
          </div>
          <span className="text-[10px] font-bold text-emerald-700">
            Realized: {recoveryRate}%
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            Scheduled Balance
          </span>
          <div className="mt-1 text-2xl font-black text-slate-800">
            ₹{(totalPending / 1e5).toFixed(2)}L
          </div>
          <span className="text-[10px] text-slate-400">
            Future installments
          </span>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-red-800">
            Overdue Recovery Queue
          </span>
          <div className="mt-1 text-2xl font-black text-red-900">
            ₹{(totalOverdue / 1e5).toFixed(2)}L
          </div>
          <span className="text-[10px] font-bold text-red-700">
            Past due date
          </span>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, roll number, parent mobile..."
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => {
              const newBranch = e.target.value;
              setSelectedBranch(newBranch);
              setActiveBranchFilter(newBranch);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Fee Accounts</option>
            <option value="overdue">Overdue Accounts Only</option>
            <option value="pending">Pending Balance</option>
            <option value="cleared">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Accounts Directory Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 text-left">Student Profile</th>
                <th className="py-3 px-4 text-left">Branch &amp; Batch</th>
                <th className="py-3 px-4 text-left">Scholarship / Waiver</th>
                <th className="py-3 px-4 text-right">Total Fee</th>
                <th className="py-3 px-4 text-right">Paid to Date</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No student fee accounts found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.slice(0, 15).map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar
                          photo={student.photo || student.avatar}
                          name={student.name}
                          size="sm"
                        />
                        <div>
                          <p className="font-bold text-slate-900">
                            {student.name}
                          </p>
                          <p className="font-mono text-[10px] text-blue-900">
                            {student.studentCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {student.branchName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {student.batchName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${student.scholarshipPercent > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {student.scholarshipPercent}% CHTQ Merit
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      ₹{student.feesTotal.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      ₹{student.feesPaid.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {student.feesPending === 0 ? (
                        <span className="text-emerald-700 font-bold">NIL</span>
                      ) : student.feesOverdue > 0 ? (
                        <span className="text-red-700 font-black">
                          ₹{student.feesOverdue.toLocaleString()} (Overdue)
                        </span>
                      ) : (
                        <span className="text-slate-800 font-semibold">
                          ₹{student.feesPending.toLocaleString()}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${student.feesPending === 0 ? 'bg-emerald-100 text-emerald-800' : student.feesOverdue > 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}
                      >
                        {student.feesPending === 0
                          ? 'CLEARED'
                          : student.feesOverdue > 0
                            ? 'OVERDUE'
                            : 'ON SCHEDULE'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {student.feesPending === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Settled
                          </span>
                        ) : (
                          <button
                            onClick={() => openRecordPaymentModal(student.id)}
                            className="rounded-lg bg-blue-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-800 transition shadow-2xs"
                          >
                            Collect Fee
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Fee Receipts Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Recent Computerized Fee Receipts
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Official receipts signed with institute transaction stamp
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4 text-left">Receipt No</th>
                <th className="py-2.5 px-4 text-left">Student Name</th>
                <th className="py-2.5 px-4 text-left">Payment Mode</th>
                <th className="py-2.5 px-4 text-left">Date</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feeReceipts
                .filter((rcpt) => {
                  if (selectedBranch === 'all') return true;
                  const st = students.find((s) => s.id === rcpt.studentId);
                  return st ? st.branchId === selectedBranch : true;
                })
                .map((rcpt) => (
                  <tr key={rcpt.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-900">
                      {rcpt.receiptNo}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {rcpt.studentName}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {rcpt.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{rcpt.date}</td>
                    <td className="py-2.5 px-4 text-right font-black text-emerald-800">
                      ₹{rcpt.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => setReceiptToPrint(rcpt)}
                        className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Printer className="h-3 w-3" />
                        <span>Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Fee Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-900" />
                <span>Collect Tuition Fee Payment</span>
              </h3>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const targetStudent = students.find(
                (s) => s.id === targetStudentId
              );
              const isSettled =
                !targetStudent || targetStudent.feesPending <= 0;
              const hasInvalidAmount =
                !targetStudent ||
                paymentAmount <= 0 ||
                paymentAmount > targetStudent.feesPending;
              return (
                <form
                  onSubmit={handleRecordPaymentSubmit}
                  className="mt-4 space-y-3.5 text-xs"
                >
                  {modalError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs font-semibold text-red-800">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                      <span>{modalError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Select Student *
                    </label>
                    <select
                      value={targetStudentId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setTargetStudentId(newId);
                        const sel = students.find((s) => s.id === newId);
                        if (sel) {
                          setPaymentAmount(
                            sel.feesPending > 0
                              ? Math.min(25e3, sel.feesPending)
                              : 0
                          );
                        }
                        setModalError(null);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.studentCode || s.studentId}) —{' '}
                          {s.feesPending === 0
                            ? '\u2713 Fully Cleared (\u20B90 Due)'
                            : `Due: \u20B9${s.feesPending.toLocaleString()}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {targetStudent && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${targetStudent.feesPending === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : targetStudent.feesOverdue > 0 ? 'bg-red-50 border-red-200 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                    >
                      <div>
                        <p className="font-bold">
                          {targetStudent.name} • {targetStudent.branchName}
                        </p>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          Total: ₹{targetStudent.feesTotal.toLocaleString()} |
                          Paid: ₹{targetStudent.feesPaid.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                          Outstanding Due
                        </span>
                        <span className="text-sm font-black">
                          ₹{targetStudent.feesPending.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {isSettled && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        This student has no outstanding fees. Their tuition
                        account is completely settled.
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">
                        Payment Amount (INR ₹) *
                      </label>
                      {targetStudent && targetStudent.feesPending > 0 && (
                        <span className="text-[11px] text-slate-500">
                          Max: ₹{targetStudent.feesPending.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      disabled={isSettled}
                      min="1"
                      max={targetStudent?.feesPending || 0}
                      value={paymentAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPaymentAmount(val);
                        if (targetStudent && val > targetStudent.feesPending) {
                          setModalError(
                            `Amount exceeds outstanding balance of \u20B9${targetStudent.feesPending.toLocaleString()}`
                          );
                        } else {
                          setModalError(null);
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-sm font-bold text-slate-900 ${isSettled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'border-slate-300 focus:outline-hidden focus:border-blue-900'}`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Cash">Cash in Hand</option>
                      <option value="Net Banking">Net Banking / NEFT</option>
                      <option value="Cheque">Bank Cheque</option>
                      <option value="Card">Debit / Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Transaction Remarks
                    </label>
                    <input
                      type="text"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Installment 2 tuition fee..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowPayModal(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSettled || hasInvalidAmount}
                      className="rounded-lg bg-blue-900 px-5 py-2 font-bold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Confirm &amp; Issue Receipt
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL FEE RECEIPT MODAL */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-300 relative">
            {/* Top Close & Print Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-600">
                Official Computerized Cash Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setReceiptToPrint(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Official Receipt Content */}
            <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50/40 space-y-4">
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white font-black text-lg mb-1">
                  CH
                </div>
                <h2 className="text-base font-black tracking-tight text-slate-900">
                  CAREER HEIGHTS
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  CENTRALIZED MULTI-BRANCH EDUCATION ERP
                </p>
                <p className="text-[10px] text-slate-400">
                  Head Office: Main Chowk, Handwara, J&amp;K | Reg: CH-EDU-2021
                </p>
              </div>

              {/* Receipt Metadata */}
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

              {/* Student Details Grid */}
              <div className="rounded-lg bg-white p-3 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <strong className="text-slate-900">
                    {receiptToPrint.studentName}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Roll / Code:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {receiptToPrint.studentCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-bold text-slate-800">
                    {receiptToPrint.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono text-slate-700">
                    {receiptToPrint.transactionRef}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remarks:</span>
                  <span className="text-slate-600 italic">
                    {receiptToPrint.notes || 'Tuition Fee Payment'}
                  </span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Amount Received
                </span>
                <p className="text-2xl font-black text-emerald-900">
                  ₹{receiptToPrint.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-700">
                  Official Computer-Generated Acknowledgment
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-4 flex justify-between items-end text-[10px] text-slate-400">
                <div>
                  <p>Cashier / Authorized Signatory</p>
                  <p className="font-semibold text-slate-700">
                    {receiptToPrint.receivedBy}
                  </p>
                </div>
                <div className="text-right">
                  <p className="border-t border-slate-300 pt-1 font-semibold text-slate-600">
                    Seal of Career Heights
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
