import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  AlertCircle,
  ShieldCheck,
  User,
  Clock,
  Download,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { DocumentItem } from '../types';

export const DocumentVaultView: React.FC = () => {
  const { documents, updateDocumentStatus } = useErpData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedDocPreview, setSelectedDocPreview] = useState<DocumentItem | null>(null);

  const filteredDocs = documents.filter(doc => {
    const searchMatch =
      !searchTerm ||
      doc.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docType.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === 'all' || doc.status === statusFilter;

    return searchMatch && statusMatch;
  });

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const approvedCount = documents.filter(d => d.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Compliance &amp; Verification
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Document Vault &amp; KYC Verification
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Aadhaar, 10th/12th marksheets, category certificates, and student compliance records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
            {pendingCount} Verifications Awaiting Review
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Vault Files</span>
          <div className="mt-1 text-2xl font-black text-slate-900">{documents.length}</div>
          <span className="text-[10px] text-slate-400">Encrypted digital copies</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800">Verified &amp; Approved</span>
          <div className="mt-1 text-2xl font-black text-emerald-900">{approvedCount}</div>
          <span className="text-[10px] font-bold text-emerald-700">Official seal applied</span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800">Pending Scrutiny</span>
          <div className="mt-1 text-2xl font-black text-amber-900">{pendingCount}</div>
          <span className="text-[10px] font-bold text-amber-700">Needs admin signature</span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-800">Security Standard</span>
          <div className="mt-1 text-2xl font-black text-blue-900">AES-256</div>
          <span className="text-[10px] text-blue-700">Tamper-proof audit logs</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by student name, document type, file name..."
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
        >
          <option value="all">All Verification Statuses</option>
          <option value="pending">Pending Verification</option>
          <option value="approved">Approved &amp; Verified</option>
          <option value="rejected">Rejected / Resubmit</option>
        </select>
      </div>

      {/* Documents Grid / Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4 text-left">Document &amp; File Name</th>
              <th className="py-3 px-4 text-left">Student / Entity</th>
              <th className="py-3 px-4 text-left">Upload Date</th>
              <th className="py-3 px-4 text-center">Verification Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doc.docType}</p>
                      <p className="font-mono text-[10px] text-slate-400">{doc.fileName} ({doc.fileSize})</p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900">{doc.entityName}</p>
                  <p className="text-[10px] text-slate-400">Uploaded by: {doc.uploadedBy}</p>
                </td>

                <td className="py-3 px-4 text-slate-500">{doc.uploadDate}</td>

                <td className="py-3 px-4 text-center">
                  <span className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold ${
                    doc.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : doc.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doc.status.toUpperCase()}
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedDocPreview(doc)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-semibold"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Review</span>
                    </button>

                    {doc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateDocumentStatus(doc.id, 'approved')}
                          className="rounded bg-emerald-600 px-2.5 py-1 text-white hover:bg-emerald-700 font-bold shadow-2xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateDocumentStatus(doc.id, 'rejected', 'Image resolution blurry')}
                          className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700 font-bold shadow-2xs"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Document Inspection: {selectedDocPreview.docType}
              </h3>
              <button onClick={() => setSelectedDocPreview(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Profile:</span>
                <strong className="text-slate-900">{selectedDocPreview.entityName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Name:</span>
                <span className="font-mono text-slate-700">{selectedDocPreview.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Seal:</span>
                <span className="capitalize font-bold text-blue-900">{selectedDocPreview.status}</span>
              </div>

              {/* Mock Scan Visual Preview */}
              <div className="h-44 rounded-lg border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-center p-4">
                <FileCheck2 className="h-10 w-10 text-blue-900 mb-2" />
                <p className="font-bold text-slate-800">{selectedDocPreview.docType} Preview</p>
                <p className="text-[11px] text-slate-400">Digitally scanned and stamped by Career Heights Registrar Office</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
              >
                Close
              </button>
              {selectedDocPreview.status === 'pending' && (
                <button
                  onClick={() => {
                    updateDocumentStatus(selectedDocPreview.id, 'approved');
                    setSelectedDocPreview(null);
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Confirm Official Approval
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
