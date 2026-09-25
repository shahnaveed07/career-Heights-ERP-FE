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
  Shield,
  Plus,
  ArrowRightLeft,
  UserCheck,
  AlertTriangle,
  Lock,
  Edit,
  Trash2,
  Check,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { StudentAvatar } from '../components/common/StudentAvatar';
import {
  SYSTEM_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  normalizeRole,
} from '../utils/permissionManager';

export const HrStaffManagementView = () => {
  const {
    employees,
    scopedStaff,
    leaveRequests,
    updateLeaveStatus,
    branches,
    customRoles,
    addCustomRole,
    updateCustomRole,
    deleteCustomRole,
    addEmployee,
    updateEmployee,
    transferEmployee,
    disableEmployee,
  } = useErpData();

  const {
    activeBranchFilter,
    can,
    isAuthorized,
    uiMode,
    currentUser,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Modals state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStaffForAction, setSelectedStaffForAction] = useState(null);
  const [targetBranchId, setTargetBranchId] = useState(branches[0]?.id || 'b-hdw');

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetNewRole, setTargetNewRole] = useState('teacher');

  const [showCreateCustomRoleModal, setShowCreateCustomRoleModal] = useState(false);

  // New staff form state
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    designation: '',
    department: 'Academic',
    branchId: branches[0]?.id || 'b-hdw',
    monthlySalary: 45000,
    qualifications: 'Post Graduate',
    customRoleId: '',
  });

  // Custom role form state
  const [customRoleForm, setCustomRoleForm] = useState({
    name: '',
    description: '',
    status: 'active',
    assignedBranchIds: ['all'],
    permissions: {
      students: ['view'],
      fees: ['view'],
      attendance: ['view'],
      academic: ['view'],
      examination: ['view'],
      users: ['view'],
      reports: ['view'],
    },
  });

  const currentUserCanonical = normalizeRole(currentUser?.role);
  const isSuperAdmin = currentUserCanonical === SYSTEM_ROLES.SUPER_ADMIN;
  const isHqAdmin = currentUserCanonical === SYSTEM_ROLES.HQ_ADMIN;

  const canManageUsers = can('users', 'edit') || can('users', 'create');
  const canCreateStaff = can('users', 'create');
  const canManageRoles = can('roles', 'create') || can('roles', 'edit');

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    } else {
      setFeedbackMsg(msg);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const filteredEmployees = scopedStaff.filter((e) => {
    const searchMatch =
      !searchTerm ||
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.empCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone?.includes(searchTerm) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch =
      departmentFilter === 'all' || e.department === departmentFilter;
    return searchMatch && deptMatch;
  });

  const branchEmployees = scopedStaff;

  const pendingLeaves = leaveRequests.filter((l) => {
    const isPending = l.status === 'pending';
    return isPending && scopedStaff.some((e) => e.id === l.employeeId);
  });

  // Available roles for creation based on creator authority
  const getAssignableRoles = () => {
    if (isSuperAdmin) {
      return [
        { key: SYSTEM_ROLES.SUPER_ADMIN, label: 'SuperAdmin / Owner' },
        { key: SYSTEM_ROLES.HQ_ADMIN, label: 'HQ Admin' },
        { key: SYSTEM_ROLES.BRANCH_ADMIN, label: 'Admin (Branch)' },
        { key: SYSTEM_ROLES.ACCOUNTANT_COORDINATOR, label: 'Accountant / Coordinator' },
        { key: SYSTEM_ROLES.TEACHER, label: 'Teacher' },
        { key: SYSTEM_ROLES.HR, label: 'HR' },
        ...customRoles.map((r) => ({ key: `custom:${r.id}`, label: `Custom: ${r.name}` })),
      ];
    }
    if (isHqAdmin) {
      return [
        { key: SYSTEM_ROLES.BRANCH_ADMIN, label: 'Admin (Branch)' },
        { key: SYSTEM_ROLES.ACCOUNTANT_COORDINATOR, label: 'Accountant / Coordinator' },
        { key: SYSTEM_ROLES.TEACHER, label: 'Teacher' },
        { key: SYSTEM_ROLES.HR, label: 'HR' },
        ...customRoles.map((r) => ({ key: `custom:${r.id}`, label: `Custom: ${r.name}` })),
      ];
    }
    // Admin
    return [
      { key: SYSTEM_ROLES.ACCOUNTANT_COORDINATOR, label: 'Accountant / Coordinator' },
      { key: SYSTEM_ROLES.TEACHER, label: 'Teacher' },
    ];
  };

  const handleCreateStaffSubmit = (e) => {
    e.preventDefault();
    if (uiMode === 'view') {
      showNotification('System is in View Only mode. Switch to Edit Mode to add staff.', true);
      return;
    }
    if (!canCreateStaff) {
      showNotification('Access Denied: You do not have permission to create users.', true);
      return;
    }

    let actualRole = staffForm.role;
    let customRoleId = null;
    if (staffForm.role.startsWith('custom:')) {
      customRoleId = staffForm.role.replace('custom:', '');
      actualRole = 'custom';
    }

    const created = addEmployee({
      ...staffForm,
      role: actualRole,
      customRoleId,
      designation: staffForm.designation || `${ROLE_LABELS[actualRole] || 'Staff'} Member`,
    });

    setShowAddStaffModal(false);
    showNotification(`Staff member ${created.name} (${created.empCode}) enrolled in local staff roster.`);
    setStaffForm({
      name: '',
      email: '',
      phone: '',
      role: 'teacher',
      designation: '',
      department: 'Academic',
      branchId: branches[0]?.id || 'b-hdw',
      monthlySalary: 45000,
      qualifications: 'Post Graduate',
      customRoleId: '',
    });
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (uiMode === 'view') {
      showNotification('Action denied: System is in View Only mode.', true);
      return;
    }
    if (!can('users', 'edit')) {
      showNotification('Access Denied: You do not have permission to transfer users.', true);
      return;
    }
    if (!selectedStaffForAction) return;

    const res = transferEmployee(selectedStaffForAction.id, targetBranchId);
    if (res.success) {
      const targetB = branches.find((b) => b.id === targetBranchId);
      showNotification(`Transferred ${selectedStaffForAction.name} to ${targetB?.name} Campus (local state updated).`);
      setShowTransferModal(false);
      setSelectedStaffForAction(null);
    } else {
      showNotification(res.message || 'Transfer failed', true);
    }
  };

  const handleRoleChangeSubmit = (e) => {
    e.preventDefault();
    if (uiMode === 'view') {
      showNotification('Action denied: System is in View Only mode.', true);
      return;
    }
    if (!can('roles', 'assign')) {
      showNotification('Access Denied: You do not have permission to assign roles.', true);
      return;
    }
    if (!selectedStaffForAction) return;

    let actualRole = targetNewRole;
    let customRoleId = null;
    if (targetNewRole.startsWith('custom:')) {
      customRoleId = targetNewRole.replace('custom:', '');
      actualRole = 'custom';
    }

    const res = updateEmployee(selectedStaffForAction.id, {
      role: actualRole,
      customRoleId,
    });

    if (res.success) {
      showNotification(`Role updated for ${selectedStaffForAction.name} to ${ROLE_LABELS[actualRole] || actualRole}.`);
      setShowRoleModal(false);
      setSelectedStaffForAction(null);
    } else {
      showNotification(res.message || 'Role change failed', true);
    }
  };

  const handleDisableStaff = (emp) => {
    if (uiMode === 'view') {
      showNotification('Action denied: System is in View Only mode.', true);
      return;
    }
    if (!can('users', 'disable')) {
      showNotification('Access Denied: You do not have permission to deactivate users.', true);
      return;
    }

    const res = disableEmployee(emp.id);
    if (res.success) {
      showNotification(`Account for ${emp.name} disabled.`);
    } else {
      showNotification(res.message || 'Action failed', true);
    }
  };

  const handleCreateCustomRoleSubmit = (e) => {
    e.preventDefault();
    if (uiMode === 'view') {
      showNotification('Action denied: System is in View Only mode.', true);
      return;
    }
    if (!can('roles', 'create')) {
      showNotification('Access Denied: You do not have permission to create custom roles.', true);
      return;
    }
    if (!customRoleForm.name.trim()) {
      showNotification('Role Name is required.', true);
      return;
    }

    addCustomRole(customRoleForm);
    setShowCreateCustomRoleModal(false);
    showNotification(`Custom Role "${customRoleForm.name}" created and published to authorization registry.`);
    setCustomRoleForm({
      name: '',
      description: '',
      status: 'active',
      assignedBranchIds: ['all'],
      permissions: {
        students: ['view'],
        fees: ['view'],
        attendance: ['view'],
        academic: ['view'],
        examination: ['view'],
        users: ['view'],
        reports: ['view'],
      },
    });
  };

  const togglePermissionInCustomRole = (module, action) => {
    setCustomRoleForm((prev) => {
      const currentList = prev.permissions[module] || [];
      const updated = currentList.includes(action)
        ? currentList.filter((a) => a !== action)
        : [...currentList, action];
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: updated,
        },
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-semibold shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 font-semibold shadow-xs">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
              Human Resources &amp; Access Governance
            </span>
            {uiMode === 'view' && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                View Only
              </span>
            )}
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Workforce Roster &amp; Role Governance
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Unified faculty management, leaves desk, and centralized RBAC access control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canCreateStaff && (
            <button
              onClick={() => {
                if (uiMode === 'view') {
                  showNotification('Switch to Edit Mode in top bar to enroll new staff.', true);
                  return;
                }
                setShowAddStaffModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Enroll Staff / User</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex flex-wrap rounded-lg border border-slate-200 bg-white p-1 gap-1">
        <button
          onClick={() => setActiveTab('directory')}
          className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition ${activeTab === 'directory' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Staff Directory ({branchEmployees.length})
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition ${activeTab === 'leaves' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Leave Applications ({pendingLeaves.length} Pending)
        </button>
        {can('roles', 'view') && (
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${activeTab === 'roles' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Roles &amp; Access Governance ({customRoles.length} Custom)</span>
          </button>
        )}
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
            Faculty &amp; Operations Roster
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800">
            Biometric Attendance
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-900">96.4%</div>
          <span className="text-[10px] font-bold text-emerald-700">
            Daily punch compliance
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
              branchEmployees.reduce((acc, e) => acc + (e.monthlySalary || 0), 0) / 1e5
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
                placeholder="Search staff by name, code, designation, role..."
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
              <p className="font-semibold text-slate-700">No staff members found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query, department filter, or global branch selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => {
                const canonical = normalizeRole(emp.role);
                const roleLabel = ROLE_LABELS[canonical] || emp.role;
                const isCustom = emp.role === 'custom' || emp.customRoleId;
                const customRoleData = isCustom
                  ? customRoles.find((r) => r.id === emp.customRoleId)
                  : null;

                return (
                  <div
                    key={emp.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <StudentAvatar
                            photo={emp.photo}
                            name={emp.name}
                            size="lg"
                            className="h-12 w-12 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">
                              {emp.name}
                            </h4>
                            <p className="font-mono text-[10px] text-blue-900 font-bold">
                              {emp.empCode}
                            </p>
                            {/* Role != Designation explicitly shown */}
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                              {emp.designation}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="rounded bg-blue-50 text-blue-900 border border-blue-100 px-2 py-0.5 text-[10px] font-bold">
                            {customRoleData ? `Custom: ${customRoleData.name}` : roleLabel}
                          </span>
                          <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[9px] font-medium">
                            {emp.department}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{emp.branchName} Campus</span>
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{emp.email}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{emp.phone}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-slate-500">
                          Salary:{' '}
                          <strong className="text-slate-900">
                            ₹{((emp.monthlySalary || 45000) / 1e3).toFixed(0)}k/mo
                          </strong>
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {emp.attendanceRate || 95}% Attendance
                        </span>
                      </div>
                    </div>

                    {/* Action Bar for User Governance */}
                    {canManageUsers && (
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-1.5">
                        <button
                          onClick={() => {
                            if (uiMode === 'view') {
                              showNotification('Switch to Edit Mode in top bar to transfer staff.', true);
                              return;
                            }
                            setSelectedStaffForAction(emp);
                            setTargetBranchId(emp.branchId);
                            setShowTransferModal(true);
                          }}
                          title="Transfer Campus"
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-slate-100 transition"
                        >
                          <ArrowRightLeft className="h-3 w-3" />
                          <span>Transfer</span>
                        </button>

                        {can('roles', 'assign') && (
                          <button
                            onClick={() => {
                              if (uiMode === 'view') {
                                showNotification('Switch to Edit Mode in top bar to reassign roles.', true);
                                return;
                              }
                              setSelectedStaffForAction(emp);
                              setTargetNewRole(emp.role);
                              setShowRoleModal(true);
                            }}
                            title="Assign Role"
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-slate-100 transition"
                          >
                            <Shield className="h-3 w-3" />
                            <span>Change Role</span>
                          </button>
                        )}

                        {can('users', 'disable') && emp.status !== 'inactive' && (
                          <button
                            onClick={() => handleDisableStaff(emp)}
                            title="Deactivate Account"
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50 transition"
                          >
                            Disable
                          </button>
                        )}
                        {emp.status === 'inactive' && (
                          <span className="text-[10px] font-bold text-slate-400 italic">
                            Deactivated
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
              Requires HR, SuperAdmin, or Branch Admin approval to adjust timetable allocations.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {leaveRequests.filter((l) => {
              return scopedStaff.some((e) => e.id === l.employeeId);
            }).length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-slate-700">No leave applications found</p>
                <p className="text-xs text-slate-400 mt-1">
                  There are no leave applications matching the selected branch.
                </p>
              </div>
            ) : (
              leaveRequests
                .filter((l) => {
                  return scopedStaff.some((e) => e.id === l.employeeId);
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
                        <span className="text-slate-500">• {req.daysCount} Day(s)</span>
                      </div>
                      <p className="text-slate-600 font-medium">"{req.reason}"</p>
                      <p className="text-[11px] text-slate-400">
                        Period: {req.startDate} to {req.endDate} • {req.branchName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'pending' ? (
                        can('users', 'edit') && uiMode !== 'view' ? (
                          <>
                            <button
                              onClick={() => updateLeaveStatus(req.id, 'approved')}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 text-xs shadow-2xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => updateLeaveStatus(req.id, 'rejected')}
                              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-bold text-red-700 hover:bg-red-100 text-xs"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold">
                            Pending Approval {uiMode === 'view' ? '(View Only)' : ''}
                          </span>
                        )
                      ) : (
                        <span
                          className={`rounded px-2.5 py-1 text-xs font-bold ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
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

      {/* ROLES & ACCESS GOVERNANCE TAB */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Institutional Safeguard Notice */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900">Institutional Role &amp; Security Safeguard Active</h4>
              <p className="mt-0.5 text-slate-600">
                The Career Heights canonical role matrix guarantees that the active SuperAdmin / Owner cannot be disabled or stripped of administrative control.
                Custom roles created by HQ Admin or SuperAdmin inherit explicit granular permissions and operate strictly within designated campus boundaries.
              </p>
            </div>
          </div>

          {/* Canonical Role Model Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Standard Institutional Roles (Canonical Hierarchy)
                </h3>
                <p className="text-xs text-slate-500">
                  Fixed system roles with standardized permission baselines across all 5 campuses.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{label}</span>
                    <span className="font-mono text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      {key}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {ROLE_DESCRIPTIONS[key] || 'Standard institutional role access.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Roles Management Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Custom RBAC Roles ({customRoles.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Defined by SuperAdmin or HQ Admin for specialized branch responsibilities and delegated workflows.
                </p>
              </div>

              {canManageRoles && (
                <button
                  onClick={() => {
                    if (uiMode === 'view') {
                      showNotification('Switch to Edit Mode to create custom roles.', true);
                      return;
                    }
                    setShowCreateCustomRoleModal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Custom Role</span>
                </button>
              )}
            </div>

            {customRoles.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No custom roles created yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customRoles.map((role) => (
                  <div
                    key={role.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{role.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              role.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {role.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{role.description}</p>
                      </div>

                      {canManageRoles && uiMode !== 'view' && (
                        <button
                          onClick={() => deleteCustomRole(role.id)}
                          title="Delete Custom Role"
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-[11px] font-semibold text-slate-500">
                        Campus Scope:{' '}
                        <span className="text-slate-800 font-bold">
                          {role.assignedBranchIds?.includes('all')
                            ? 'All Campuses'
                            : role.assignedBranchIds
                                ?.map((bid) => branches.find((b) => b.id === bid)?.name || bid)
                                .join(', ')}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-500">
                        Assigned Capabilities:
                      </div>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {Object.entries(role.permissions || {}).map(([mod, acts]) => {
                          const actArr = Array.isArray(acts) ? acts : Object.keys(acts);
                          if (actArr.length === 0) return null;
                          return (
                            <span
                              key={mod}
                              className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-medium"
                            >
                              <strong>{mod}</strong>: {actArr.join(', ')}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF MEMBER / USER */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Enroll New Faculty or Staff Member
                </h3>
                <p className="text-xs text-slate-500">
                  Assign user credentials, system role, and designation.
                </p>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaffSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aafaq Mir"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="aafaq.mir@careerheights.demo"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 94190 55112"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus / Branch *</label>
                  <select
                    value={staffForm.branchId}
                    onChange={(e) => setStaffForm({ ...staffForm, branchId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} Campus ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    System Role * (Authorization)
                  </label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900 font-semibold"
                  >
                    {getAssignableRoles().map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400">
                    Determines system permissions.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Job Designation * (Title)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Physics Faculty"
                    value={staffForm.designation}
                    onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  />
                  <span className="text-[10px] text-slate-400">
                    Display title (Role ≠ Designation).
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Administration">Administration</option>
                    <option value="Counselling">Counselling</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={staffForm.monthlySalary}
                    onChange={(e) => setStaffForm({ ...staffForm, monthlySalary: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={staffForm.qualifications}
                    onChange={(e) => setStaffForm({ ...staffForm, qualifications: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
                >
                  Enroll Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER STAFF */}
      {showTransferModal && selectedStaffForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Transfer Staff Campus Assignment
            </h3>
            <p className="text-xs text-slate-500">
              Reassign <strong>{selectedStaffForAction.name}</strong> from{' '}
              {selectedStaffForAction.branchName} Campus to another branch node.
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Campus</label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} Campus
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE ROLE */}
      {showRoleModal && selectedStaffForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Reassign System Role
            </h3>
            <p className="text-xs text-slate-500">
              Update authorization role for <strong>{selectedStaffForAction.name}</strong>.
            </p>

            <form onSubmit={handleRoleChangeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select New System Role</label>
                <select
                  value={targetNewRole}
                  onChange={(e) => setTargetNewRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900 font-semibold"
                >
                  {getAssignableRoles().map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CUSTOM ROLE */}
      {showCreateCustomRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Custom RBAC Role</h3>
                <p className="text-xs text-slate-500">
                  Configure role name, purpose, campus access, and granular module permissions.
                </p>
              </div>
              <button
                onClick={() => setShowCreateCustomRoleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomRoleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Branch Accountant"
                    value={customRoleForm.name}
                    onChange={(e) => setCustomRoleForm({ ...customRoleForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Access Scope</label>
                  <select
                    value={customRoleForm.assignedBranchIds[0] || 'all'}
                    onChange={(e) =>
                      setCustomRoleForm({
                        ...customRoleForm,
                        assignedBranchIds: [e.target.value],
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                  >
                    <option value="all">All Campuses (Enterprise)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} Campus Only
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purpose / Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Handles branch-level fee collection, student invoicing, and monthly salary records."
                  value={customRoleForm.description}
                  onChange={(e) =>
                    setCustomRoleForm({ ...customRoleForm, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-blue-900"
                />
              </div>

              {/* Granular Permissions Checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Granular Permission Capabilities:
                </label>
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 max-h-56 overflow-y-auto">
                  {[
                    {
                      mod: 'students',
                      label: 'Students Desk',
                      actions: ['view', 'create', 'edit', 'assign'],
                    },
                    {
                      mod: 'fees',
                      label: 'Fees & Accounts',
                      actions: ['view', 'collect', 'receipt', 'edit', 'cancel', 'refund', 'discount', 'scholarship'],
                    },
                    {
                      mod: 'attendance',
                      label: 'Attendance Records',
                      actions: ['view', 'mark', 'edit'],
                    },
                    {
                      mod: 'academic',
                      label: 'Academic Master',
                      actions: ['view', 'add', 'edit', 'solve_doubts'],
                    },
                    {
                      mod: 'examination',
                      label: 'Examination & OMR',
                      actions: ['view', 'add', 'edit', 'publish'],
                    },
                    {
                      mod: 'users',
                      label: 'Users & Staff',
                      actions: ['view', 'create', 'edit', 'assign', 'disable'],
                    },
                    {
                      mod: 'roles',
                      label: 'Roles & Governance',
                      actions: ['view', 'create', 'edit', 'assign'],
                    },
                    {
                      mod: 'reports',
                      label: 'Reports & Analytics',
                      actions: ['view', 'export'],
                    },
                  ].map((group) => (
                    <div key={group.mod} className="border-b border-slate-200/80 pb-2 last:border-0 last:pb-0">
                      <div className="font-bold text-slate-900 mb-1">{group.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {group.actions.map((act) => {
                          const isChecked = (
                            customRoleForm.permissions[group.mod] || []
                          ).includes(act);
                          return (
                            <label
                              key={act}
                              className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded border border-slate-200 text-[11px] text-slate-700 hover:border-blue-900 transition"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermissionInCustomRole(group.mod, act)}
                                className="rounded text-blue-900 focus:ring-blue-900 h-3.5 w-3.5"
                              />
                              <span className="font-mono">{act}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCustomRoleModal(false)}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
                >
                  Publish Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
