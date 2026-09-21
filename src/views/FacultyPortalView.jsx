import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useErpData } from '../context/ErpDataContext';
import { StudentAvatar } from '../components/common/StudentAvatar';
export const FacultyPortalView = () => {
  const { currentUser } = useAuth();
  const { batches, timetable, syllabus, doubts, answerDoubt, employees } =
    useErpData();
  const [activeTab, setActiveTab] = useState('schedule');
  const [activeAnswerId, setActiveAnswerId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const facultyProfile =
    employees.find((e) => e.email === currentUser?.email) || employees[0];
  const handleResolveDoubt = (id) => {
    if (!answerText.trim()) return;
    answerDoubt(id, answerText);
    setActiveAnswerId(null);
    setAnswerText('');
  };
  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <StudentAvatar
              photo={currentUser?.avatar || facultyProfile?.photo}
              name={
                currentUser?.name || facultyProfile?.name || 'Faculty Member'
              }
              size="xl"
              className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Senior Faculty Portal
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Biometric In: 08:15 AM
                </span>
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight">
                {currentUser?.name || facultyProfile?.name}
              </h1>
              <p className="text-xs text-blue-200">
                Department: {facultyProfile?.department} • Handwara Campus •
                Code: {facultyProfile?.empCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-xs">
              <span className="block text-[10px] text-blue-200">
                Assigned Batches
              </span>
              <span className="text-xl font-black">{batches.length}</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-xs">
              <span className="block text-[10px] text-blue-200">
                Pending Doubts
              </span>
              <span className="text-xl font-black text-amber-300">
                {doubts.filter((d) => d.status === 'open').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 rounded py-2 transition ${activeTab === 'schedule' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Today's Lectures &amp; Schedule
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex-1 rounded py-2 transition ${activeTab === 'syllabus' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Syllabus Delivery Pacing
        </button>
        <button
          onClick={() => setActiveTab('doubts')}
          className={`flex-1 rounded py-2 transition ${activeTab === 'doubts' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Doubt Clarification Desk (
          {doubts.filter((d) => d.status === 'open').length})
        </button>
      </div>

      {/* SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Today's Class Roster &amp; Smart Rooms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-blue-900">
                  08:30 - 10:00 AM
                </span>
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
                <strong className="text-emerald-700">
                  42 / 45 Present (93%)
                </strong>
              </div>
            </div>

            <div className="rounded-xl border-2 border-blue-900 bg-blue-50/20 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-blue-900">
                  10:15 - 11:45 AM
                </span>
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
                <span className="font-bold text-slate-700">
                  01:00 - 02:30 PM
                </span>
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
                <strong className="text-slate-800">
                  Doubts &amp; DPP Analysis
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SYLLABUS */}
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
                    Lectures Delivered: {topic.completedLectures} /{' '}
                    {topic.totalLectures}
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

      {/* DOUBTS */}
      {activeTab === 'doubts' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Student Doubts Awaiting Your Resolution
          </h3>
          {doubts.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm">
                    {d.studentName}
                  </span>
                  <span className="text-slate-500 ml-2 font-mono text-[10px]">
                    {d.studentCode}
                  </span>
                  <span className="text-slate-400 ml-2">• {d.date}</span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${d.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
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
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveAnswerId(null)}
                          className="rounded border border-slate-300 px-3 py-1 font-semibold text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResolveDoubt(d.id)}
                          className="rounded bg-emerald-600 px-4 py-1 font-bold text-white hover:bg-emerald-700"
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
                      className="rounded bg-blue-900 px-3 py-1.5 font-bold text-white hover:bg-blue-800"
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
    </div>
  );
};
