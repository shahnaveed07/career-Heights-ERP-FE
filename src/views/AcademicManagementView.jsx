import { useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  Send,
  BookOpen,
  Layers,
  UserCheck,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  Edit2,
  X,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';

export const AcademicManagementView = () => {
  const {
    batches,
    syllabus,
    doubts,
    submitDoubt,
    answerDoubt,
    subjects,
    subjectCombos,
    teacherAssignments,
    addSubject,
    updateSubject,
    deleteSubject,
    addSubjectCombo,
    deleteSubjectCombo,
    addTeacherAssignment,
    deleteTeacherAssignment,
    branches,
    wings,
    classes,
    employees,
  } = useErpData();
  const { currentUser, uiMode, can, activeBranchFilter } = useAuth();
  const [activeTab, setActiveTab] = useState('syllabus');
  const [selectedBatchId, setSelectedBatchId] = useState(
    batches[0]?.id || 'batch-1'
  );
  const [newDoubtQuestion, setNewDoubtQuestion] = useState('');
  const [newDoubtSubject, setNewDoubtSubject] = useState('Physics');
  const [activeAnswerDoubtId, setActiveAnswerDoubtId] = useState(null);
  const [doubtAnswerText, setDoubtAnswerText] = useState('');

  // Subject Master Modal
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectForm, setNewSubjectForm] = useState({
    name: '',
    code: '',
    category: 'Science',
    description: '',
    color: 'blue',
  });

  // Subject Combo Modal
  const [showAddComboModal, setShowAddComboModal] = useState(false);
  const [newComboForm, setNewComboForm] = useState({
    name: '',
    code: '',
    wingId: 'w-med',
    description: '',
    subjectIds: ['sub-phy', 'sub-chem', 'sub-bot', 'sub-zoo'],
  });

  // Teacher Assignment Modal
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    teacherId: 'emp-002',
    branchId: 'b-hdw',
    classId: 'c-12',
    wingId: 'w-med',
    batchId: 'batch-neet-a',
    subjectId: 'sub-phy',
  });

  const activeBatch = batches.find((b) => b.id === selectedBatchId);

  const handleCreateDoubt = (e) => {
    e.preventDefault();
    if (!newDoubtQuestion.trim()) return;
    submitDoubt({
      subject: newDoubtSubject,
      question: newDoubtQuestion,
    });
    setNewDoubtQuestion('');
  };

  const handleResolveSubmit = (doubtId) => {
    if (!doubtAnswerText.trim()) return;
    answerDoubt(doubtId, doubtAnswerText);
    setActiveAnswerDoubtId(null);
    setDoubtAnswerText('');
  };

  const handleAddSubjectSubmit = (e) => {
    e.preventDefault();
    if (!newSubjectForm.name.trim()) return;
    addSubject(newSubjectForm);
    setNewSubjectForm({
      name: '',
      code: '',
      category: 'Science',
      description: '',
      color: 'blue',
    });
    setShowAddSubjectModal(false);
  };

  const handleAddComboSubmit = (e) => {
    e.preventDefault();
    if (!newComboForm.name.trim() || newComboForm.subjectIds.length === 0) return;
    addSubjectCombo(newComboForm);
    setNewComboForm({
      name: '',
      code: '',
      wingId: 'w-med',
      description: '',
      subjectIds: [],
    });
    setShowAddComboModal(false);
  };

  const handleAssignTeacherSubmit = (e) => {
    e.preventDefault();
    const teacher = employees.find((emp) => emp.id === assignmentForm.teacherId);
    const branch = branches.find((b) => b.id === assignmentForm.branchId);
    const cls = classes.find((c) => c.id === assignmentForm.classId);
    const wing = wings.find((w) => w.id === assignmentForm.wingId);
    const batch = batches.find((b) => b.id === assignmentForm.batchId);
    const subject = subjects.find((s) => s.id === assignmentForm.subjectId);

    addTeacherAssignment({
      teacherId: assignmentForm.teacherId,
      teacherName: teacher?.name || 'Assigned Faculty',
      branchId: assignmentForm.branchId,
      branchName: branch?.name || 'Handwara',
      classId: assignmentForm.classId,
      className: cls?.name || 'Class 12th',
      wingId: assignmentForm.wingId,
      wingName: wing?.name || 'Medical Wing',
      batchId: assignmentForm.batchId,
      batchName: batch?.name || 'NEET Achievers',
      subjectId: assignmentForm.subjectId,
      subjectName: subject?.name || 'Physics',
    });
    setShowAssignTeacherModal(false);
  };

  const isViewOnly = uiMode === 'view' || !can('academic', 'edit');
  const canAddAcademic = can('academic', 'add');
  const canEditAcademic = can('academic', 'edit');
  const canDeleteAcademic = can('academic', 'delete');
  const canSolveDoubts = can('academic', 'solve_doubts') || can('academic', 'edit');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Academic Hierarchy & Master
            </span>
            {isViewOnly && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                View Only
              </span>
            )}
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Master, Subject Combos &amp; Delivery
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Hierarchy: Branch → Class → Wing → Batch → Student. Subject combos serve as templates; student subject enrollment is stored per student.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap rounded-lg border border-slate-200 bg-white p-1 gap-1">
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${activeTab === 'syllabus' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Syllabus Tracker ({syllabus.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'subjects' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Subject Master ({subjects?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('combos')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'combos' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Combos / Streams ({subjectCombos?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'assignments' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Teacher Allocations ({teacherAssignments?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${activeTab === 'timetable' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Timetable
          </button>
          <button
            onClick={() => setActiveTab('doubts')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${activeTab === 'doubts' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Doubts ({doubts.filter((d) => d.status === 'open').length})
          </button>
        </div>
      </div>

      {/* SUBJECT MASTER TAB */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Subject Master Catalog</h2>
              <p className="text-xs text-slate-500">
                Foundational subjects offered across Career Heights campuses.
              </p>
            </div>
            {!isViewOnly && (
              <button
                onClick={() => setShowAddSubjectModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add Subject</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects?.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-blue-50 text-blue-800 font-mono text-xs font-bold px-2 py-0.5 border border-blue-200">
                      {sub.code}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {sub.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{sub.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{sub.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">ID: {sub.id}</span>
                  {!isViewOnly && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete subject ${sub.name}?`)) {
                          deleteSubject(sub.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete Subject"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBJECT COMBOS TAB */}
      {activeTab === 'combos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Subject Combinations (Stream Templates)</h2>
              <p className="text-xs text-slate-500">
                Preset subject packages used during enrollment. Student final subject enrollment is stored individually per student.
              </p>
            </div>
            {!isViewOnly && (
              <button
                onClick={() => setShowAddComboModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Create Combo Preset</span>
              </button>
            )}
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-800 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>Academic Architecture Directive:</strong> A Subject Combination (e.g. Medical: Physics, Chemistry, Botany, Zoology) is ONLY a preset template for fast batch configuration. In Career Heights ERP, every student can enroll in individual subjects (e.g., Physics only, Chemistry + Botany, or custom combinations) independent of the preset template.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectCombos?.map((combo) => {
              const comboSubjects = subjects?.filter((s) => combo.subjectIds?.includes(s.id)) || [];
              return (
                <div
                  key={combo.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {combo.code}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {combo.wingId}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-base">{combo.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{combo.description}</p>

                    <div className="mt-4">
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                        Included Subjects ({comboSubjects.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {comboSubjects.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 border border-slate-200"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            {s.name} ({s.code})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Template Code: {combo.id}</span>
                    {!isViewOnly && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete combo template ${combo.name}?`)) {
                            deleteSubjectCombo(combo.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Combo Preset"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FACULTY ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Faculty Academic Workload &amp; Allocation</h2>
              <p className="text-xs text-slate-500">
                Hierarchical mapping: Teacher → Branch → Class → Wing → Batch → Subject. Faculty members only access students enrolled in their assigned subject.
              </p>
            </div>
            {!isViewOnly && (
              <button
                onClick={() => setShowAssignTeacherModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Assign Faculty to Batch</span>
              </button>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Class &amp; Wing</th>
                    <th className="py-3 px-4">Assigned Batch</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherAssignments?.map((ta) => (
                    <tr key={ta.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs">
                            {ta.teacherName.charAt(0)}
                          </span>
                          <div>
                            <div>{ta.teacherName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">ID: {ta.teacherId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-blue-800 border border-blue-200">
                          {ta.subjectName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{ta.branchName}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {ta.className} • {ta.wingName}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{ta.batchName}</td>
                      <td className="py-3 px-4 text-right">
                        {!isViewOnly ? (
                          <button
                            onClick={() => {
                              if (confirm(`Remove assignment for ${ta.teacherName}?`)) {
                                deleteTeacherAssignment(ta.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove assignment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SYLLABUS PROGRESS TAB */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          {/* Syllabus Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {syllabus.map((topic) => (
              <div
                key={topic.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                    {topic.subject} • Ch {topic.chapterNo}
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {topic.completionPercent}% Done
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">
                  {topic.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {topic.className}
                </p>

                <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-900 rounded-full transition-all"
                    style={{ width: `${topic.completionPercent}%` }}
                  />
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lectures Completed:</span>
                    <span className="font-bold text-slate-900">
                      {topic.completedLectures} / {topic.totalLectures}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pacing Status:</span>
                    <span
                      className={`font-bold capitalize ${topic.status === 'completed' ? 'text-emerald-700' : topic.status === 'in_progress' ? 'text-blue-900' : 'text-slate-500'}`}
                    >
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
                    onClick={() =>
                      alert(
                        `Detailed chapter lesson notes for ${topic.title} opened.`
                      )
                    }
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
              <h3 className="text-sm font-bold text-slate-900">
                Weekly Lecture &amp; Tutorial Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Handwara Main Campus • Smart Lecture Halls
              </p>
            </div>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">
              Active Term Schedule
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="border border-slate-200 p-2.5 text-left">
                    Time Slot
                  </th>
                  <th className="border border-slate-200 p-2.5 text-left">
                    Monday
                  </th>
                  <th className="border border-slate-200 p-2.5 text-left">
                    Tuesday
                  </th>
                  <th className="border border-slate-200 p-2.5 text-left">
                    Wednesday
                  </th>
                  <th className="border border-slate-200 p-2.5 text-left">
                    Thursday
                  </th>
                  <th className="border border-slate-200 p-2.5 text-left">
                    Friday
                  </th>
                  <th className="border border-slate-200 p-2.5 text-left">
                    Saturday
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 p-2.5 font-bold text-blue-900 bg-slate-50">
                    08:30 - 10:00 AM
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-blue-50/50">
                    <p className="font-bold text-blue-900">
                      Physics: Electrodynamics
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Dr. Rahul Sharma (Hall 1)
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Chemistry: Thermodynamics
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Prof. Ananya Sen
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-blue-50/50">
                    <p className="font-bold text-blue-900">
                      Physics: Problem Solving
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Dr. Rahul Sharma
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Mathematics: Calculus III
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Prof. Vikram Rao
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-blue-50/50">
                    <p className="font-bold text-blue-900">
                      Physics: Electrodynamics
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Dr. Rahul Sharma
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-amber-50">
                    <p className="font-bold text-amber-900">
                      Full Mock Diagnostic Test
                    </p>
                    <p className="text-[10px] text-slate-500">
                      OMR Lab (3 Hours)
                    </p>
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-2.5 font-bold text-blue-900 bg-slate-50">
                    10:15 - 11:45 AM
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Mathematics: Coordinate Geometry
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Prof. Vikram Rao
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-emerald-50/50">
                    <p className="font-bold text-emerald-900">
                      Biology: Molecular Genetics
                    </p>
                    <p className="text-[10px] text-slate-500">Dr. Bilal Mir</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Chemistry: Coordination Chemistry
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Prof. Ananya Sen
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-emerald-50/50">
                    <p className="font-bold text-emerald-900">
                      Biology: Human Physiology
                    </p>
                    <p className="text-[10px] text-slate-500">Dr. Bilal Mir</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Mathematics: Definite Integrals
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Prof. Vikram Rao
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5 bg-amber-50">
                    <p className="font-bold text-amber-900">
                      OMR Test Analysis &amp; Ranking
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Combined Seminar
                    </p>
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-2.5 font-bold text-slate-600 bg-slate-100">
                    12:00 - 01:00 PM
                  </td>
                  <td
                    colSpan={6}
                    className="border border-slate-200 p-2 text-center text-slate-500 font-semibold bg-slate-50"
                  >
                    LUNCH &amp; FACULTY MENTORING DESK
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-2.5 font-bold text-blue-900 bg-slate-50">
                    01:00 - 02:30 PM
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Daily Practice Paper (DPP) Clinic
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Self Study + TA Assistance
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Chemistry Lab Demonstration
                    </p>
                    <p className="text-[10px] text-slate-500">Lab Room 2</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      DPP Clinic: Physics Electrostats
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Faculty Mentorship
                    </p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Biology Microscopic Slide Study
                    </p>
                    <p className="text-[10px] text-slate-500">Bio Lab</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Weekly Rapid Revision Blitz
                    </p>
                    <p className="text-[10px] text-slate-500">Lecture Hall 1</p>
                  </td>
                  <td className="border border-slate-200 p-2.5">
                    <p className="font-bold text-slate-800">
                      Parent-Faculty Consultation
                    </p>
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
              Directly routed to subject department mentors. Guaranteed 24hr
              step-by-step resolution.
            </p>

            <form onSubmit={handleCreateDoubt} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={newDoubtSubject}
                    onChange={(e) => setNewDoubtSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Batch
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Question / Concept Uncertainty
                </label>
                <textarea
                  rows={2}
                  value={newDoubtQuestion}
                  onChange={(e) => setNewDoubtQuestion(e.target.value)}
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
            <h3 className="text-sm font-bold text-slate-900">
              Active Doubt Queries ({doubts.length})
            </h3>
            {doubts.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700">
                      {d.subject}
                    </span>
                    <span className="font-bold text-slate-900">
                      {d.studentName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • {d.date}
                    </span>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${d.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                  >
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
                          onChange={(e) => setDoubtAnswerText(e.target.value)}
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
                            disabled={!canSolveDoubts}
                            className="rounded bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Post Solution
                          </button>
                        </div>
                      </div>
                    ) : (
                      canSolveDoubts ? (
                        <button
                          onClick={() => {
                            setActiveAnswerDoubtId(d.id);
                            setDoubtAnswerText('');
                          }}
                          className="rounded bg-slate-100 px-3 py-1 font-bold text-blue-900 hover:bg-blue-50"
                        >
                          Answer as Faculty &rarr;
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Resolution Pending</span>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add New Academic Subject</h3>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubjectSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry, Applied Physics"
                  value={newSubjectForm.name}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. PHY-101"
                    value={newSubjectForm.code}
                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, code: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newSubjectForm.category}
                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Language">Language</option>
                    <option value="Foundation">Foundation</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Syllabus Scope</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of academic scope..."
                  value={newSubjectForm.description}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-4 py-1.5 font-bold text-white hover:bg-blue-800"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COMBO */}
      {showAddComboModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Create Subject Combo Preset</h3>
                <p className="text-[11px] text-slate-500">Preset template for fast batch mapping</p>
              </div>
              <button
                onClick={() => setShowAddComboModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddComboSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Combo Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Medical NEET Core"
                    value={newComboForm.name}
                    onChange={(e) => setNewComboForm({ ...newComboForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Combo Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MED-NEET"
                    value={newComboForm.code}
                    onChange={(e) => setNewComboForm({ ...newComboForm, code: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Wing</label>
                <select
                  value={newComboForm.wingId}
                  onChange={(e) => setNewComboForm({ ...newComboForm, wingId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  {wings?.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Included Subjects (Minimum 1)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                  {subjects?.map((s) => {
                    const isChecked = newComboForm.subjectIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition ${isChecked ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewComboForm({
                                ...newComboForm,
                                subjectIds: [...newComboForm.subjectIds, s.id],
                              });
                            } else {
                              setNewComboForm({
                                ...newComboForm,
                                subjectIds: newComboForm.subjectIds.filter((id) => id !== s.id),
                              });
                            }
                          }}
                          className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                        />
                        <span className="text-xs">{s.name} ({s.code})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes about this combination..."
                  value={newComboForm.description}
                  onChange={(e) => setNewComboForm({ ...newComboForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddComboModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-4 py-1.5 font-bold text-white hover:bg-blue-800"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TEACHER */}
      {showAssignTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Assign Faculty to Academic Batch</h3>
                <p className="text-[11px] text-slate-500">Teacher → Branch → Class → Wing → Batch → Subject</p>
              </div>
              <button
                onClick={() => setShowAssignTeacherModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAssignTeacherSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Faculty Member</label>
                <select
                  value={assignmentForm.teacherId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, teacherId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  {employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={assignmentForm.subjectId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, subjectId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch</label>
                  <select
                    value={assignmentForm.branchId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, branchId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {branches?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={assignmentForm.classId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, classId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {classes?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wing</label>
                  <select
                    value={assignmentForm.wingId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, wingId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {wings?.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch</label>
                  <select
                    value={assignmentForm.batchId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, batchId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {batches?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignTeacherModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-4 py-1.5 font-bold text-white hover:bg-blue-800"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
