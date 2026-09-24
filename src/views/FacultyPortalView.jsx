import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  FileText,
  UserCheck,
  Send,
  Plus,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useErpData } from '../context/ErpDataContext';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { getTodayDateString } from '../utils/dateUtils';

export const FacultyPortalView = () => {
  const { currentUser, can, uiMode } = useAuth();
  const {
    batches,
    timetable,
    syllabus,
    doubts,
    answerDoubt,
    employees,
    teacherAssignments,
    students,
    markStudentAttendance,
    markBatchAttendance,
    attendanceRecords,
    teacherAttendanceRecords,
    markTeacherSelfAttendance,
    homework,
    addHomework,
  } = useErpData();

  const [activeTab, setActiveTab] = useState('schedule');
  const [activeAnswerId, setActiveAnswerId] = useState(null);
  const [answerText, setAnswerText] = useState('');

  // Selected batch for attendance & study materials
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || 'batch-jee-a');
  const [attendanceDate, setAttendanceDate] = useState(getTodayDateString());
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState(null);

  // DPP / Homework modal
  const [showAddHwModal, setShowAddHwModal] = useState(false);
  const [newHwForm, setNewHwForm] = useState({
    title: '',
    subject: 'Physics',
    dueDate: '',
    description: '',
  });

  const facultyProfile =
    employees.find((e) => e.email === currentUser?.email) || employees[0];

  // Faculty assigned records from teacherAssignments
  const myAssignments = (teacherAssignments || []).filter(
    (ta) =>
      ta.teacherId === currentUser?.id ||
      ta.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
      currentUser?.role === 'ceo' ||
      currentUser?.role === 'hq_admin'
  );

  // Self attendance record for today
  const todayStr = getTodayDateString();
  const myTodayAttendance = (teacherAttendanceRecords || []).find(
    (r) =>
      (r.teacherId === currentUser?.id || r.teacherName === currentUser?.name) &&
      r.date === todayStr
  );

  const canMarkAttendance = can('attendance', 'mark_attendance');
  const canSolveDoubts = can('academic', 'solve_doubts') || can('academic', 'edit');
  const canUploadMaterials = can('academic', 'add') || can('academic', 'edit');

  const handleResolveDoubt = (id) => {
    if (!answerText.trim() || !canSolveDoubts) return;
    answerDoubt(id, answerText);
    setActiveAnswerId(null);
    setAnswerText('');
  };

  const handleSelfPunchIn = () => {
    markTeacherSelfAttendance(currentUser?.id || 'u-faculty', {
      location: 'Handwara Main Campus (34.3980° N, 74.2831° E)',
      accuracyMeters: 8,
      deviceInfo: 'Biometric / Campus GeoFence Verified',
    });
  };

  // Batch students for attendance
  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const activeBatchStudents = students.filter((s) => s.batchId === selectedBatchId);

  const getStudentStatus = (studentId) => {
    const rec = attendanceRecords.find(
      (r) => r.studentId === studentId && r.date === attendanceDate
    );
    return rec ? rec.status : 'present';
  };

  const handleToggleStudentAttendance = (studentId, status) => {
    if (!canMarkAttendance) return;
    markStudentAttendance(studentId, attendanceDate, status);
  };

  const handleMarkAllStudents = (status) => {
    if (!canMarkAttendance) return;
    markBatchAttendance(selectedBatchId, attendanceDate, status);
    setAttendanceSuccessMsg(`Batch attendance updated to all ${status.toUpperCase()}.`);
    setTimeout(() => setAttendanceSuccessMsg(null), 3000);
  };

  const handleCreateHomework = (e) => {
    e.preventDefault();
    if (!newHwForm.title.trim() || !canUploadMaterials) return;
    addHomework({
      batchId: selectedBatchId,
      subject: newHwForm.subject,
      title: newHwForm.title,
      description: newHwForm.description,
      dueDate: newHwForm.dueDate,
    });
    setNewHwForm({
      title: '',
      subject: 'Physics',
      dueDate: '',
      description: '',
    });
    setShowAddHwModal(false);
  };

  const batchHomework = (homework || []).filter(
    (h) => !selectedBatchId || h.batchId === selectedBatchId
  );

  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <StudentAvatar
              photo={currentUser?.avatar || facultyProfile?.photo}
              name={currentUser?.name || facultyProfile?.name || 'Faculty Member'}
              size="xl"
              className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Senior Faculty &amp; Mentor Console
                </span>
                {myTodayAttendance ? (
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Punch In: {myTodayAttendance.checkInTime}
                  </span>
                ) : (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Punch In Pending
                  </span>
                )}
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight">
                {currentUser?.name || facultyProfile?.name}
              </h1>
              <p className="text-xs text-blue-200">
                Subject: <strong className="text-white">{currentUser?.subject || 'Physics'}</strong> • {currentUser?.branchName || 'Handwara Campus'} • Code: {facultyProfile?.empCode || 'FAC-101'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Geo Punch In Button */}
            {canMarkAttendance && (
              <button
                onClick={handleSelfPunchIn}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                  myTodayAttendance
                    ? 'bg-emerald-700/80 hover:bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>
                  {myTodayAttendance?.checkOutTime
                    ? 'Completed for Today'
                    : myTodayAttendance
                    ? 'Clock Out'
                    : 'Campus Geo Punch-In'}
                </span>
              </button>
            )}

            <div className="rounded-xl bg-white/10 p-2.5 text-center backdrop-blur-xs min-w-[70px]">
              <span className="block text-[10px] text-blue-200">Batches</span>
              <span className="text-lg font-black">{myAssignments.length || batches.length}</span>
            </div>
            <div className="rounded-xl bg-white/10 p-2.5 text-center backdrop-blur-xs min-w-[70px]">
              <span className="block text-[10px] text-blue-200">Open Doubts</span>
              <span className="text-lg font-black text-amber-300">
                {doubts.filter((d) => d.status === 'open').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold gap-1">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 min-w-[120px] rounded py-2 transition ${activeTab === 'schedule' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Today's Schedule &amp; Roster
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 min-w-[120px] rounded py-2 transition flex items-center justify-center gap-1.5 ${activeTab === 'attendance' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Mark Batch Attendance</span>
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 min-w-[120px] rounded py-2 transition flex items-center justify-center gap-1.5 ${activeTab === 'materials' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>DPP &amp; Study Notes</span>
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex-1 min-w-[120px] rounded py-2 transition ${activeTab === 'syllabus' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Syllabus Delivery Pacing
        </button>
        <button
          onClick={() => setActiveTab('doubts')}
          className={`flex-1 min-w-[120px] rounded py-2 transition ${activeTab === 'doubts' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Doubt Clarification Desk ({doubts.filter((d) => d.status === 'open').length})
        </button>
      </div>

      {/* 1. SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Today's Class Roster &amp; Smart Lecture Halls
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              3 Lectures Assigned Today
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-blue-900">08:30 - 10:00 AM</span>
                <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold text-[10px]">
                  COMPLETED
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Physics: Magnetic Effects of Current
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Batch: Handwara NEET Droppers • Lecture Hall 1
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Attendance:</span>
                <strong className="text-emerald-700">42 / 45 Present (93%)</strong>
              </div>
            </div>

            <div className="rounded-xl border-2 border-blue-900 bg-blue-50/20 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-blue-900">10:15 - 11:45 AM</span>
                <span className="rounded bg-blue-900 text-white px-2 py-0.5 font-bold text-[10px]">
                  IN PROGRESS
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Physics: Biot-Savart &amp; Ampere's Law
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Batch: Class 12 JEE Elite • Smart Room 3
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-xs">
                <span className="text-slate-500">Active Students:</span>
                <strong className="text-blue-900">38 Present</strong>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">01:00 - 02:30 PM</span>
                <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 font-bold text-[10px]">
                  UPCOMING
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Daily Practice Problem (DPP) Clinic
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                All Medical Aspirants • Doubt Lab
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Scheduled:</span>
                <strong className="text-slate-800">Doubts &amp; DPP Analysis</strong>
              </div>
            </div>
          </div>

          {/* Assigned Workload Mapping */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Assigned Subject Batches ({myAssignments.length > 0 ? myAssignments.length : 'All Active Batches'})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(myAssignments.length > 0 ? myAssignments : batches.slice(0, 3)).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs"
                >
                  <div className="font-bold text-slate-900">{item.batchName || item.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {item.subjectName || currentUser?.subject || 'Physics'} • {item.className || 'Class 12th'} • {item.branchName || 'Handwara'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. BATCH ATTENDANCE MARKING TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Mark Subject &amp; Class Attendance
              </h3>
              <p className="text-xs text-slate-500">
                Record synchronous student attendance for your assigned batch lectures.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.className})
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs"
              />
            </div>
          </div>

          {attendanceSuccessMsg && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{attendanceSuccessMsg}</span>
            </div>
          )}

          {/* Quick Mark Batch Buttons */}
          {canMarkAttendance && (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">
                Quick Mark Entire Batch:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkAllStudents('present')}
                  className="rounded bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700 shadow-2xs"
                >
                  All Present
                </button>
                <button
                  onClick={() => handleMarkAllStudents('absent')}
                  className="rounded bg-red-600 px-3 py-1 font-bold text-white hover:bg-red-700 shadow-2xs"
                >
                  All Absent
                </button>
              </div>
            </div>
          )}

          {/* Students Attendance List */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Status on {attendanceDate}</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeBatchStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No students enrolled in this batch.
                      </td>
                    </tr>
                  ) : (
                    activeBatchStudents.map((st) => {
                      const stStatus = getStudentStatus(st.id);
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <StudentAvatar
                                photo={st.photo}
                                name={st.name}
                                size="sm"
                                className="h-7 w-7 rounded-full"
                              />
                              <div>
                                <div>{st.name}</div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  {st.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {st.studentId || st.admissionNo}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{st.branchName}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                                stStatus === 'present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : stStatus === 'late'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {stStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {canMarkAttendance ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleStudentAttendance(st.id, 'present')}
                                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                    stStatus === 'present'
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  P
                                </button>
                                <button
                                  onClick={() => handleToggleStudentAttendance(st.id, 'late')}
                                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                    stStatus === 'late'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  L
                                </button>
                                <button
                                  onClick={() => handleToggleStudentAttendance(st.id, 'absent')}
                                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                    stStatus === 'absent'
                                      ? 'bg-red-700 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  A
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">View Only</span>
                            )}
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

      {/* 3. DPP & STUDY NOTES TAB */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daily Practice Problems (DPP) &amp; Chapter Notes
              </h3>
              <p className="text-xs text-slate-500">
                Distribute pedagogical materials, solved exemplar sets, and assignments to students.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {canUploadMaterials && (
                <button
                  onClick={() => setShowAddHwModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Assign New DPP</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchHomework.length === 0 ? (
              <div className="col-span-2 rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
                No DPP assignments published yet for this batch.
              </div>
            ) : (
              batchHomework.map((hw) => (
                <div
                  key={hw.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-800 border border-blue-200">
                        {hw.subject} • {hw.batchName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Due: {hw.dueDate}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{hw.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {hw.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      By {hw.facultyName || 'Dr. Rahul Sharma'}
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                      Active DPP Assignment
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. SYLLABUS TAB */}
      {activeTab === 'syllabus' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Faculty Syllabus Delivery Milestone Status
          </h3>
          <div className="space-y-4">
            {syllabus.map((topic) => (
              <div
                key={topic.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900 text-sm">
                    {topic.subject}: {topic.title}
                  </div>
                  <span className="font-bold text-blue-900">
                    {topic.completionPercent}% Complete
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-900 rounded-full"
                    style={{ width: `${topic.completionPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>
                    Lectures Delivered: {topic.completedLectures} / {topic.totalLectures}
                  </span>
                  <span className="capitalize font-semibold text-slate-700">
                    {topic.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. DOUBTS TAB */}
      {activeTab === 'doubts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Student Doubts Awaiting Your Resolution
              </h3>
              <p className="text-xs text-slate-500">
                Direct pedagogical queries submitted by students from your assigned batches.
              </p>
            </div>
            {!canSolveDoubts && (
              <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-bold">
                View Only Mode
              </span>
            )}
          </div>

          {doubts.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{d.studentName}</span>
                  <span className="text-slate-500 ml-2 font-mono text-[10px]">
                    {d.studentCode}
                  </span>
                  <span className="text-slate-400 ml-2">• {d.date}</span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    d.status === 'answered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {d.status.toUpperCase()}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium text-slate-800">
                "{d.question}"
              </div>

              {d.status === 'answered' ? (
                <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 text-slate-700">
                  <span className="font-bold text-emerald-900 block mb-1">
                    Answered by {d.answeredBy}:
                  </span>
                  <p>{d.answer}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeAnswerId === d.id ? (
                    <>
                      <textarea
                        rows={3}
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Write clear, pedagogical explanation for the student..."
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-blue-900"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveAnswerId(null)}
                          className="rounded border border-slate-300 px-3 py-1 font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResolveDoubt(d.id)}
                          disabled={!canSolveDoubts}
                          className="rounded bg-emerald-600 px-4 py-1 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Send Answer
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveAnswerId(d.id);
                        setAnswerText('');
                      }}
                      disabled={!canSolveDoubts}
                      className="rounded bg-blue-900 px-3 py-1.5 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                      Answer Student Query &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE DPP / HOMEWORK MODAL */}
      {showAddHwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900">
              Publish DPP / Chapter Problem Set
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign study problem set to batch: {activeBatch?.name}
            </p>

            <form onSubmit={handleCreateHomework} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DPP-08: Biot-Savart Law Numerical Problems"
                  value={newHwForm.title}
                  onChange={(e) =>
                    setNewHwForm({ ...newHwForm, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newHwForm.subject}
                    onChange={(e) =>
                      setNewHwForm({ ...newHwForm, subject: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newHwForm.dueDate}
                    onChange={(e) =>
                      setNewHwForm({ ...newHwForm, dueDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructions &amp; Problem Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Questions 1 to 25 from Chapter 4 Exercise. Submit written solutions by Friday."
                  value={newHwForm.description}
                  onChange={(e) =>
                    setNewHwForm({ ...newHwForm, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-blue-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHwModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
                >
                  Publish to Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
