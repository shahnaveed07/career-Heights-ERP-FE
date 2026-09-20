import React from 'react';
import {
  Users,
  CalendarCheck,
  Award,
  CreditCard,
  PhoneCall,
  Download,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useErpData } from '../context/ErpDataContext';

export const ParentPortalView: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, testResults, feeReceipts } = useErpData();

  // Find linked student for this parent
  const child = students.find(s => s.id === currentUser?.linkedStudentId) || students[0];
  const childResults = testResults.filter(r => r.studentId === child?.id);
  const childReceipts = feeReceipts.filter(r => r.studentId === child?.id);

  if (!child) {
    return <div className="p-8 text-center text-slate-500">Child record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={child.avatar}
              alt={child.name}
              className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Guardian &amp; Parent Oversight Desk
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Daily Biometric Verified
                </span>
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight">
                {child.name}'s Academic Progress Dossier
              </h1>
              <p className="text-xs text-blue-200">
                Roll: <strong className="text-white font-mono">{child.studentCode}</strong> • {child.branchName} • {child.batchName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Connecting call with Handwara Batch Mentor / Academic Counselor...`)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-xs"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Contact Mentor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Biometric Punch Record</span>
            <CalendarCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{child.attendanceRate}%</div>
          <p className="mt-1 text-xs text-slate-500">Total days present: 82 / 88 (Excellent discipline)</p>
          <div className="mt-3 text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded">
            ✓ Automated SMS sent to parent upon morning biometric tap
          </div>
        </div>

        {/* Academic Rank */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">National Mock Standing</span>
            <Award className="h-5 w-5 text-blue-900" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-900">
            AIR #{childResults[0]?.instituteRank || 1}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Score: {childResults[0]?.totalMarksObtained || 645} / {childResults[0]?.totalMaxMarks || 720}
          </p>
          <div className="mt-3 text-[11px] text-blue-900 font-bold bg-blue-50 p-2 rounded">
            ✓ Target: NEET/JEE Premier Rank Bracket (&gt;99th %ile)
          </div>
        </div>

        {/* Fee Schedule */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tuition Fee Ledger</span>
            <CreditCard className="h-5 w-5 text-indigo-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {child.feesPending === 0 ? (
              <span className="text-emerald-700">Fully Cleared</span>
            ) : (
              <span>₹{child.feesPending.toLocaleString()} Due</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Paid: ₹{child.feesPaid.toLocaleString()} of ₹{child.feesTotal.toLocaleString()}</p>
          <div className="mt-3 text-[11px] text-slate-600 bg-slate-100 p-2 rounded">
            Next Installment Due Date: 15 October 2026
          </div>
        </div>
      </div>

      {/* Two Column Layout: Exam Results & Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Performance Detailed Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Examination &amp; Test Series Marks</h3>
            <span className="text-xs font-bold text-blue-900">OMR Evaluated</span>
          </div>

          <div className="space-y-3">
            {childResults.map(res => (
              <div key={res.id} className="rounded-xl border border-slate-200 p-4 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{res.testTitle}</h4>
                    <p className="text-slate-500 text-[11px]">{res.testDate} • All India Diagnostic Mock</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                    AIR #{res.instituteRank}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center font-bold">
                  <div>
                    <span className="block text-[10px] text-slate-400">Score</span>
                    <span className="text-slate-900">{res.totalMarksObtained} / {res.totalMaxMarks}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Percentile</span>
                    <span className="text-emerald-700">{res.percentile}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Branch Rank</span>
                    <span className="text-blue-900">#{res.branchRank}</span>
                  </div>
                </div>

                {res.weakTopics.length > 0 && (
                  <div className="text-[11px]">
                    <span className="font-semibold text-slate-600">Faculty Advisory for Home Revision: </span>
                    <span className="text-red-700">{res.weakTopics.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fee Receipts & Payment Receipts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Official Computerized Receipts Issued</h3>
            <span className="text-xs text-slate-500">GST Compliant</span>
          </div>

          <div className="space-y-3 text-xs">
            {childReceipts.map(rcpt => (
              <div key={rcpt.id} className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-blue-900">{rcpt.receiptNo}</p>
                  <p className="text-[11px] text-slate-500">{rcpt.date} • {rcpt.paymentMethod} • Ref: {rcpt.transactionRef}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-sm">₹{rcpt.amount.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-emerald-700">PAID &amp; SIGNED</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-950 space-y-1">
            <strong className="block font-bold">Career Heights Transparent Parent Guarantee:</strong>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Parents receive real-time SMS alerts at 08:35 AM upon biometric check-in and instantaneous SMS report cards when OMR sheets are scanned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
