import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  UploadCloud,
  FileCheck2,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  BarChart2,
  Scan,
  RefreshCw,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { ExamTest, TestResult } from '../types';
import { getFutureDateString } from '../utils/dateUtils';

export const ExaminationOmrView: React.FC = () => {
  const { tests, testResults, addTest, runOmrSimulation, batches } = useErpData();
  const { activeBranchFilter } = useAuth();

  const [selectedTestId, setSelectedTestId] = useState<string>(tests[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'tests' | 'omr_scanner' | 'ranks'>('tests');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  const uniqueCourses = Array.from(new Set(tests.map(t => t.course).filter(Boolean)));
  const uniqueClasses = Array.from(new Set(tests.map(t => t.className).filter(Boolean)));

  const filteredTests = tests.filter(t => {
    if (selectedCourseFilter !== 'all' && t.course !== selectedCourseFilter) return false;
    if (selectedClassFilter !== 'all' && t.className !== selectedClassFilter) return false;
    return true;
  });

  // New Test Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTestForm, setNewTestForm] = useState({
    title: 'AIIMS & NEET Mock Marathon - Phase 2',
    testType: 'offline_omr' as const,
    testDate: getFutureDateString(7),
    batchId: batches[0]?.id || 'batch-1',
    totalMarks: 720,
    course: 'NEET Dropper Medical',
    className: 'Class 12 Medical',
    branchName: 'Handwara Campus',
    durationMinutes: 180,
  });

  // OMR Scanner State
  const [omrProcessing, setOmrProcessing] = useState(false);
  const [omrProcessedSuccess, setOmrProcessedSuccess] = useState<string | null>(null);

  const activeTest = tests.find(t => t.id === selectedTestId);
  const activeTestResults = testResults.filter(r => r.testId === selectedTestId);

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    addTest({
      title: newTestForm.title,
      testType: newTestForm.testType,
      testDate: newTestForm.testDate,
      batchId: newTestForm.batchId,
      totalMarks: Number(newTestForm.totalMarks),
      course: newTestForm.course,
      className: newTestForm.className,
      durationMinutes: newTestForm.durationMinutes,
      status: 'scheduled',
      subjects: [
        { name: 'Physics', maxMarks: 180 },
        { name: 'Chemistry', maxMarks: 180 },
        { name: 'Biology', maxMarks: 360 },
      ],
    });
    setShowCreateModal(false);
  };

  const handleSimulateOmrScan = () => {
    setOmrProcessing(true);
    setOmrProcessedSuccess(null);

    setTimeout(() => {
      runOmrSimulation(selectedTestId);
      setOmrProcessing(false);
      setOmrProcessedSuccess(`Successfully scanned 120 Optical OMR bubble sheets for ${activeTest?.title}. Processed batch ranks, negative marks, and weak-topic diagnostics!`);
      setActiveTab('ranks');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
              Examination &amp; Assessment Engine
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Test Series, OMR Optical Scanner &amp; All-India Ranks
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Automated OMR answer key scoring, negative marking (+4 / -1), and percentile rank lists.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('tests')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'tests' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scheduled Tests
          </button>
          <button
            onClick={() => setActiveTab('omr_scanner')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'omr_scanner' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            OMR Scanner Studio
          </button>
          <button
            onClick={() => setActiveTab('ranks')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'ranks' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rank List &amp; Analytics
          </button>
        </div>
      </div>

      {omrProcessedSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{omrProcessedSuccess}</span>
        </div>
      )}

      {/* SCHEDULED TESTS TAB */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Career Heights Diagnostic Series</h3>
              <p className="text-xs text-slate-500">Filter examinations by enrolled course and class wing</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCourseFilter}
                onChange={e => setSelectedCourseFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Classes</option>
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" />
                <span>Schedule New Test</span>
              </button>
            </div>
          </div>

          {filteredTests.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              No examination series found matching the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map(test => (
                <div
                  key={test.id}
                  onClick={() => setSelectedTestId(test.id)}
                  className={`cursor-pointer rounded-xl border p-5 transition text-left relative ${
                    selectedTestId === test.id
                      ? 'border-blue-900 bg-blue-50/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {test.testType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{test.testDate}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{test.title}</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    {test.course} • {test.className} • Max Marks: {test.totalMarks}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Results: <strong>{testResults.filter(r => r.testId === test.id).length} Evaluated</strong>
                    </span>
                    <span className="font-bold text-blue-900 hover:underline">
                      View Ranks &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OMR SCANNER STUDIO TAB */}
      {activeTab === 'omr_scanner' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scan className="h-5 w-5 text-blue-900" />
                <span>Optical Mark Recognition (OMR) Rapid Ingestion Studio</span>
              </h3>
              <p className="text-xs text-slate-500">
                Process scanned physical bubble sheets with automatic answer key matching, error-margin validation, and rank compilation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Active Test:</label>
              <select
                value={selectedTestId}
                onChange={e => setSelectedTestId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                {tests.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* OMR Sheet Preview & Simulation Drag Box */}
            <div className="lg:col-span-7 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center mb-3">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Upload OMR Batch Scans (TIFF/PDF/JPG)</h4>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                Optical engine reads 200 sheets per minute. Barcode decoder automatically binds candidate rolls.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  disabled={omrProcessing}
                  onClick={handleSimulateOmrScan}
                  className="flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-800 disabled:opacity-50"
                >
                  {omrProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Reading OMR Bubbles &amp; Scoring...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4" />
                      <span>Run Optical OMR Batch Simulation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample Bubble Grid Simulation */}
              <div className="mt-6 w-full max-w-md bg-white p-4 rounded-xl border border-slate-200 text-left">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2 border-b pb-1">
                  <span>Sample Bubble Sheet Scanner Preview</span>
                  <span className="font-mono text-blue-900">OMR-BARCODE: 84920481</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-[10px]">
                  {[1, 2, 3, 4, 5].map(q => (
                    <div key={q} className="flex flex-col items-center gap-1 bg-slate-50 p-1.5 rounded">
                      <span className="font-bold text-slate-600">Q{q}</span>
                      <div className="flex gap-0.5">
                        <span className={`h-3 w-3 rounded-full border border-slate-400 ${q === 1 || q === 3 ? 'bg-slate-900' : ''}`} />
                        <span className={`h-3 w-3 rounded-full border border-slate-400 ${q === 2 ? 'bg-slate-900' : ''}`} />
                        <span className={`h-3 w-3 rounded-full border border-slate-400 ${q === 4 ? 'bg-slate-900' : ''}`} />
                        <span className={`h-3 w-3 rounded-full border border-slate-400 ${q === 5 ? 'bg-slate-900' : ''}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Answer Key & Marking Rules Preview */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Master Answer Key Config</h4>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeTest?.title}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Correct Answer Weight:</span>
                  <span className="font-bold text-emerald-700">+4.0 Marks</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Negative Penalty:</span>
                  <span className="font-bold text-red-700">-1.0 Mark</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Unanswered Question:</span>
                  <span className="font-semibold text-slate-600">0.0 Marks</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Dual-Bubble Margin:</span>
                  <span className="font-semibold text-amber-700">Invalidated (0 Marks)</span>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
                <p className="font-bold">Automated Rank Tie-Breaker:</p>
                <p className="mt-1 text-[11px] text-blue-800">
                  1. Higher Biology/Mathematics score &rarr; 2. Fewer negative questions &rarr; 3. Date of birth seniority.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RANKS & DIAGNOSTIC ANALYTICS TAB */}
      {activeTab === 'ranks' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">All-India &amp; Branch Merit Rank List</h3>
                <span className="rounded bg-blue-900 px-2 py-0.2 text-[10px] font-bold text-white">
                  {activeTest?.title}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Diagnostic weak-topic breakdown generated from OMR error matrices.
              </p>
            </div>
            <select
              value={selectedTestId}
              onChange={e => setSelectedTestId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              {tests.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 text-center">Inst Rank</th>
                  <th className="py-3 px-4 text-left">Student Profile</th>
                  <th className="py-3 px-4 text-center">Batch Rank</th>
                  <th className="py-3 px-4 text-center">Branch Rank</th>
                  <th className="py-3 px-4 text-center">Marks Obtained</th>
                  <th className="py-3 px-4 text-center">Percentile</th>
                  <th className="py-3 px-4 text-left">Areas for Improvement (Weak Topics)</th>
                  <th className="py-3 px-4 text-right">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTestResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No results found. Run the OMR Scanner Studio simulation to compile ranks.
                    </td>
                  </tr>
                ) : (
                  activeTestResults.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-black text-xs ${
                          res.instituteRank === 1
                            ? 'bg-amber-400 text-slate-900 shadow-xs'
                            : res.instituteRank === 2
                            ? 'bg-slate-300 text-slate-900'
                            : res.instituteRank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {res.instituteRank}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{res.studentName}</p>
                        <p className="font-mono text-[10px] text-blue-900">{res.studentCode}</p>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        #{res.batchRank}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-indigo-900">
                        #{res.branchRank}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="text-base font-black text-slate-900">{res.totalMarksObtained}</span>
                        <span className="text-slate-400 text-[11px]"> / {res.totalMaxMarks}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                          {res.percentile}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {res.weakTopics.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {res.weakTopics.map((topic, i) => (
                              <span key={i} className="rounded bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 text-[10px] font-medium">
                                {topic}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px]">Mastery Achieved</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => alert(`Report card generated for ${res.studentName} (${res.totalMarksObtained}/${res.totalMaxMarks}). All-India Rank #${res.instituteRank}.`)}
                          className="rounded-lg bg-blue-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-800 shadow-2xs"
                        >
                          Full Card
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
