import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  HelpCircle,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { SyllabusTopic, DoubtItem } from '../types';

export const AcademicManagementView: React.FC = () => {
  const { batches, syllabus, doubts, submitDoubt, answerDoubt } = useErpData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'syllabus' | 'timetable' | 'doubts'>('syllabus');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || 'batch-1');

  // Doubt submission state
  const [newDoubtQuestion, setNewDoubtQuestion] = useState('');
  const [newDoubtSubject, setNewDoubtSubject] = useState('Physics');

  // Doubt answer modal
  const [activeAnswerDoubtId, setActiveAnswerDoubtId] = useState<string | null>(null);
  const [doubtAnswerText, setDoubtAnswerText] = useState('');

  const activeBatch = batches.find(b => b.id === selectedBatchId);

  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtQuestion.trim()) return;

    submitDoubt({
      subject: newDoubtSubject,
      question: newDoubtQuestion,
    });

    setNewDoubtQuestion('');
  };

  const handleResolveSubmit = (doubtId: string) => {
    if (!doubtAnswerText.trim()) return;
    answerDoubt(doubtId, doubtAnswerText);
    setActiveAnswerDoubtId(null);
    setDoubtAnswerText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Academic Operations
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Delivery, Syllabus &amp; Doubt Desk
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Chapter completion pacing, master timetable, study materials and student query resolution.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'syllabus' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Syllabus Tracker ({syllabus.length})
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'timetable' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Master Timetable
          </button>
          <button
            onClick={() => setActiveTab('doubts')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'doubts' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doubt Desk ({doubts.filter(d => d.status === 'open').length})
          </button>
        </div>
      </div>

      {/* SYLLABUS PROGRESS TAB */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          {/* Syllabus Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {syllabus.map(topic => (
              <div key={topic.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                    {topic.subject} • Ch {topic.chapterNo}
                  </span>
                  <span className="text-xs font-black text-slate-900">{topic.completionPercent}% Done</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{topic.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{topic.className}</p>

                <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-900 rounded-full transition-all"
                    style={{ width: `${topic.completionPercent}%` }}
                  />
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lectures Completed:</span>
                    <span className="font-bold text-slate-900">{topic.completedLectures} / {topic.totalLectures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pacing Status:</span>
                    <span className={`font-bold capitalize ${
                      topic.status === 'completed'
                        ? 'text-emerald-700'
                        : topic.status === 'in_progress'
                        ? 'text-blue-900'
                        : 'text-slate-500'
                    }`}>
                      {topic.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>NEET / JEE Benchmarked</span>
                  </span>
                  <button
                    onClick={() => alert(`Detailed chapter lesson notes for ${topic.title} opened.`)}
                    className="font-bold text-blue-900 hover:underline"
                  >
                    Lesson Plan &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MASTER TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Lecture &amp; Tutorial Schedule</h3>
              <p className="text-xs text-slate-500">Handwara Main Campus • Smart Lecture Halls</p>
            </div>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">
              Active Term Schedule
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="border border-slate-200 p-2.5 text-left">Time Slot</th>
                  <th className="border border-slate-200 p-2.5 text-left">Monday</th>
                  <th className="border border-slate-200 p-2.5 text-left">Tuesday</th>
                  <th className="border border-slate-200 p-2.5 text-left">Wednesday</th>
                  <th className="border border-slate-200 p-2.5 text-left">Thursday</th>
                  <th className="border border-slate-200 p-2.5 text-left">Friday</th>
                  <th className="border border-slate-200 p-2.5 text-left">Saturday</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 p-2.5 font-bold text-blue-900 bg-slate-50">08:30 - 10:00 AM</td>
                  <td className="border border-slate-200 p-2.5 bg-blue-50/50">
                    <p className="font-bold text-blue-900">Physics: Electrodynamics</p>
                    <p className="text-[10px] text-slate-500">Dr. Rahul Sharma (Hall 1)</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Chemistry: Thermodynamics</p>
                    <p className="text-[10px] text-slate-500">Prof. Ananya Sen</p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-blue-50/50">
                    <p className="font-bold text-blue-900">Physics: Problem Solving</p>
                    <p className="text-[10px] text-slate-500">Dr. Rahul Sharma</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Mathematics: Calculus III</p>
                    <p className="text-[10px] text-slate-500">Prof. Vikram Rao</p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-blue-50/50">
                    <p className="font-bold text-blue-900">Physics: Electrodynamics</p>
                    <p className="text-[10px] text-slate-500">Dr. Rahul Sharma</p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-amber-50">
                    <p className="font-bold text-amber-900">Full Mock Diagnostic Test</p>
                    <p className="text-[10px] text-slate-500">OMR Lab (3 Hours)</p>
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-2.5 font-bold text-blue-900 bg-slate-50">10:15 - 11:45 AM</td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Mathematics: Coordinate Geometry</p>
                    <p className="text-[10px] text-slate-500">Prof. Vikram Rao</p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-emerald-50/50">
                    <p className="font-bold text-emerald-900">Biology: Molecular Genetics</p>
                    <p className="text-[10px] text-slate-500">Dr. Bilal Mir</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Chemistry: Coordination Chemistry</p>
                    <p className="text-[10px] text-slate-500">Prof. Ananya Sen</p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-emerald-50/50">
                    <p className="font-bold text-emerald-900">Biology: Human Physiology</p>
                    <p className="text-[10px] text-slate-500">Dr. Bilal Mir</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Mathematics: Definite Integrals</p>
                    <p className="text-[10px] text-slate-500">Prof. Vikram Rao</p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-amber-50">
                    <p className="font-bold text-amber-900">OMR Test Analysis &amp; Ranking</p>
                    <p className="text-[10px] text-slate-500">Combined Seminar</p>
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-2.5 font-bold text-slate-600 bg-slate-100">12:00 - 01:00 PM</td>
                  <td colSpan={6} className="border border-slate-200 p-2 text-center text-slate-500 font-semibold bg-slate-50">
                    LUNCH &amp; FACULTY MENTORING DESK
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-2.5 font-bold text-blue-900 bg-slate-50">01:00 - 02:30 PM</td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Daily Practice Paper (DPP) Clinic</p>
                    <p className="text-[10px] text-slate-500">Self Study + TA Assistance</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Chemistry Lab Demonstration</p>
                    <p className="text-[10px] text-slate-500">Lab Room 2</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">DPP Clinic: Physics Electrostats</p>
                    <p className="text-[10px] text-slate-500">Faculty Mentorship</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Biology Microscopic Slide Study</p>
                    <p className="text-[10px] text-slate-500">Bio Lab</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Weekly Rapid Revision Blitz</p>
                    <p className="text-[10px] text-slate-500">Lecture Hall 1</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">Parent-Faculty Consultation</p>
                    <p className="text-[10px] text-slate-500">By Appointment</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT DOUBT DESK TAB */}
      {activeTab === 'doubts' && (
        <div className="space-y-6">
          {/* Post Doubt Form for Students/Testers */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-blue-900" />
              <span>Ask an Academic Doubt / Query</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Directly routed to subject department mentors. Guaranteed 24hr step-by-step resolution.
            </p>

            <form onSubmit={handleCreateDoubt} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newDoubtSubject}
                    onChange={e => setNewDoubtSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Batch</label>
                  <select
                    value={selectedBatchId}
                    onChange={e => setSelectedBatchId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Question / Concept Uncertainty</label>
                <textarea
                  rows={2}
                  value={newDoubtQuestion}
                  onChange={e => setNewDoubtQuestion(e.target.value)}
                  placeholder="e.g. In Gauss's Law, why is electric flux zero through a closed cylinder if dipole is inside? Please explain step-by-step..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit to Mentor Desk</span>
                </button>
              </div>
            </form>
          </div>

          {/* Doubts List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Active Doubt Queries ({doubts.length})</h3>
            {doubts.map(d => (
              <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700">
                      {d.subject}
                    </span>
                    <span className="font-bold text-slate-900">{d.studentName}</span>
                    <span className="text-[10px] text-slate-400">• {d.date}</span>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    d.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {d.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  "{d.question}"
                </p>

                {d.status === 'answered' ? (
                  <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                      <span>Faculty Answer by {d.answeredBy}:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{d.answer}</p>
                  </div>
                ) : (
                  <div>
                    {activeAnswerDoubtId === d.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={2}
                          value={doubtAnswerText}
                          onChange={e => setDoubtAnswerText(e.target.value)}
                          placeholder="Type step-by-step mentor solution..."
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveAnswerDoubtId(null)}
                            className="rounded border border-slate-300 px-3 py-1 text-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResolveSubmit(d.id)}
                            className="rounded bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700"
                          >
                            Post Solution
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveAnswerDoubtId(d.id);
                          setDoubtAnswerText('');
                        }}
                        className="rounded bg-slate-100 px-3 py-1 font-bold text-blue-900 hover:bg-blue-50"
                      >
                        Answer as Faculty &rarr;
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
