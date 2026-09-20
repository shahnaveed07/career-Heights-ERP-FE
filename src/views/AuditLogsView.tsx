import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Building,
  Key,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useErpData();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'security'>('all');

  const filteredLogs = auditLogs.filter(log => {
    const userStr = log.user || log.userName || '';
    const ipStr = log.ipAddress || log.ip || '';
    const severity = log.severity || 'info';

    const searchMatch =
      !searchTerm ||
      userStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ipStr.includes(searchTerm);

    const severityMatch = severityFilter === 'all' || severity === severityFilter;

    return searchMatch && severityMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              Compliance &amp; Security
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            System Security &amp; Audit Trail
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Immutable system logs capturing transactions, fee edits, role changes, and auth timestamps.
          </p>
        </div>

        <button
          onClick={() => alert(`Official ISO-compliant security log export generated in encrypted format.`)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          Export CSV Log
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by action, user email, IP address..."
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
          />
        </div>

        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value as any)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Severity Levels</option>
          <option value="info">Info / Operational</option>
          <option value="warning">Warning</option>
          <option value="security">Security Events</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4 text-left">Timestamp</th>
              <th className="py-3 px-4 text-left">Operator User</th>
              <th className="py-3 px-4 text-left">Action Triggered</th>
              <th className="py-3 px-4 text-left">Audit Description</th>
              <th className="py-3 px-4 text-left">IP Address</th>
              <th className="py-3 px-4 text-center">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition">
                <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">{log.user || log.userName}</td>
                <td className="py-2.5 px-4 font-bold text-blue-900 whitespace-nowrap">{log.action}</td>
                <td className="py-2.5 px-4 font-sans text-slate-700 max-w-sm">{log.details}</td>
                <td className="py-2.5 px-4 text-slate-500">{log.ipAddress || log.ip}</td>
                <td className="py-2.5 px-4 text-center">
                  <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    (log.severity || 'info') === 'security'
                      ? 'bg-red-100 text-red-800'
                      : (log.severity || 'info') === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {log.severity || 'info'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
