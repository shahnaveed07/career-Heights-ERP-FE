import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Phone,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  TrendingUp,
  Building,
  UserCheck,
  Clock,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { Enquiry, LeadStatus } from '../types';
import { getTodayDateString, getFutureDateString, isPastOrToday } from '../utils/dateUtils';

export const AdmissionsCrmView: React.FC = () => {
  const { enquiries, addEnquiry, updateEnquiryStatus, convertEnquiryToAdmission, branches, batches } = useErpData();
  const { activeBranchFilter, setActiveBranchFilter } = useAuth();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>(activeBranchFilter === 'all' ? 'all' : activeBranchFilter);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [formError, setFormError] = useState<string | null>(null);

  // Synchronize branch filter whenever global navbar changes
  useEffect(() => {
    setSelectedBranch(activeBranchFilter);
  }, [activeBranchFilter]);

  // New Lead Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    parentName: '',
    phone: '',
    email: '',
    branchId: branches[0]?.id || 'b-hdw',
    targetCourse: 'NEET Dropper Medical',
    source: 'Walk-in' as const,
    assignedCounsellor: 'Mehak Khan',
    nextFollowUp: getFutureDateString(2),
    notes: '',
  });

  // Convert Modal state
  const [convertModalLead, setConvertModalLead] = useState<Enquiry | null>(null);
  const [convertBranchId, setConvertBranchId] = useState<string>('');
  const [convertBatchId, setConvertBatchId] = useState<string>('');
  const [convertSource, setConvertSource] = useState<string>('Direct Walk-in');
  const [convertFeesTotal, setConvertFeesTotal] = useState<number>(95000);
  const [convertFeesPaid, setConvertFeesPaid] = useState<number>(35000);

  const openConvertModal = (lead: Enquiry) => {
    setConvertModalLead(lead);
    const bId = lead.branchId || branches.find(b => b.name === lead.branchName)?.id || branches[0]?.id || 'b-hdw';
    setConvertBranchId(bId);
    const matchedBatch = batches.find(b => b.branchId === bId && (b.className === lead.targetCourse || b.name.toLowerCase().includes(lead.targetCourse?.toLowerCase() || '')))
      || batches.find(b => b.branchId === bId)
      || batches[0];
    setConvertBatchId(matchedBatch?.id || '');
    setConvertSource(lead.source || 'Direct Walk-in');
    setConvertFeesTotal(95000);
    setConvertFeesPaid(35000);
  };

  const stages: { id: LeadStatus; label: string; color: string; bg: string }[] = [
    { id: 'new', label: 'New Inflow', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    { id: 'contacted', label: 'Contacted', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    { id: 'visited', label: 'Campus Visited', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    { id: 'demo_class', label: 'Demo Attended', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
    { id: 'follow_up', label: 'Active Follow-up', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
    { id: 'admission', label: 'Enrolled / Admitted', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
    { id: 'lost', label: 'Lost / Inactive', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200' },
  ];

  const filteredEnquiries = enquiries.filter(e => {
    const candidateName = e.name || e.studentName || '';
    const counsellorName = e.assignedCounsellor || e.counsellorName || '';
    const searchMatch =
      !searchTerm ||
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm) ||
      e.targetCourse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counsellorName.toLowerCase().includes(searchTerm.toLowerCase());

    const branchMatch = selectedBranch === 'all' || e.branchId === selectedBranch;
    const sourceMatch = selectedSource === 'all' || e.source === selectedSource;

    return searchMatch && branchMatch && sourceMatch;
  });

  const totalLeads = filteredEnquiries.length;
  const enrolledCount = filteredEnquiries.filter(e => e.status === 'admission').length;
  const conversionRate = totalLeads > 0 ? ((enrolledCount / totalLeads) * 100).toFixed(1) : '0';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name.trim() || !newLeadForm.phone.trim()) {
      setFormError('Candidate name and valid phone number are required.');
      return;
    }

    addEnquiry({
      ...newLeadForm,
      date: getTodayDateString(),
      status: 'new',
    });

    setFormError(null);
    setShowAddModal(false);
    setNewLeadForm({
      name: '',
      parentName: '',
      phone: '',
      email: '',
      branchId: branches[0]?.id || 'b-hdw',
      targetCourse: 'NEET Dropper Medical',
      source: 'Walk-in',
      assignedCounsellor: 'Mehak Khan',
      nextFollowUp: getFutureDateString(2),
      notes: '',
    });
  };

  const handleConfirmConvert = () => {
    if (!convertModalLead) return;
    convertEnquiryToAdmission(convertModalLead.id, {
      branchId: convertBranchId,
      batchId: convertBatchId,
      admissionSource: convertSource,
      feesTotal: Number(convertFeesTotal),
      feesPaid: Number(convertFeesPaid),
    });
    setConvertModalLead(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              Admissions CRM &amp; Tele-Counselling
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Enquiry Pipeline &amp; Conversion Command
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Track leads across walk-ins, school outreach, and CHTQ talent quest examinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`rounded px-3 py-1 text-xs font-bold transition ${
                viewMode === 'kanban' ? 'bg-blue-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded px-3 py-1 text-xs font-bold transition ${
                viewMode === 'table' ? 'bg-blue-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* CRM Stats Summary Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Active Leads</span>
          <div className="mt-1 text-2xl font-black text-slate-900">{totalLeads}</div>
          <span className="text-[10px] text-slate-400">All acquisition channels</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Enrolled (Admissions)</span>
          <div className="mt-1 text-2xl font-black text-emerald-700">{enrolledCount}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Seat verified</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Conversion Rate</span>
          <div className="mt-1 text-2xl font-black text-blue-900">{conversionRate}%</div>
          <span className="text-[10px] text-slate-400">Target: 25.0%</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Today's Follow-ups</span>
          <div className="mt-1 text-2xl font-black text-amber-700">
            {filteredEnquiries.filter(e => e.status !== 'admission' && e.status !== 'lost' && isPastOrToday(e.nextFollowUp)).length}
          </div>
          <span className="text-[10px] text-amber-800 font-semibold">Immediate attention</span>
        </div>
      </div>

      {/* Search and Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search leads by student name, phone, course..."
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBranch}
            onChange={e => {
              const newBranch = e.target.value;
              setSelectedBranch(newBranch);
              setActiveBranchFilter(newBranch);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={selectedSource}
            onChange={e => setSelectedSource(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Sources</option>
            <option value="Walk-in">Walk-in</option>
            <option value="CHTQ Scholarship">CHTQ Scholarship</option>
            <option value="Website Enquiry">Website Enquiry</option>
            <option value="Student Referral">Student Referral</option>
            <option value="School Outreach">School Outreach</option>
          </select>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageLeads = filteredEnquiries.filter(e => e.status === stage.id);
            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 rounded-xl border border-slate-200 bg-slate-100/60 p-3 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      stage.id === 'admission' ? 'bg-emerald-600' : stage.id === 'new' ? 'bg-blue-600' : 'bg-slate-400'
                    }`} />
                    <span className="font-bold text-xs text-slate-800">{stage.label}</span>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-700 border border-slate-200">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Lead Cards in Stage */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-slate-400 italic">
                      No leads in this stage
                    </div>
                  ) : (
                    stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs hover:border-blue-900 transition text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-slate-900">{lead.name || lead.studentName}</p>
                            <p className="text-[10px] text-slate-400">Guardian: {lead.parentName}</p>
                          </div>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-600">
                            {lead.source}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded">
                          {lead.targetCourse}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{lead.phone}</span>
                          </span>
                          <span className="font-medium text-slate-700">{lead.branchName}</span>
                        </div>

                        {lead.notes && (
                          <p className="text-[10px] text-slate-500 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                            "{lead.notes}"
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">
                            Follow-up: <strong>{lead.nextFollowUp}</strong>
                          </span>

                          {/* Stage Transition Selector */}
                          <div className="flex items-center gap-1">
                            {stage.id !== 'admission' && (
                              <button
                                onClick={() => openConvertModal(lead)}
                                className="rounded bg-emerald-600 px-1.5 py-0.5 font-bold text-white hover:bg-emerald-700"
                                title="Convert Lead to Full Admission"
                              >
                                Enrol &rarr;
                              </button>
                            )}

                            <select
                              value={lead.status}
                              onChange={e => updateEnquiryStatus(lead.id, e.target.value as LeadStatus)}
                              className="rounded border border-slate-200 bg-white text-[9px] py-0.5 px-1 font-semibold text-slate-600 focus:outline-hidden"
                            >
                              {stages.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 text-left">Candidate Name</th>
                  <th className="py-3 px-4 text-left">Contact / Phone</th>
                  <th className="py-3 px-4 text-left">Branch &amp; Course</th>
                  <th className="py-3 px-4 text-left">Source</th>
                  <th className="py-3 px-4 text-left">Counsellor</th>
                  <th className="py-3 px-4 text-left">Next Follow-up</th>
                  <th className="py-3 px-4 text-center">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No admission leads match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{lead.name || lead.studentName}</p>
                        <p className="text-[10px] text-slate-400">Parent: {lead.parentName}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{lead.phone}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{lead.targetCourse}</div>
                        <div className="text-[10px] text-slate-500">{lead.branchName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{lead.assignedCounsellor || lead.counsellorName}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{lead.nextFollowUp}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                          lead.status === 'admission'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.status === 'lost'
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {lead.status !== 'admission' ? (
                          <button
                            onClick={() => openConvertModal(lead)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
                          >
                            Enrol &rarr;
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs">Admitted</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Convert Lead to Admission Confirmation Modal */}
      {convertModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Admission Conversion</h3>
                <p className="text-xs text-slate-500">Transform lead to enrolled student record with designated branch &amp; batch</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span><strong>Candidate:</strong> {convertModalLead.name || convertModalLead.studentName}</span>
                <span className="text-slate-500"><strong>Counsellor:</strong> {convertModalLead.assignedCounsellor || convertModalLead.counsellorName}</span>
              </div>
              <p><strong>Parent / Phone:</strong> {convertModalLead.parentName} ({convertModalLead.phone})</p>
              <p><strong>Target Course:</strong> {convertModalLead.targetCourse}</p>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campus Branch *</label>
                  <select
                    value={convertBranchId}
                    onChange={e => {
                      const newBranchId = e.target.value;
                      setConvertBranchId(newBranchId);
                      const matchingBatch = batches.find(b => b.branchId === newBranchId) || batches[0];
                      if (matchingBatch) setConvertBatchId(matchingBatch.id);
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-900"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} Campus</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Batch *</label>
                  <select
                    value={convertBatchId}
                    onChange={e => setConvertBatchId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-900"
                  >
                    {batches
                      .filter(b => b.branchId === convertBranchId)
                      .map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.className})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission Source *</label>
                  <select
                    value={convertSource}
                    onChange={e => setConvertSource(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-900"
                  >
                    <option value="Direct Walk-in">Direct Walk-in</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="CHTQ Scholarship">CHTQ Scholarship</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Social Media">Social Media</option>
                    {convertSource && !['Direct Walk-in', 'Walk-in', 'CHTQ Scholarship', 'Referral', 'Website', 'Seminar', 'Social Media'].includes(convertSource) && (
                      <option value={convertSource}>{convertSource}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tuition Agreed (₹)</label>
                  <input
                    type="number"
                    value={convertFeesTotal}
                    onChange={e => setConvertFeesTotal(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Downpayment (₹)</label>
                  <input
                    type="number"
                    value={convertFeesPaid}
                    onChange={e => setConvertFeesPaid(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-900"
                  />
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              Generates a permanent sequential Student ID (e.g. <code>CH-2026-XXX</code>), enrolls into the selected batch roster, and automatically updates CRM metrics.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConvertModalLead(null)}
                className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConvert}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Confirm Admission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-900" />
                <span>Log New Admission Enquiry</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    placeholder="Candidate name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={newLeadForm.parentName}
                    onChange={e => setNewLeadForm({ ...newLeadForm, parentName: e.target.value })}
                    placeholder="Guardian name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.phone}
                    onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="+91 94190..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Branch</label>
                  <select
                    value={newLeadForm.branchId}
                    onChange={e => setNewLeadForm({ ...newLeadForm, branchId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Program</label>
                  <select
                    value={newLeadForm.targetCourse}
                    onChange={e => setNewLeadForm({ ...newLeadForm, targetCourse: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="NEET Medical 11th">NEET Medical (Class 11)</option>
                    <option value="NEET Medical 12th">NEET Medical (Class 12)</option>
                    <option value="NEET Dropper Medical">NEET Dropper Repeater</option>
                    <option value="JEE Main & Adv 11th">JEE Main &amp; Adv (Class 11)</option>
                    <option value="JEE Main & Adv 12th">JEE Main &amp; Adv (Class 12)</option>
                    <option value="Foundation Class 9th/10th">Foundation Olympiad</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="Walk-in">Walk-in Visit</option>
                    <option value="CHTQ Scholarship">CHTQ Scholarship Test</option>
                    <option value="Website Enquiry">Website Enquiry</option>
                    <option value="Student Referral">Student Referral</option>
                    <option value="School Outreach">School Outreach Program</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Counsellor Remarks &amp; Feedback</label>
                <textarea
                  rows={2}
                  value={newLeadForm.notes}
                  onChange={e => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Notes from initial conversation, student interest level..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
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
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
