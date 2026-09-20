import React, { useState } from 'react';
import {
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Award,
  CreditCard,
  HelpCircle,
  Clock,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useErpData } from '../context/ErpDataContext';

export const StudentPortalView: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, testResults, submitDoubt, doubts, timetable } = useErpData();

  // Find linked student or fallback to first student
  const student = students.find(s => s.id === currentUser?.linkedStudentId) || students[0];
  const myResults = testResults.filter(r => r.studentId === student?.id);
  const myDoubts = doubts.filter(d => d.studentId === student?.id || d.studentName === student?.name);

  // Ask doubt state
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtSubject, setDoubtSubject] = useState('Physics');
  const [doubtSuccess, setDoubtSuccess] = useState(false);

  const handleAskDoubt = (e: React.FormEvent) => {
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

  if (!student) {
    return <div className="p-8 text-center text-slate-500">Student record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Student Identity Card Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
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
              <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight">{student.name}</h1>
              <p className="text-xs text-blue-200">
                Roll: <span className="font-mono font-bold text-white">{student.studentCode}</span> • {student.branchName} • {student.batchName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-xs">
              <span className="block text-[10px] text-blue-200">CHTQ Scholarship</span>
              <span className="text-xl font-black text-amber-300">{student.scholarshipPercent}%</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-xs">
              <span className="block text-[10px] text-blue-200">Pending Fee</span>
              <span className="text-xl font-black text-white">
                {student.feesPending === 0 ? 'NIL' : `₹${(student.feesPending / 1000).toFixed(0)}k`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Biometric Attendance</span>
            <CalendarCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{student.attendanceRate}%</div>
          <p className="mt-1 text-xs text-slate-500">82 of 88 Class Days Present (Regular)</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Latest Test Rank</span>
            <Award className="h-5 w-5 text-blue-900" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-900">
            AIR #{myResults[0]?.instituteRank || 1}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Score: {myResults[0]?.totalMarksObtained || 645} / {myResults[0]?.totalMaxMarks || 720} ({myResults[0]?.percentile || 99.4}th %ile)
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Fee Account Status</span>
            <CreditCard className="h-5 w-5 text-indigo-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {student.feesPending === 0 ? (
              <span className="text-emerald-700">Fully Cleared</span>
            ) : (
              <span>₹{student.feesPending.toLocaleString()} Due</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Paid: ₹{student.feesPaid.toLocaleString()} of ₹{student.feesTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Grid: Left Test History + Timetable, Right Doubt Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* Test Performance Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">My Mock Test Scores &amp; OMR Evaluation</h3>
              <span className="text-xs text-blue-900 font-bold">Career Heights Test Series</span>
            </div>

            <div className="space-y-3">
              {myResults.map(res => (
                <div key={res.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{res.testTitle}</h4>
                      <p className="text-slate-500 text-[11px]">{res.testDate} • All-India Mock</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-800">
                      Rank #{res.instituteRank}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-y border-slate-200 text-xs">
                    <span>Marks: <strong>{res.totalMarksObtained} / {res.totalMaxMarks}</strong></span>
                    <span>Percentile: <strong className="text-blue-900">{res.percentile}%</strong></span>
                    <span>Batch Rank: <strong>#{res.batchRank}</strong></span>
                  </div>

                  {res.weakTopics.length > 0 && (
                    <div className="text-[11px]">
                      <span className="text-slate-500 font-semibold">Focus Areas Identified: </span>
                      <span className="text-red-700 font-medium">{res.weakTopics.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Today's Lectures */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Today's Class Schedule ({student.batchName})</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                <span className="font-bold text-blue-900">08:30 - 10:00 AM</span>
                <span className="font-bold text-slate-800">Physics: Electrodynamics</span>
                <span className="text-slate-500">Hall 1 • Dr. Rahul</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-200 bg-blue-50/30">
                <span className="font-bold text-blue-900">10:15 - 11:45 AM</span>
                <span className="font-bold text-slate-800">Chemistry: Thermodynamics</span>
                <span className="text-slate-500">Room 3 • Prof. Ananya</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                <span className="font-bold text-blue-900">01:00 - 02:30 PM</span>
                <span className="font-bold text-slate-800">DPP Doubt Problem Clinic</span>
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
              Direct line to senior faculty. Answers will appear below with detailed steps.
            </p>

            {doubtSuccess && (
              <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-800">
                Doubt dispatched to faculty desk!
              </div>
            )}

            <form onSubmit={handleAskDoubt} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={doubtSubject}
                  onChange={e => setDoubtSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Describe Question</label>
                <textarea
                  rows={3}
                  value={doubtQuestion}
                  onChange={e => setDoubtQuestion(e.target.value)}
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
            <h3 className="text-sm font-bold text-slate-900">My Questions &amp; Answers</h3>
            {myDoubts.map(d => (
              <div key={d.id} className="rounded-lg border border-slate-200 p-3 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900">{d.subject}</span>
                  <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                    d.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
