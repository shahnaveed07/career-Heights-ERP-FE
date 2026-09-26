import { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { EmptyState } from '../components/common/EmptyState';
export const ChtqScholarshipView = () => {
  const { chtqSchools, chtqCandidates, updateChtqStatus } = useErpData();
  const [activeTab, setActiveTab] = useState('candidates');
  const [searchTerm, setSearchTerm] = useState('');
  const [scholarshipFilter, setScholarshipFilter] = useState('all');
  const [outreachActionMessage, setOutreachActionMessage] = useState(null);
  const totalRegistered = chtqSchools.reduce(
    (acc, s) => acc + s.registeredCount,
    0
  );
  const totalAwarded = chtqCandidates.filter(
    (c) => c.scholarshipPercent > 0
  ).length;
  const totalConverted = chtqCandidates.filter(
    (c) => c.admissionStatus === 'converted'
  ).length;
  const conversionRate =
    totalAwarded > 0 ? ((totalConverted / totalAwarded) * 100).toFixed(1) : '0';
  const filteredCandidates = chtqCandidates.filter((c) => {
    const searchMatch =
      !searchTerm ||
      c.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPhone.includes(searchTerm);
    const scholarshipMatch =
      scholarshipFilter === 'all' ||
      c.scholarshipPercent.toString() === scholarshipFilter;
    return searchMatch && scholarshipMatch;
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Talent Search &amp; Outreach
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            CHTQ: Career Heights Talent Quest
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            School outreach campaigns, scholarship examinations, merit tier
            slabs and admission conversions.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${activeTab === 'candidates' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Ranked Candidates ({chtqCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${activeTab === 'schools' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Partner Schools ({chtqSchools.length})
          </button>
        </div>
      </div>

      {/* Outreach Message Notification Banner */}
      {outreachActionMessage && (
        <div className="flex items-center justify-between rounded-xl border border-blue-300 bg-blue-50 px-4 py-2.5 text-xs text-blue-900 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-700 shrink-0" />
            <span className="font-semibold">{outreachActionMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setOutreachActionMessage(null)}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            Registered Candidates
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {totalRegistered}
          </div>
          <span className="text-[10px] text-slate-400">
            Across {chtqSchools.length} target schools
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800">
            Scholarships Awarded
          </span>
          <div className="mt-1 text-2xl font-black text-amber-900">
            {totalAwarded}
          </div>
          <span className="text-[10px] font-bold text-amber-700">
            100%, 75% &amp; 50% tuition tiers
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800">
            Enrolled Admissions
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-900">
            {totalConverted}
          </div>
          <span className="text-[10px] font-bold text-emerald-700">
            Conversion Rate: {conversionRate}%
          </span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-800">
            Partner School Tie-ups
          </span>
          <div className="mt-1 text-2xl font-black text-blue-900">
            {chtqSchools.length}
          </div>
          <span className="text-[10px] text-blue-700">
            Handwara, Kupwara &amp; Baramulla
          </span>
        </div>
      </div>

      {/* CANDIDATES TAB */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate name, roll no, school, phone..."
                className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <select
              value={scholarshipFilter}
              onChange={(e) => setScholarshipFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
            >
              <option value="all">All Scholarship Slabs</option>
              <option value="100">100% Full Tuition Waiver</option>
              <option value="75">75% Merit Scholarship</option>
              <option value="50">50% Merit Scholarship</option>
            </select>
          </div>

          {/* Candidates Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4 text-left">
                      Candidate Name &amp; Roll
                    </th>
                    <th className="py-3 px-4 text-left">Affiliated School</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Scholarship Slab</th>
                    <th className="py-3 px-4 text-center">Counseling</th>
                    <th className="py-3 px-4 text-center">Admission Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-black text-xs ${cand.rank <= 3 ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-700'}`}
                        >
                          {cand.rank}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">
                          {cand.candidateName}
                        </p>
                        <p className="font-mono text-[10px] text-blue-900">
                          {cand.rollNo} • {cand.contactPhone}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">
                          {cand.schoolName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Class: {cand.classApplied}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-slate-900">
                          {cand.score}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {' '}
                          / {cand.totalMarks}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block rounded px-2.5 py-0.5 text-xs font-black ${cand.scholarshipPercent === 100 ? 'bg-amber-100 text-amber-900 border border-amber-300' : cand.scholarshipPercent >= 75 ? 'bg-indigo-100 text-indigo-900' : 'bg-blue-100 text-blue-900'}`}
                        >
                          {cand.scholarshipPercent}% Waiver
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="capitalize font-semibold text-slate-700">
                          {cand.counsellingStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${cand.admissionStatus === 'converted' ? 'bg-emerald-100 text-emerald-800' : cand.admissionStatus === 'dropped' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}
                        >
                          {cand.admissionStatus.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {cand.admissionStatus !== 'converted' ? (
                          <button
                            onClick={() =>
                              updateChtqStatus(cand.id, {
                                admissionStatus: 'converted',
                                counsellingStatus: 'completed',
                              })
                            }
                            className="rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-600 shadow-2xs"
                          >
                            Convert to Admission
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Enrolled</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8">
                        <EmptyState
                          title="No candidates found"
                          description="No scholarship test candidates match your search query or scholarship filter."
                          actionLabel={searchTerm ? 'Clear Search' : undefined}
                          onAction={searchTerm ? () => setSearchTerm('') : undefined}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCHOOLS TAB */}
      {activeTab === 'schools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chtqSchools.map((school) => (
            <div
              key={school.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-blue-50 text-blue-900 px-2 py-0.5 text-xs font-bold">
                  {school.location}
                </span>
                <span className="font-bold text-slate-900">
                  {school.registeredCount} Registered
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                {school.name}
              </h4>
              <div className="text-xs text-slate-500 space-y-1">
                <p>
                  Contact: <strong>{school.contactPerson}</strong>
                </p>
                <p>
                  Phone: <strong>{school.phone}</strong>
                </p>
                <p>
                  Assigned Test Center: <strong>{school.testCenter}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setOutreachActionMessage(
                      `Outreach kit and student admit cards dispatched to ${school.name}.`
                    )
                  }
                  className="font-bold text-blue-900 hover:underline"
                >
                  Send Admit Cards &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
