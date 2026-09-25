import { useState } from 'react';
import {
  CalendarCheck,
  Award,
  CreditCard,
  PhoneCall,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  FileText,
  DollarSign,
  Receipt,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useErpData } from '../context/ErpDataContext';
import { StudentAvatar } from '../components/common/StudentAvatar';
import {
  NOTIFICATION_TYPE_CONFIG,
  NOTIFICATION_EVENT_TYPES,
} from '../utils/parentNotificationEvents';
import {
  getStudentEnrolledSubjects,
  CANONICAL_SUBJECTS,
} from '../utils/academicModel';

export const ParentPortalView = () => {
  const { currentUser } = useAuth();
  const { students, testResults, feeReceipts, parentNotifications } = useErpData();

  // Find linked children
  const linkedIds =
    currentUser?.linkedStudentIds ||
    (currentUser?.linkedStudentId ? [currentUser.linkedStudentId] : []);

  const parentChildren = students.filter(
    (s) =>
      linkedIds.includes(s.id) ||
      (currentUser?.name && s.parentName?.toLowerCase().includes(currentUser.name.toLowerCase()))
  );

  const eligibleChildren = parentChildren.length > 0 ? parentChildren : [students[0]];

  const [selectedChildId, setSelectedChildId] = useState(
    currentUser?.linkedStudentId || eligibleChildren[0]?.id
  );
  const [selectedNotificationFilter, setSelectedNotificationFilter] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);

  const child = eligibleChildren.find((s) => s.id === selectedChildId) || eligibleChildren[0];
  const childResults = testResults.filter((r) => r.studentId === child?.id);
  const childReceipts = feeReceipts.filter((r) => r.studentId === child?.id);
  const childEnrolledSubjects = child ? getStudentEnrolledSubjects(child, CANONICAL_SUBJECTS) : [];

  // Notifications relevant to active child or general institution notices
  const childNotifications = (parentNotifications || []).filter(
    (n) => !n.studentId || n.studentId === child?.id || n.studentCode === 'ALL'
  );

  const filteredNotifications = selectedNotificationFilter === 'all'
    ? childNotifications
    : childNotifications.filter((n) => n.type === selectedNotificationFilter);

  if (!child) {
    return (
      <div className="p-8 text-center text-slate-500">
        Child record not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Multi-Child Selector if parent has multiple wards */}
      {eligibleChildren.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-900" />
            <span className="text-xs font-bold text-blue-950">
              Multiple Wards Linked to Account:
            </span>
            <span className="text-xs text-blue-800">
              Switch dossier to review academic records:
            </span>
          </div>
          <div className="flex items-center gap-2">
            {eligibleChildren.map((ward) => (
              <button
                key={ward.id}
                onClick={() => setSelectedChildId(ward.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                  child.id === ward.id
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{ward.name}</span>
                <span className="text-[10px] font-mono opacity-80">({ward.studentId || ward.studentCode})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <StudentAvatar
              photo={child.photo || child.avatar}
              name={child.name}
              size="xl"
              className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Guardian &amp; Parent Oversight Desk
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Biometric Verified: {child.attendanceRate}%
                </span>
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight">
                {child.name}'s Academic Progress Dossier
              </h1>
              <p className="text-xs text-blue-200">
                Roll:{' '}
                <strong className="text-white font-mono">
                  {child.studentCode || child.studentId}
                </strong>{' '}
                • Class: <strong className="text-white">{child.className}</strong> • Wing: <strong className="text-white">{child.wingName || 'Medical'}</strong> • Batch: <strong className="text-white">{child.batchName}</strong> • {child.branchName}
              </p>
              {/* Enrolled Subjects */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-blue-300 font-semibold uppercase">Enrolled Subjects:</span>
                {childEnrolledSubjects.map((sub) => (
                  <span
                    key={sub.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white/15 text-white backdrop-blur-xs border border-white/20"
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-xs"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Contact Campus Mentor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Biometric Punch Record
            </span>
            <CalendarCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {child.attendanceRate}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Total days logged: 82 / 88 (Compliant attendance)
          </p>
          <div className="mt-3 text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 p-2 rounded">
            ✓ Logged in Parent In-App Dossier upon RFID morning tap
          </div>
        </div>

        {/* Academic Rank */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              National Mock Standing
            </span>
            <Award className="h-5 w-5 text-blue-900" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-900">
            AIR #{childResults[0]?.instituteRank || 1}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Score: {childResults[0]?.totalMarksObtained || 645} /{' '}
            {childResults[0]?.totalMaxMarks || 720}
          </p>
          <div className="mt-3 text-[11px] text-blue-900 font-bold bg-blue-50 border border-blue-200 p-2 rounded">
            ✓ Target: NEET/JEE Premier Rank Bracket (&gt;98th %ile)
          </div>
        </div>

        {/* Fee Schedule */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Tuition Fee Ledger
            </span>
            <CreditCard className="h-5 w-5 text-indigo-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {child.feesPending === 0 ? (
              <span className="text-emerald-700">Fully Cleared</span>
            ) : (
              <span>₹{child.feesPending.toLocaleString()} Due</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Paid: ₹{child.feesPaid.toLocaleString()} of ₹
            {child.feesTotal.toLocaleString()}
          </p>
          <div className="mt-3 text-[11px] text-slate-600 bg-slate-100 border border-slate-200 p-2 rounded">
            Next Term Installment Due: 15 October 2026
          </div>
        </div>
      </div>

      {/* Two Column Layout: Exam Results & Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Performance Detailed Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Examination &amp; Test Series Marks ({childResults.length})
            </h3>
            <span className="text-xs font-bold text-blue-900">
              OMR Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {childResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No mock test records recorded for this child yet.
              </div>
            ) : (
              childResults.map((res) => (
                <div
                  key={res.id}
                  className="rounded-xl border border-slate-200 p-4 text-xs space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {res.testTitle}
                      </h4>
                      <p className="text-slate-500 text-[11px]">
                        {res.testDate} • All India Diagnostic Mock
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                      AIR #{res.instituteRank}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center font-bold">
                    <div>
                      <span className="block text-[10px] text-slate-400">
                        Score
                      </span>
                      <span className="text-slate-900">
                        {res.totalMarksObtained} / {res.totalMaxMarks}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">
                        Percentile
                      </span>
                      <span className="text-emerald-700">{res.percentile}%</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">
                        Branch Rank
                      </span>
                      <span className="text-blue-900">#{res.branchRank}</span>
                    </div>
                  </div>

                  {res.weakTopics?.length > 0 && (
                    <div className="text-[11px]">
                      <span className="font-semibold text-slate-600">
                        Faculty Advisory for Home Revision:{' '}
                      </span>
                      <span className="text-red-700">
                        {res.weakTopics.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fee Receipts & Payment Receipts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Fee Receipts Issued ({childReceipts.length})
            </h3>
            <span className="text-xs text-slate-500">Accounts Verified</span>
          </div>

          <div className="space-y-3 text-xs">
            {childReceipts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No fee receipts issued yet for this child.
              </div>
            ) : (
              childReceipts.map((rcpt) => (
                <div
                  key={rcpt.id}
                  className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono font-bold text-blue-900">
                      {rcpt.receiptNo}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {rcpt.date} • {rcpt.paymentMethod} • Ref:{' '}
                      {rcpt.transactionRef}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-sm">
                      ₹{rcpt.amount.toLocaleString()}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700">
                      PAID &amp; SIGNED
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-950 space-y-1">
            <strong className="block font-bold">
              Parent Notification Architecture:
            </strong>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Standardized events for absences, RFID arrivals, upcoming exams, published scorecards, fee dues, and receipts are recorded in the structured event queue below.
            </p>
          </div>
        </div>
      </div>

      {/* PARENT NOTIFICATION & EVENT FEED SECTION */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-900 text-white">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Parent Notification &amp; Event Stream
              </h3>
              <p className="text-xs text-slate-500">
                Prepared data &amp; event structures for {child.name} (Absences, Attendance, Exams, Results, Fees, Notices)
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
            {filteredNotifications.length} Events Logged
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setSelectedNotificationFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              selectedNotificationFilter === 'all'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Events ({childNotifications.length})
          </button>
          {Object.entries(NOTIFICATION_TYPE_CONFIG).map(([key, config]) => {
            const count = childNotifications.filter((n) => n.type === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedNotificationFilter(key)}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  selectedNotificationFilter === key
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Notification Cards List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No notification events logged for this filter.
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const cfg = NOTIFICATION_TYPE_CONFIG[n.type] || {
                label: n.type,
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
              };
              return (
                <div
                  key={n.id}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 hover:bg-slate-50 transition space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {n.date} • {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed">{n.message}</p>

                  {/* Metadata pill container */}
                  {n.metadata && Object.keys(n.metadata).length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
                      {n.metadata.session && <span>Session: <strong className="text-slate-700">{n.metadata.session}</strong></span>}
                      {n.metadata.score !== undefined && (
                        <span>
                          Score: <strong className="text-slate-900">{n.metadata.score}/{n.metadata.maxMarks}</strong> (Rank #{n.metadata.rank})
                        </span>
                      )}
                      {n.metadata.receiptNo && <span>Receipt No: <strong className="text-blue-900 font-mono">{n.metadata.receiptNo}</strong></span>}
                      {n.metadata.amountDue && <span>Amount: <strong className="text-red-700 font-mono">₹{n.metadata.amountDue.toLocaleString()}</strong></span>}
                      {n.metadata.amount && <span>Amount Paid: <strong className="text-emerald-700 font-mono">₹{n.metadata.amount.toLocaleString()}</strong></span>}
                      <span className="text-slate-400 ml-auto text-[10px]">
                        Event Channel: {n.channel}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Contact Mentor Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-blue-900" />
                <h3 className="text-base font-bold text-slate-900">
                  Campus Academic Mentor Desk
                </h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 space-y-1">
                <p className="font-bold text-blue-950">Mentor: Dr. Rahul Sharma (HOD Physics / Lead Counselor)</p>
                <p className="text-blue-800">Campus: {child.branchName} • Batch: {child.batchName}</p>
                <p className="text-blue-900 font-mono font-bold mt-1">Phone: +91 94190 22001</p>
              </div>

              <div className="space-y-1 text-slate-600">
                <p className="font-semibold text-slate-700">Advisory Desk Hours:</p>
                <p>Monday – Saturday: 03:00 PM – 05:30 PM (Post Lecture Hours)</p>
                <p>Parent Counseling Room 102, {child.branchName} Campus Building</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setShowContactModal(false)}
                className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
