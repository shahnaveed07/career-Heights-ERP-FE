import { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { StudentAvatar } from '../components/common/StudentAvatar';
export const HrStaffManagementView = () => {
  const { employees, leaveRequests, updateLeaveStatus, branches } =
    useErpData();
  const { activeBranchFilter, can, uiMode } = useAuth();
  const canManageLeaves = uiMode !== 'view' && (can('users', 'edit') || can('users', 'add'));
  const [activeTab, setActiveTab] = useState('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const filteredEmployees = employees.filter((e) => {
    const searchMatch =
      !searchTerm ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch =
      departmentFilter === 'all' || e.department === departmentFilter;
    const branchMatch =
      activeBranchFilter === 'all' || e.branchId === activeBranchFilter;
    return searchMatch && deptMatch && branchMatch;
  });
  const branchEmployees =
    activeBranchFilter === 'all'
      ? employees
      : employees.filter((e) => e.branchId === activeBranchFilter);
  const pendingLeaves = leaveRequests.filter((l) => {
    const isPending = l.status === 'pending';
    if (activeBranchFilter === 'all') return isPending;
    const emp = employees.find((e) => e.id === l.employeeId);
    return isPending && emp?.branchId === activeBranchFilter;
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
              Human Resources
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Faculty Directory &amp; Staff Administration
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Faculty roster, biometric attendance compliance, salary ledger and
            leaves desk.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('directory')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${activeTab === 'directory' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Staff Directory ({branchEmployees.length})
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${activeTab === 'leaves' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Leave Requests ({pendingLeaves.length} Pending)
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            Total Workforce
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {branchEmployees.length}
          </div>
          <span className="text-[10px] text-slate-400">
            Faculty &amp; Operations
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800">
            Biometric Attendance
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-900">96.4%</div>
          <span className="text-[10px] font-bold text-emerald-700">
            Daily punch average
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800">
            Pending Leave Approvals
          </span>
          <div className="mt-1 text-2xl font-black text-amber-900">
            {pendingLeaves.length}
          </div>
          <span className="text-[10px] font-bold text-amber-700">
            Requires HR action
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            Monthly Payroll Pool
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900">
            ₹
            {(
              branchEmployees.reduce((acc, e) => acc + e.monthlySalary, 0) / 1e5
            ).toFixed(1)}
            L
          </div>
          <span className="text-[10px] text-slate-400">
            Direct NEFT disbursement
          </span>
        </div>
      </div>

      {/* DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff by name, code, email, designation..."
                className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
            >
              <option value="all">All Departments</option>
              <option value="Academic">Academic / Faculty</option>
              <option value="Administration">Administration</option>
              <option value="Counselling">Counselling &amp; Admissions</option>
              <option value="Accounts">Accounts &amp; Finance</option>
              <option value="Executive">Executive HQ</option>
            </select>
          </div>

          {/* Staff Grid */}
          {filteredEmployees.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-700">
                No staff members found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query, department filter, or global
                branch selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <StudentAvatar
                        photo={emp.photo}
                        name={emp.name}
                        size="lg"
                        className="h-12 w-12 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {emp.name}
                        </h4>
                        <p className="font-mono text-[10px] text-blue-900 font-bold">
                          {emp.empCode}
                        </p>
                        <p className="text-xs text-slate-500">
                          {emp.designation}
                        </p>
                      </div>
                    </div>
                    <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                      {emp.department}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>{emp.branchName} Campus</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{emp.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{emp.phone}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">
                      Salary:{' '}
                      <strong className="text-slate-900">
                        ₹{(emp.monthlySalary / 1e3).toFixed(0)}k/mo
                      </strong>
                    </span>
                    <span className="text-emerald-700 font-bold">
                      {emp.attendanceRate}% Attendance
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LEAVES TAB */}
      {activeTab === 'leaves' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900">
              Faculty &amp; Staff Leave Applications
            </h3>
            <p className="text-xs text-slate-500">
              Requires HR or Branch Admin approval to adjust timetable
              allocations.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {leaveRequests.filter((l) => {
              if (activeBranchFilter === 'all') return true;
              const emp = employees.find((e) => e.id === l.employeeId);
              return emp?.branchId === activeBranchFilter;
            }).length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-slate-700">
                  No leave applications found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  There are no leave applications matching the selected branch.
                </p>
              </div>
            ) : (
              leaveRequests
                .filter((l) => {
                  if (activeBranchFilter === 'all') return true;
                  const emp = employees.find((e) => e.id === l.employeeId);
                  return emp?.branchId === activeBranchFilter;
                })
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {req.employeeName}
                        </span>
                        <span className="rounded bg-blue-50 text-blue-900 px-2 py-0.5 text-[10px] font-bold">
                          {req.leaveType}
                        </span>
                        <span className="text-slate-500">
                          • {req.daysCount} Day(s)
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        "{req.reason}"
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Period: {req.startDate} to {req.endDate} •{' '}
                        {req.branchName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'pending' ? (
                        canManageLeaves ? (
                          <>
                            <button
                              onClick={() =>
                                updateLeaveStatus(req.id, 'approved')
                              }
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 text-xs shadow-2xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() =>
                                updateLeaveStatus(req.id, 'rejected')
                              }
                              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-bold text-red-700 hover:bg-red-100 text-xs"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold">
                            Pending Approval (View Only)
                          </span>
                        )
                      ) : (
                        <span
                          className={`rounded px-2.5 py-1 text-xs font-bold ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {req.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
