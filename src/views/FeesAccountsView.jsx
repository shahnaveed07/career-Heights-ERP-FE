import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  Send,
  X,
  AlertCircle,
  Banknote,
  DollarSign,
  Users,
  Calendar,
  Building2,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { EmptyState } from '../components/common/EmptyState';
import { INSTITUTE_CONFIG } from '../config/instituteConfig';
import { generateNextTransactionRef, isTransactionRefDuplicate } from '../utils/idGenerators';

export const FeesAccountsView = ({ autoOpenPayment }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPaymentRoute = autoOpenPayment || location.pathname === '/fees/payments/new';

  const {
    students,
    scopedStudents,
    feeReceipts,
    scopedFees,
    feePayments,
    scopedPayments,
    recordFeePayment,
    salaries,
    scopedSalaries,
    payStaffSalary,
    branches,
    addParentNotification,
  } = useErpData();

  const { activeBranchFilter, setActiveBranchFilter, uiMode, can, currentUser } = useAuth();
  const canCollectFee = uiMode !== 'view' && (can('fees', 'collect_payment') || can('fees', 'edit'));
  const canSendReminders = uiMode !== 'view' && can('communication', 'add');
  const canEditFees = canCollectFee;
  const canManageSalaries =
    uiMode !== 'view' &&
    (can('fees', 'edit') ||
      can('hr', 'edit') ||
      currentUser?.role === 'super_admin' ||
      currentUser?.role === 'hq_admin' ||
      currentUser?.role === 'accountant_coordinator' ||
      currentUser?.role === 'branch_admin');

  const [activeTab, setActiveTab] = useState('fees'); // 'fees' | 'payroll'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(
    activeBranchFilter === 'all' ? 'all' : activeBranchFilter
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [salaryStatusFilter, setSalaryStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    setSelectedBranch(activeBranchFilter);
    const candidate = scopedStudents.find((s) => s.feesPending > 0) || scopedStudents[0];
    if (candidate) {
      setTargetStudentId(candidate.id);
    }
  }, [activeBranchFilter, scopedStudents]);

  const [showPayModal, setShowPayModal] = useState(isPaymentRoute);

  useEffect(() => {
    if (isPaymentRoute) {
      setShowPayModal(true);
    }
  }, [isPaymentRoute]);

  const handleClosePayModal = () => {
    setShowPayModal(false);
    if (location.pathname === '/fees/payments/new') {
      navigate('/fees');
    }
  };

  const [targetStudentId, setTargetStudentId] = useState(
    scopedStudents.find((s) => s.feesPending > 0)?.id || scopedStudents[0]?.id || ''
  );
  const [paymentAmount, setPaymentAmount] = useState(25000);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentInstallment, setPaymentInstallment] = useState('Term 2 Mid-Session Installment');
  const [customTransactionRef, setCustomTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('Tuition fee installment payment');
  const [modalError, setModalError] = useState(null);
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  // Salary Disbursement Modal State
  const [salaryToDisburse, setSalaryToDisburse] = useState(null);
  const [salaryDisburseMethod, setSalaryDisburseMethod] = useState('Direct Bank Transfer');
  const [salaryDisburseRef, setSalaryDisburseRef] = useState('');
  const [salaryDisburseNotes, setSalaryDisburseNotes] = useState('');
  const [salaryModalError, setSalaryModalError] = useState(null);

  const filteredStudents = scopedStudents.filter((s) => {
    const searchMatch =
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentCode || s.studentId || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (s.parentPhone || '').includes(searchTerm);
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

  const branchScopedStudents = scopedStudents;
  const totalBilled = branchScopedStudents.reduce((acc, s) => acc + (s.feesTotal || 0), 0);
  const totalCollected = branchScopedStudents.reduce((acc, s) => acc + (s.feesPaid || 0), 0);
  const totalPending = branchScopedStudents.reduce((acc, s) => acc + (s.feesPending || 0), 0);
  const totalOverdue = branchScopedStudents.reduce((acc, s) => acc + (s.feesOverdue || 0), 0);
  const recoveryRate =
    totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '0';

  // Salary KPIs (kept strictly separate from student fees)
  const branchScopedSalaries = scopedSalaries;
  const filteredSalaries = branchScopedSalaries.filter((sal) => {
    const searchMatch =
      !searchTerm ||
      sal.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sal.empCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sal.designation || '').toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch =
      salaryStatusFilter === 'all' || sal.status.toLowerCase() === salaryStatusFilter.toLowerCase();
    const branchMatch = selectedBranch === 'all' || sal.branchId === selectedBranch;
    return searchMatch && statusMatch && branchMatch;
  });

  const totalPayroll = branchScopedSalaries.reduce((acc, s) => acc + (s.netSalary || 0), 0);
  const totalDisbursedSalary = branchScopedSalaries
    .filter((s) => s.status === 'Paid')
    .reduce((acc, s) => acc + (s.netSalary || 0), 0);
  const totalPendingSalary = branchScopedSalaries
    .filter((s) => s.status === 'Pending')
    .reduce((acc, s) => acc + (s.netSalary || 0), 0);

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
        candidate.feesPending > 0 ? Math.min(25000, candidate.feesPending) : 0
      );
    }
    setCustomTransactionRef(generateNextTransactionRef(paymentMethod, feePayments, feeReceipts));
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
        `Student ${currentStudent.name} has no outstanding balance (₹0 due). Account is already cleared.`
      );
      return;
    }
    const numAmount = Number(paymentAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setModalError('Payment amount must be greater than ₹0.');
      return;
    }
    if (numAmount > currentStudent.feesPending) {
      setModalError(
        `Payment amount (₹${numAmount.toLocaleString()}) cannot exceed the outstanding balance of ₹${currentStudent.feesPending.toLocaleString()}.`
      );
      return;
    }

    // Duplicate transaction reference validation
    const refToUse = (customTransactionRef || '').trim() || generateNextTransactionRef(paymentMethod, feePayments, feeReceipts);
    if (paymentMethod !== 'Cash' && isTransactionRefDuplicate(refToUse, feePayments, feeReceipts)) {
      setModalError(`Duplicate reference ID "${refToUse}". Please generate or provide a distinct transaction reference.`);
      return;
    }

    try {
      const createdReceipt = recordFeePayment({
        studentId: targetStudentId,
        amount: numAmount,
        paymentMethod,
        transactionRef: refToUse,
        installment: paymentInstallment,
        notes: paymentNotes,
      });
      handleClosePayModal();
      setModalError(null);
      if (createdReceipt) {
        setReceiptToPrint(createdReceipt);
        setActionMessage(
          `Demo action recorded locally: Payment of ₹${createdReceipt.amount.toLocaleString()} recorded. Receipt ${createdReceipt.receiptNo} generated in local state.`
        );
        setTimeout(() => setActionMessage(null), 6000);
      }
    } catch (err) {
      setModalError(err.message || 'Failed to record fee payment.');
    }
  };

  const handleTriggerDueReminders = () => {
    const overdueList = branchScopedStudents.filter((s) => s.feesOverdue > 0);
    overdueList.forEach((st) => {
      addParentNotification({
        event: 'FEE_PAYMENT_DUE',
        title: 'Fee Installment Reminder',
        studentId: st.id,
        studentName: st.name,
        message: `Fee installment payment of ₹${st.feesOverdue?.toLocaleString()} is pending for ${st.name}.`,
        severity: 'warning',
      });
    });
    setActionMessage(
      `Demo action recorded locally: Fee payment reminder event(s) queued for ${overdueList.length} student account(s). (External SMS gateway not active in prototype).`
    );
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleOpenSalaryDisburseModal = (sal) => {
    setSalaryToDisburse(sal);
    setSalaryDisburseMethod('Direct Bank Transfer');
    setSalaryDisburseRef(generateNextTransactionRef('Bank Transfer / NEFT', [], []));
    setSalaryDisburseNotes(`Disbursement for ${sal.month}`);
    setSalaryModalError(null);
  };

  const handleDisburseSalarySubmit = (e) => {
    e.preventDefault();
    if (!salaryToDisburse) return;
    try {
      payStaffSalary(salaryToDisburse.id, {
        paymentMethod: salaryDisburseMethod,
        transactionRef: salaryDisburseRef,
        notes: salaryDisburseNotes,
      });
      setActionMessage(
        `Payroll disbursement of ₹${salaryToDisburse.netSalary.toLocaleString()} processed for ${salaryToDisburse.employeeName} (${salaryToDisburse.empCode}).`
      );
      setSalaryToDisburse(null);
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err) {
      setSalaryModalError(err.message || 'Failed to process salary payment.');
    }
  };

  // Keyboard navigation & body scroll lock for modals
  useEffect(() => {
    const isAnyModalOpen = showPayModal || !!salaryToDisburse || !!receiptToPrint;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (receiptToPrint) setReceiptToPrint(null);
        else if (showPayModal) handleClosePayModal();
        else if (salaryToDisburse) setSalaryToDisburse(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPayModal, salaryToDisburse, receiptToPrint]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider">
              {INSTITUTE_CONFIG.shortName} Finance &amp; Accounts Ledger
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Fees Management &amp; Financial Accounts
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Multi-branch student fee collection, installment schedules, computerized receipts, and staff payroll.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'fees' && canSendReminders && (
            <button
              onClick={handleTriggerDueReminders}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                Remind Overdue ({branchScopedStudents.filter((s) => s.feesOverdue > 0).length})
              </span>
            </button>
          )}

          {activeTab === 'fees' && (
            canEditFees ? (
              <button
                onClick={() => openRecordPaymentModal()}
                className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Record Fee Payment</span>
              </button>
            ) : (
              <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500">
                Payment Locked (View Mode)
              </span>
            )
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Module Tab Switcher */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('fees')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'fees'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Student Fee Accounts &amp; Receipts</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'payroll'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Banknote className="h-4 w-4" />
          <span>Staff Salary &amp; Payroll (Separated Ledger)</span>
        </button>
      </div>

      {activeTab === 'fees' ? (
        <>
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
                Total active student fee pool
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
                Remaining student balances
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
                Past scheduled due dates
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
                <option value="all">All Campuses</option>
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
                <option value="cleared">Fully Cleared</option>
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
                      <td colSpan={8} className="p-8">
                        <EmptyState
                          title="No fee accounts found"
                          description="No student fee accounts match the selected campus filter or search criteria."
                          actionLabel={searchTerm ? 'Clear Search' : undefined}
                          onAction={searchTerm ? () => setSearchTerm('') : undefined}
                        />
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
                                {student.studentCode || student.studentId}
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
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                              student.scholarshipPercent > 0
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {student.scholarshipPercent > 0
                              ? `${student.scholarshipPercent}% CHTQ Merit`
                              : 'Standard Fee'}
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
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                              student.feesPending === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : student.feesOverdue > 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
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
                                Cleared
                              </span>
                            ) : canCollectFee ? (
                              <button
                                onClick={() => openRecordPaymentModal(student.id)}
                                className="rounded-lg bg-blue-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-800 transition shadow-2xs"
                              >
                                Collect Fee
                              </button>
                            ) : (
                              <span className="rounded bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                Due
                              </span>
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

          {/* Recent Computerized Fee Receipts Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Computerized Fee Receipts ({selectedBranch === 'all' ? 'All Campuses' : branches.find((b) => b.id === selectedBranch)?.name || selectedBranch})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receipts generated and linked to authorized payment records.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 mt-2 sm:mt-0 font-medium">
                {scopedFees.length} receipt records in ledger
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Receipt No</th>
                    <th className="py-2.5 px-4 text-left">Payment ID</th>
                    <th className="py-2.5 px-4 text-left">Student Profile</th>
                    <th className="py-2.5 px-4 text-left">Campus</th>
                    <th className="py-2.5 px-4 text-left">Payment Mode</th>
                    <th className="py-2.5 px-4 text-left">Date</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedFees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8">
                        <EmptyState
                          title="No receipts recorded"
                          description="No fee receipts have been recorded for the selected campus yet."
                        />
                      </td>
                    </tr>
                  ) : (
                    scopedFees.map((rcpt) => (
                      <tr key={rcpt.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-900">
                          {rcpt.receiptNo}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                          {rcpt.paymentId || 'Legacy Payment'}
                        </td>
                        <td className="py-2.5 px-4">
                          <p className="font-bold text-slate-800">{rcpt.studentName}</p>
                          <p className="font-mono text-[10px] text-slate-400">{rcpt.studentCode}</p>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{rcpt.branchName || 'Main'}</td>
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
                            className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                          >
                            <Printer className="h-3 w-3 text-slate-500" />
                            <span>View / Print</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* SALARY & PAYROLL SECTION (SEPARATED LEDGER) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Monthly Staff Payroll Commitment</span>
                <DollarSign className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                ₹{(totalPayroll / 1e5).toFixed(2)}L
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Net compensation across active staff
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
                <span>Disbursed to Date</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-900">
                ₹{(totalDisbursedSalary / 1e5).toFixed(2)}L
              </div>
              <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                {branchScopedSalaries.filter((s) => s.status === 'Paid').length} staff paid
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
              <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
                <span>Pending Payroll Queue</span>
                <Users className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-900">
                ₹{(totalPendingSalary / 1e5).toFixed(2)}L
              </div>
              <p className="mt-1 text-[11px] text-amber-700 font-medium">
                {branchScopedSalaries.filter((s) => s.status === 'Pending').length} pending authorizations
              </p>
            </div>
          </div>

          {/* Salary Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff by name, code, designation..."
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
                <option value="all">All Campuses</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={salaryStatusFilter}
                onChange={(e) => setSalaryStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="paid">Disbursed (Paid)</option>
              </select>
            </div>
          </div>

          {/* Staff Salary Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 text-left">Staff Member</th>
                    <th className="py-3 px-4 text-left">Campus &amp; Role</th>
                    <th className="py-3 px-4 text-left">Month</th>
                    <th className="py-3 px-4 text-right">Base</th>
                    <th className="py-3 px-4 text-right">Allowance</th>
                    <th className="py-3 px-4 text-right">Deductions</th>
                    <th className="py-3 px-4 text-right font-black">Net Payable</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSalaries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8">
                        <EmptyState
                          title="No salary records found"
                          description="No payroll records match the selected month or campus filter."
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredSalaries.map((sal) => (
                      <tr key={sal.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{sal.employeeName}</p>
                          <p className="font-mono text-[10px] text-blue-900">{sal.empCode}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{sal.branchName}</p>
                          <p className="text-[10px] text-slate-500">{sal.designation}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {sal.month}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          ₹{sal.baseSalary.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700">
                          +₹{sal.allowance.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-red-700">
                          -₹{sal.deductions.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          ₹{sal.netSalary.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                              sal.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {sal.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {sal.status === 'Paid' ? (
                            <div className="text-[10px] text-slate-500">
                              <p className="font-semibold text-emerald-700">Disbursed on {sal.paidDate}</p>
                              <p className="font-mono">{sal.transactionRef}</p>
                            </div>
                          ) : canManageSalaries ? (
                            <button
                              onClick={() => handleOpenSalaryDisburseModal(sal)}
                              className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-2xs"
                            >
                              Disburse Salary
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Pending Approval</span>
                          )}
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

      {/* Record Fee Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-900" />
                <span>Collect Student Fee Payment</span>
              </h3>
              <button
                onClick={handleClosePayModal}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const targetStudent = students.find((s) => s.id === targetStudentId);
              const isSettled = !targetStudent || targetStudent.feesPending <= 0;
              const numAmount = Number(paymentAmount);
              const hasInvalidAmount =
                !targetStudent ||
                isNaN(numAmount) ||
                numAmount <= 0 ||
                numAmount > targetStudent.feesPending;

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
                              ? Math.min(25000, sel.feesPending)
                              : 0
                          );
                        }
                        setModalError(null);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                    >
                      {scopedStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.studentCode || s.studentId}) —{' '}
                          {s.feesPending === 0
                            ? '✓ Fully Cleared (₹0 Due)'
                            : `Due: ₹${s.feesPending.toLocaleString()}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {targetStudent && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        targetStudent.feesPending === 0
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : targetStudent.feesOverdue > 0
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
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
                        This student has no outstanding fees. Their tuition account is completely settled.
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
                            `Amount exceeds outstanding balance of ₹${targetStudent.feesPending.toLocaleString()}`
                          );
                        } else {
                          setModalError(null);
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-sm font-bold text-slate-900 ${
                        isSettled
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'border-slate-300 focus:outline-hidden focus:border-blue-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Installment / Fee Component
                    </label>
                    <select
                      value={paymentInstallment}
                      onChange={(e) => setPaymentInstallment(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    >
                      <option value="Admission & Term 1 Installment">Admission &amp; Term 1 Installment</option>
                      <option value="Term 2 Mid-Session Installment">Term 2 Mid-Session Installment</option>
                      <option value="Final Exam Preparation Installment">Final Exam Preparation Installment</option>
                      <option value="Study Material & Test Series Module">Study Material &amp; Test Series Module</option>
                      <option value="Comprehensive Single Settlement">Comprehensive Single Settlement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => {
                        const newMethod = e.target.value;
                        setPaymentMethod(newMethod);
                        setCustomTransactionRef(generateNextTransactionRef(newMethod, feePayments, feeReceipts));
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    >
                      <option value="UPI">UPI (QR Code / VPA)</option>
                      <option value="Cash">Cash in Hand</option>
                      <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                      <option value="Cheque">Bank Cheque</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="Other">Other Bank Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Transaction / Reference ID
                    </label>
                    <input
                      type="text"
                      value={customTransactionRef}
                      onChange={(e) => setCustomTransactionRef(e.target.value)}
                      placeholder="e.g. UPI-921820 or NEFT-2026-101"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Unique reference for accounting verification.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Transaction Remarks &amp; Notes
                    </label>
                    <input
                      type="text"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Notes for receipt ledger..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleClosePayModal}
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

      {/* Disburse Staff Salary Modal */}
      {salaryToDisburse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-700" />
                <span>Disburse Employee Salary</span>
              </h3>
              <button
                onClick={() => setSalaryToDisburse(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDisburseSalarySubmit} className="mt-4 space-y-3.5 text-xs">
              {salaryModalError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs font-semibold text-red-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{salaryModalError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{salaryToDisburse.employeeName}</p>
                    <p className="text-[11px] text-slate-500">{salaryToDisburse.designation} • {salaryToDisburse.branchName}</p>
                    <p className="font-mono text-[10px] text-blue-900 mt-0.5">{salaryToDisburse.empCode}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Payable</span>
                    <span className="text-lg font-black text-emerald-900">₹{salaryToDisburse.netSalary.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-600">
                  <span>Base: ₹{salaryToDisburse.baseSalary.toLocaleString()}</span>
                  <span>Allowances: +₹{salaryToDisburse.allowance.toLocaleString()}</span>
                  <span>Deductions: -₹{salaryToDisburse.deductions.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disbursement Method *</label>
                <select
                  value={salaryDisburseMethod}
                  onChange={(e) => setSalaryDisburseMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  <option value="Direct Bank Transfer">Direct Bank Transfer / NEFT</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="UPI">UPI Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disbursement Ref / Txn ID *</label>
                <input
                  type="text"
                  required
                  value={salaryDisburseRef}
                  onChange={(e) => setSalaryDisburseRef(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disbursement Notes</label>
                <input
                  type="text"
                  value={salaryDisburseNotes}
                  onChange={(e) => setSalaryDisburseNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSalaryToDisburse(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800 transition"
                >
                  Confirm &amp; Disburse
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
            {/* Top Close & Print Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-600">
                Computerized Fee Receipt Acknowledgment
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

            {/* Fee Receipt Content */}
            <div className="mt-4 p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              {/* Header with Real Central Config */}
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

              {/* Receipt & Payment Metadata */}
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
                  <span className="text-slate-500">Fee Component / Installment:</span>
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
                  Electronic Fee Collection Acknowledgment
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-3 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <p className="text-slate-400">Received By / Cashier:</p>
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
