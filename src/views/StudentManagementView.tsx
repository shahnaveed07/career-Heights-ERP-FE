import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  ChevronDown,
  Eye,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  Building,
  GraduationCap,
  X,
  CreditCard,
  Award,
  Layers,
  Calendar,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types';

interface StudentManagementViewProps {
  initialStudentId?: string | null;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({ initialStudentId }) => {
  const { students, branches, batches, addStudent, updateStudent, testResults, documents } = useErpData();
  const { activeBranchFilter } = useAuth();

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>(activeBranchFilter === 'all' ? 'all' : activeBranchFilter);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedScholarship, setSelectedScholarship] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected student for detail drawer/modal
  const [activeStudent, setActiveStudent] = useState<Student | null>(() => {
    if (initialStudentId) {
      return students.find(s => s.id === initialStudentId) || null;
    }
    return null;
  });
  const [activeDetailTab, setActiveDetailTab] = useState<'profile' | 'fees' | 'academic' | 'documents'>('profile');

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    gender: 'Male' as 'Male' | 'Female',
    dob: '2008-05-15',
    email: '',
    phone: '',
    address: '',
    branchId: branches[0]?.id || 'b-hdw',
    batchId: batches[0]?.id || 'batch-jee-a',
    parentName: '',
    parentPhone: '',
    parentOccupation: 'Teacher',
    schoolName: 'Govt Boys Hr Sec School',
    previousPercentage: 88.0,
    admissionSource: 'Direct Walk-in' as const,
    scholarshipType: 'None' as const,
    feesTotal: 95000,
    feesPaid: 35000,
    remarks: '',
  });

  // Filter logic
  const filtered = students.filter(student => {
    // Search matching
    const searchMatch =
      !searchTerm ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      student.parentPhone.includes(searchTerm) ||
      student.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.batchName.toLowerCase().includes(searchTerm.toLowerCase());

    // Branch match
    const branchMatch = selectedBranch === 'all' || student.branchId === selectedBranch;

    // Batch match
    const batchMatch = selectedBatch === 'all' || student.batchId === selectedBatch;

    // Status match
    const statusMatch = selectedStatus === 'all' || student.status === selectedStatus;

    // Scholarship match
    const scholarshipMatch =
      selectedScholarship === 'all' ||
      (selectedScholarship === 'scholarship' ? student.scholarshipPercent > 0 : student.scholarshipPercent === 0);

    return searchMatch && branchMatch && batchMatch && statusMatch && scholarshipMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedStudents = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name || !newStudentForm.parentName) {
      alert('Please fill out student name and parent information.');
      return;
    }

    const created = addStudent({
      ...newStudentForm,
      previousPercentage: Number(newStudentForm.previousPercentage),
      feesTotal: Number(newStudentForm.feesTotal),
      feesPaid: Number(newStudentForm.feesPaid),
      scholarshipPercent: newStudentForm.scholarshipType.includes('100')
        ? 100
        : newStudentForm.scholarshipType.includes('75')
        ? 75
        : newStudentForm.scholarshipType.includes('50')
        ? 50
        : 0,
    });

    setShowAddModal(false);
    setActiveStudent(created);
  };

  const studentResults = activeStudent ? testResults.filter(r => r.studentId === activeStudent.id) : [];
  const studentDocs = activeStudent ? documents.filter(d => d.entityId === activeStudent.id) : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Management Roster
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Unified student directory with multi-branch search, academic tracking, and compliance vault.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, ID (CH-2026-001), phone, batch..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-hidden"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={e => {
                setSelectedBranch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-white focus:border-blue-900 focus:outline-hidden"
            >
              <option value="all">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} Campus</option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={selectedBatch}
              onChange={e => {
                setSelectedBatch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-white focus:border-blue-900 focus:outline-hidden"
            >
              <option value="all">All Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.branchName}: {b.name}</option>
              ))}
            </select>
          </div>

          {/* Status & Scholarship Quick Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-white focus:border-blue-900 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Enrolled</option>
              <option value="at_risk">At Academic Risk (&lt;75% Att)</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Results count & active filter badges */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing <strong>{filtered.length}</strong> matching candidates</span>
          {(searchTerm || selectedBranch !== 'all' || selectedBatch !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBranch('all');
                setSelectedBatch('all');
                setSelectedStatus('all');
                setSelectedScholarship('all');
              }}
              className="text-blue-900 font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Student Profile</th>
                <th className="py-3 px-4 text-left">Student ID &amp; Adm No</th>
                <th className="py-3 px-4 text-left">Branch &amp; Batch</th>
                <th className="py-3 px-4 text-left">Parent / Contact</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4 text-right">Fee Dues</th>
                <th className="py-3 px-4 text-center">Scholarship</th>
                <th className="py-3 px-4 text-center">Risk Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/80 transition ${
                      activeStudent?.id === student.id ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                          <p className="text-[11px] text-slate-400">{student.gender} • Prev: {student.previousPercentage}%</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                        {student.studentId}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{student.admissionNo}</p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{student.batchName}</div>
                      <div className="text-[11px] text-slate-500">{student.branchName} • {student.className}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{student.parentName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{student.parentPhone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 font-bold ${
                          student.attendanceRate < 75
                            ? 'bg-red-100 text-red-800'
                            : student.attendanceRate < 80
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {student.attendanceRate}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {student.feesPending === 0 ? (
                        <span className="text-emerald-700 font-bold">Paid</span>
                      ) : student.feesOverdue > 0 ? (
                        <div>
                          <span className="text-red-700 font-extrabold">₹{student.feesOverdue.toLocaleString()}</span>
                          <p className="text-[9px] text-red-500 uppercase font-semibold">Overdue</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-slate-800 font-semibold">₹{student.feesPending.toLocaleString()}</span>
                          <p className="text-[9px] text-slate-400">Scheduled</p>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          student.scholarshipPercent > 0
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {student.scholarshipType}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                          student.academicRisk === 'Critical'
                            ? 'bg-red-500 text-white'
                            : student.academicRisk === 'Medium'
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {student.academicRisk}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveStudent(student);
                          setActiveDetailTab('profile');
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-900 hover:bg-blue-50 transition shadow-2xs"
                      >
                        Profile &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-slate-50/50 text-xs">
          <span className="text-slate-500">
            Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Student Detail Modal / Drawer */}
      {activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeStudent.photo}
                  alt={activeStudent.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-900/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{activeStudent.name}</h2>
                    <span className="rounded bg-blue-900 px-2 py-0.2 font-mono text-[11px] font-bold text-white">
                      {activeStudent.studentId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeStudent.branchName} • {activeStudent.batchName} • {activeStudent.className}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveStudent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6">
              {[
                { id: 'profile', label: 'Student Profile' },
                { id: 'fees', label: 'Fee Ledger' },
                { id: 'academic', label: 'Test Marks & Ranks' },
                { id: 'documents', label: 'Documents Vault' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveDetailTab(t.id as any)}
                  className={`py-3 px-4 text-xs font-bold transition border-b-2 ${
                    activeDetailTab === t.id
                      ? 'border-blue-900 text-blue-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {activeDetailTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* General Info */}
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Academic &amp; Enrolment</h3>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Admission Number:</span>
                      <span className="font-semibold text-slate-800">{activeStudent.admissionNo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Admission Date:</span>
                      <span className="font-semibold text-slate-800">{activeStudent.admissionDate}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Admission Source:</span>
                      <span className="font-semibold text-slate-800">{activeStudent.admissionSource}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Scholarship Slabs:</span>
                      <span className="font-bold text-indigo-700">{activeStudent.scholarshipType}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Current Attendance:</span>
                      <span className="font-black text-emerald-700">{activeStudent.attendanceRate}%</span>
                    </div>
                  </div>

                  {/* Guardian & School info */}
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Parent &amp; School Record</h3>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Guardian Name:</span>
                      <span className="font-semibold text-slate-800">{activeStudent.parentName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Guardian Phone:</span>
                      <span className="font-semibold text-slate-800">{activeStudent.parentPhone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Parent Occupation:</span>
                      <span className="font-semibold text-slate-800">{activeStudent.parentOccupation}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Previous School:</span>
                      <span className="font-semibold text-slate-800">{activeStudent.schoolName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Class 10 Percentage:</span>
                      <span className="font-bold text-slate-900">{activeStudent.previousPercentage}%</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 rounded-xl border border-slate-200 p-4 bg-white">
                    <h3 className="font-bold text-slate-900 text-xs mb-1">Mentor Remarks &amp; Observations</h3>
                    <p className="text-slate-600 leading-relaxed">{activeStudent.remarks}</p>
                  </div>
                </div>
              )}

              {activeDetailTab === 'fees' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Course Fee</span>
                      <p className="text-lg font-black text-slate-900 mt-1">₹{activeStudent.feesTotal.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 p-3 bg-emerald-50 text-center">
                      <span className="text-[10px] text-emerald-700 uppercase font-semibold">Total Paid</span>
                      <p className="text-lg font-black text-emerald-800 mt-1">₹{activeStudent.feesPaid.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-red-200 p-3 bg-red-50 text-center">
                      <span className="text-[10px] text-red-700 uppercase font-semibold">Balance Due</span>
                      <p className="text-lg font-black text-red-800 mt-1">₹{activeStudent.feesPending.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <h4 className="font-bold text-slate-800 mb-2">Tuition Installments Status</h4>
                    <p className="text-slate-500 text-xs">
                      {activeStudent.feesPending === 0
                        ? 'All installments for the 2025-26 academic session have been cleared.'
                        : `Next installment of ₹${activeStudent.feesPending.toLocaleString()} scheduled for recovery.`}
                    </p>
                  </div>
                </div>
              )}

              {activeDetailTab === 'academic' && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Diagnostic &amp; Test Series Marks</h4>
                  {studentResults.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 p-6 text-center text-slate-400">
                      No official test records logged yet for this candidate.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studentResults.map(res => (
                        <div key={res.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-900">{res.testTitle}</h5>
                            <span className="rounded bg-blue-900 px-2 py-0.5 font-bold text-white text-[10px]">
                              Percentile: {res.percentile}%
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="bg-white p-2 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-400">Score</span>
                              <p className="font-bold text-slate-900">{res.totalMarksObtained} / {res.totalMaxMarks}</p>
                            </div>
                            <div className="bg-white p-2 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-400">Batch Rank</span>
                              <p className="font-bold text-blue-900">#{res.batchRank}</p>
                            </div>
                            <div className="bg-white p-2 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-400">Branch Rank</span>
                              <p className="font-bold text-indigo-900">#{res.branchRank}</p>
                            </div>
                            <div className="bg-white p-2 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-400">Institute Rank</span>
                              <p className="font-bold text-purple-900">#{res.instituteRank}</p>
                            </div>
                          </div>
                          {res.weakTopics.length > 0 && (
                            <div className="mt-2 text-[11px] text-slate-600">
                              <span className="font-semibold text-red-700">Areas for Improvement: </span>
                              {res.weakTopics.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'documents' && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Verification Vault</h4>
                  <div className="space-y-2">
                    {studentDocs.length === 0 ? (
                      <p className="text-slate-400">No documents submitted yet.</p>
                    ) : (
                      studentDocs.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                          <div>
                            <p className="font-bold text-slate-800">{d.docType}</p>
                            <p className="text-[10px] text-slate-400">{d.fileName} • {d.fileSize}</p>
                          </div>
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            d.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {d.status.toUpperCase()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex justify-end">
              <button
                onClick={() => setActiveStudent(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-900" />
                <span>New Student Admission Form</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.name}
                    onChange={e => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    placeholder="e.g. Mehreen Qureshi"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender &amp; DOB</label>
                  <div className="flex gap-2">
                    <select
                      value={newStudentForm.gender}
                      onChange={e => setNewStudentForm({ ...newStudentForm, gender: e.target.value as any })}
                      className="w-1/2 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <input
                      type="date"
                      value={newStudentForm.dob}
                      onChange={e => setNewStudentForm({ ...newStudentForm, dob: e.target.value })}
                      className="w-1/2 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Branch *</label>
                  <select
                    value={newStudentForm.branchId}
                    onChange={e => setNewStudentForm({ ...newStudentForm, branchId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} Campus</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Batch *</label>
                  <select
                    value={newStudentForm.batchId}
                    onChange={e => setNewStudentForm({ ...newStudentForm, batchId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.branchName}: {b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.parentName}
                    onChange={e => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                    placeholder="e.g. Farooq Ahmad"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guardian Phone *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.parentPhone}
                    onChange={e => setNewStudentForm({ ...newStudentForm, parentPhone: e.target.value })}
                    placeholder="+91 94190..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Previous School &amp; %</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStudentForm.schoolName}
                      onChange={e => setNewStudentForm({ ...newStudentForm, schoolName: e.target.value })}
                      placeholder="School name"
                      className="w-2/3 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                    <input
                      type="number"
                      value={newStudentForm.previousPercentage}
                      onChange={e => setNewStudentForm({ ...newStudentForm, previousPercentage: Number(e.target.value) })}
                      placeholder="%"
                      className="w-1/3 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scholarship Type</label>
                  <select
                    value={newStudentForm.scholarshipType}
                    onChange={e => setNewStudentForm({ ...newStudentForm, scholarshipType: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="None">None (Standard Tuition)</option>
                    <option value="CHTQ 100%">CHTQ 100% Waiver</option>
                    <option value="CHTQ 75%">CHTQ 75% Waiver</option>
                    <option value="CHTQ 50%">CHTQ 50% Waiver</option>
                    <option value="BPL Concession">BPL Concession (40%)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-5 py-2 font-bold text-white hover:bg-blue-800"
                >
                  Confirm &amp; Enrol Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
