import { useState } from 'react';
import { Building, CheckCircle2, FileSpreadsheet, Download } from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { exportExecutiveDossierToCsv } from '../services/exportService';

export const ReportsAnalyticsView = () => {
  const {
    branches,
    students,
    enquiries,
    chtqSchools,
    scopedReports,
    scopedStudents,
    scopedEnquiries,
  } = useErpData();
  const { activeBranchFilter } = useAuth();
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  const filteredBranches =
    activeBranchFilter === 'all'
      ? branches
      : branches.filter((b) => b.id === activeBranchFilter);
  const filteredStudents = scopedStudents;
  const filteredEnquiries = scopedEnquiries;
  const totalRevenue = scopedReports.totalFeesCollected || filteredBranches.reduce(
    (acc, b) => acc + b.monthlyRevenue,
    0
  );
  const totalStudents = scopedReports.totalStudents;
  const totalEnquiries = scopedReports.totalEnquiries;
  const enrolledEnquiries = scopedReports.convertedEnquiries;
  const overallConversion =
    totalEnquiries > 0
      ? ((enrolledEnquiries / totalEnquiries) * 100).toFixed(1)
      : '0.0';
  const handleExport = () => {
    const branchName =
      activeBranchFilter === 'all'
        ? 'All Campuses'
        : filteredBranches[0]?.name || 'Campus';
    const result = exportExecutiveDossierToCsv(
      filteredBranches,
      filteredBranches.map((b) => ({
        id: b.id,
        totalStudents: b.studentCount || Math.round(filteredStudents.length / (filteredBranches.length || 1)),
        totalEnquiries: Math.round(filteredEnquiries.length / (filteredBranches.length || 1)),
        convertedAdmissions: Math.round(enrolledEnquiries / (filteredBranches.length || 1)),
        feeCollected: b.monthlyRevenue ? b.monthlyRevenue * 10 : 0,
        feePending: b.pendingRevenue || 0,
        avgAttendance: 89,
        staffCount: b.facultyCount || 8,
      })),
      branchName
    );
    if (result.success) {
      setDownloadSuccess(
        `Demo executive dossier exported to CSV (client-side generated, ${result.rowCount} campus records).`
      );
    } else {
      setDownloadSuccess('Export failed: ' + (result.error || 'Unknown error'));
    }
    setTimeout(() => setDownloadSuccess(null), 5000);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Executive Intelligence
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Reports &amp; Cross-Branch Analytics
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Consolidated operational, revenue, admission funnel and academic
            performance matrices.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export CSV Report (Client-Side)</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Cross-Branch Comparative Performance Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          {activeBranchFilter === 'all'
            ? 'Multi-Branch Institutional Scorecard (September 2026)'
            : `${filteredBranches[0]?.name || 'Branch'} Campus Scorecard (September 2026)`}
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 text-left">Branch Campus</th>
                <th className="py-3 px-4 text-center">Active Students</th>
                <th className="py-3 px-4 text-center">Capacity Saturation</th>
                <th className="py-3 px-4 text-center">
                  Biometric Attendance %
                </th>
                <th className="py-3 px-4 text-right">Monthly Fee Pool</th>
                <th className="py-3 px-4 text-center">Top Exam Rank</th>
                <th className="py-3 px-4 text-right">Lead Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Building className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No campuses found matching the active branch filter.
                  </td>
                </tr>
              ) : (
                filteredBranches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {b.name} Campus
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {b.city} • Head: {b.headFaculty}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {b.studentCount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-900 rounded-full"
                            style={{
                              width: `${Math.min(100, (b.studentCount / (b.capacity || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">
                          {((b.studentCount / (b.capacity || 1)) * 100).toFixed(
                            0
                          )}
                          %
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {b.attendanceRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ₹{(b.monthlyRevenue / 1e5).toFixed(2)}L
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-blue-900">AIR #1</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {b.id === 'branch-handwara' ? '46.2%' : '38.4%'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column Analytical Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admission Funnel Diagnostics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Admissions Pipeline Conversion Funnel
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">
                  1. Fresh Walk-Ins &amp; Inquiries
                </span>
                <span className="font-bold text-slate-900">
                  {totalEnquiries} Leads (100%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-900 w-full" />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">
                  2. Academic Counseling Completed
                </span>
                <span className="font-bold text-slate-900">
                  {
                    filteredEnquiries.filter(
                      (l) =>
                        l.status === 'counselling' || l.status === 'admission'
                    ).length
                  }{' '}
                  Leads
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-800"
                  style={{
                    width: `${totalEnquiries > 0 ? (filteredEnquiries.filter((l) => l.status === 'counselling' || l.status === 'admission').length / totalEnquiries) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">
                  3. Demo Class &amp; Evaluation
                </span>
                <span className="font-bold text-slate-900">
                  {
                    filteredEnquiries.filter(
                      (l) => l.status === 'admission' || l.priority === 'high'
                    ).length
                  }{' '}
                  Leads
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-700"
                  style={{
                    width: `${totalEnquiries > 0 ? (filteredEnquiries.filter((l) => l.status === 'admission' || l.priority === 'high').length / totalEnquiries) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-950">
                  4. Formally Enrolled &amp; Fee Paid
                </span>
                <span className="font-black text-emerald-900">
                  {enrolledEnquiries} Admissions ({overallConversion}%)
                </span>
              </div>
              <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${overallConversion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Benchmark Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Career Heights Competitive Benchmarks
          </h3>
          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-slate-200 p-3.5 space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">
                  NEET Top Score (Mock Phase 1):
                </span>
                <strong className="text-slate-900">682 / 720</strong>
              </div>
              <p className="text-[11px] text-slate-400">
                Scored by Pre-Medical Handwara batch candidate
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">
                  JEE Advanced Top Score:
                </span>
                <strong className="text-slate-900">338 / 360</strong>
              </div>
              <p className="text-[11px] text-slate-400">
                Aarav Sharma (CH-2026-001)
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">
                  CHTQ Registered Candidates:
                </span>
                <strong className="text-amber-800">
                  {chtqSchools.reduce((acc, s) => acc + s.registeredCount, 0)}{' '}
                  Deserving Candidates
                </strong>
              </div>
              <p className="text-[11px] text-slate-400">
                100%, 75%, and 50% tuition subsidies awarded
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
