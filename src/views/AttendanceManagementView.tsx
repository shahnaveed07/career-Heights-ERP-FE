import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Sparkles,
  UserCheck,
  Building,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { AttendanceStatus } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { StudentAvatar } from '../components/common/StudentAvatar';

export const AttendanceManagementView: React.FC = () => {
  const { students, batches, branches, attendanceRecords, markStudentAttendance, markBatchAttendance, employees } = useErpData();
  const { activeBranchFilter } = useAuth();

  const [activeTab, setActiveTab] = useState<'students' | 'faculty' | 'low_attendance'>('students');

  // Filter batches by active branch
  const availableBatches = activeBranchFilter === 'all'
    ? batches
    : batches.filter(b => b.branchId === activeBranchFilter);

  const [selectedBatchId, setSelectedBatchId] = useState<string>(availableBatches[0]?.id || batches[0]?.id || 'batch-jee-a');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [alertSentMessage, setAlertSentMessage] = useState<string | null>(null);

  // Synchronize selected batch if active branch filter changes
  useEffect(() => {
    if (availableBatches.length > 0 && !availableBatches.some(b => b.id === selectedBatchId)) {
      setSelectedBatchId(availableBatches[0].id);
    }
  }, [activeBranchFilter, availableBatches, selectedBatchId]);

  const activeBatch = batches.find(b => b.id === selectedBatchId);
  const batchStudents = students.filter(s => s.batchId === selectedBatchId);

  // Helper to get status of student on selected date
  const getStudentStatus = (studentId: string): AttendanceStatus => {
    const rec = attendanceRecords.find(r => r.studentId === studentId && r.date === selectedDate);
    return rec ? rec.status : 'present';
  };

  // Synchronous Attendance Percentage calculation for active batch
  const presentStudentsCount = batchStudents.filter(s => {
    const st = getStudentStatus(s.id);
    return st === 'present' || st === 'late';
  }).length;
  const batchSynchronousAttendancePercent = batchStudents.length > 0
    ? Math.round((presentStudentsCount / batchStudents.length) * 100)
    : 0;

  const handleToggleStatus = (studentId: string, status: AttendanceStatus) => {
    markStudentAttendance(studentId, selectedDate, status);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (activeBatch) {
      markBatchAttendance(activeBatch.id, selectedDate, status);
    } else {
      batchStudents.forEach(s => {
        markStudentAttendance(s.id, selectedDate, status);
      });
    }
  };

  const handleSendAbsenteeAlerts = () => {
    const absentees = batchStudents.filter(s => getStudentStatus(s.id) === 'absent');
    setAlertSentMessage(`Automated SMS & WhatsApp absence alerts dispatched to parents of ${absentees.length} students in ${activeBatch?.name || 'batch'}.`);
    setTimeout(() => setAlertSentMessage(null), 5000);
  };

  const filteredStudents = activeBranchFilter === 'all'
    ? students
    : students.filter(s => s.branchId === activeBranchFilter);

  const filteredEmployees = activeBranchFilter === 'all'
    ? employees
    : employees.filter(e => e.branchId === activeBranchFilter);

  const criticalAttendanceStudents = filteredStudents.filter(s => s.attendanceRate < 75);
  const warningAttendanceStudents = filteredStudents.filter(s => s.attendanceRate >= 75 && s.attendanceRate < 80);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Biometric &amp; Classroom Logs
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Attendance Tracking &amp; Absentee Alerts
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Real-time biometric sync with automated instant parent notifications.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('students')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'students' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch Roster
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'faculty' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty &amp; Staff
          </button>
          <button
            onClick={() => setActiveTab('low_attendance')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'low_attendance' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Risk Warnings ({criticalAttendanceStudents.length})
          </button>
        </div>
      </div>

      {alertSentMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{alertSentMessage}</span>
        </div>
      )}

      {/* STUDENT BATCH ROSTER TAB */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs text-xs">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Batch</label>
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden"
                >
                  {availableBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.branchName}: {b.name} ({b.timing})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Session Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                </input>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMarkAll('present')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Mark All Present
              </button>
              <button
                onClick={handleSendAbsenteeAlerts}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-red-700 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Notify Absentees</span>
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{activeBatch?.name} — Daily Register</h3>
                <p className="text-[11px] text-slate-500">
                  Room: {activeBatch?.roomNumber} • Mentor: {activeBatch?.facultyMentor} • {batchStudents.length} Students
                </p>
              </div>
              <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-900">
                Today: {batchSynchronousAttendancePercent}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Roll / ID</th>
                    <th className="py-2.5 px-4 text-left">Candidate Name</th>
                    <th className="py-2.5 px-4 text-left">Parent Contact</th>
                    <th className="py-2.5 px-4 text-center">Monthly Avg</th>
                    <th className="py-2.5 px-4 text-center">Status on {selectedDate}</th>
                    <th className="py-2.5 px-4 text-right">Direct Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No students enrolled in this batch roster yet.
                      </td>
                    </tr>
                  ) : (
                    batchStudents.map(student => {
                      const currentStatus = getStudentStatus(student.id);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-4 font-mono font-bold text-blue-900">{student.studentId}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <StudentAvatar photo={student.photo} name={student.name} size="sm" />
                              <span className="font-bold text-slate-900">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                            {student.parentPhone}
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold">
                            <span className={student.attendanceRate < 75 ? 'text-red-700' : 'text-emerald-700'}>
                              {student.attendanceRate}%
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold ${
                              currentStatus === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : currentStatus === 'absent'
                                ? 'bg-red-100 text-red-800'
                                : currentStatus === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {currentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                              {(['present', 'absent', 'late', 'leave'] as AttendanceStatus[]).map(st => (
                                <button
                                  key={st}
                                  onClick={() => handleToggleStatus(student.id, st)}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition capitalize ${
                                    currentStatus === st
                                      ? st === 'present'
                                        ? 'bg-emerald-700 text-white'
                                        : st === 'absent'
                                        ? 'bg-red-700 text-white'
                                        : st === 'late'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-blue-700 text-white'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  {st === 'leave' ? 'Lv' : st[0].toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FACULTY ATTENDANCE TAB */}
      {activeTab === 'faculty' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Faculty &amp; Academic Staff Biometric Logs</h3>
              <p className="text-xs text-slate-500">Biometric fingerprint check-ins synchronized with HQ server</p>
            </div>
            <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
              98.2% Faculty Regularity
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 text-left">Staff Name</th>
                  <th className="py-3 px-4 text-left">Designation</th>
                  <th className="py-3 px-4 text-left">Campus Branch</th>
                  <th className="py-3 px-4 text-center">Punch In</th>
                  <th className="py-3 px-4 text-center">Punch Out</th>
                  <th className="py-3 px-4 text-center">Biometric Status</th>
                  <th className="py-3 px-4 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img src={emp.photo} alt={emp.name} className="h-7 w-7 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{emp.designation}</td>
                    <td className="py-3 px-4 text-slate-600">{emp.branchName}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-800">08:52 AM</td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-500">In Campus</td>
                    <td className="py-3 px-4 text-center">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Present
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">{emp.attendanceRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOW ATTENDANCE RISK LIST */}
      {activeTab === 'low_attendance' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Mandatory Intervention List (&lt;75% Attendance Threshold)</span>
            </div>
            <p className="mt-1 text-xs text-red-700">
              Students falling below the 75% attendance threshold are algorithmically barred from official Career Heights Hall Tickets and CHTQ scholarships unless an approved medical waiver is recorded.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 text-left">Student ID</th>
                  <th className="py-3 px-4 text-left">Student Name</th>
                  <th className="py-3 px-4 text-left">Branch &amp; Batch</th>
                  <th className="py-3 px-4 text-left">Parent Phone</th>
                  <th className="py-3 px-4 text-center">Attendance</th>
                  <th className="py-3 px-4 text-center">Days Absent</th>
                  <th className="py-3 px-4 text-right">Escalation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalAttendanceStudents.map(student => (
                  <tr key={student.id} className="hover:bg-red-50/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{student.studentId}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                    <td className="py-3 px-4 text-slate-600">{student.branchName} • {student.batchName}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{student.parentPhone}</td>
                    <td className="py-3 px-4 text-center font-black text-red-700 text-sm">
                      {student.attendanceRate}%
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-semibold">14 Days</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setAlertSentMessage(`Parent meeting summons letter generated for ${student.name} (${student.parentPhone})`);
                          setTimeout(() => setAlertSentMessage(null), 5000);
                        }}
                        className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
                      >
                        Summon Guardian
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
  );
};
