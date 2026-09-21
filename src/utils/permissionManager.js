/**
 * Career Heights ERP - Granular Permission & Authority Manager
 * 
 * Hierarchy:
 * SuperAdmin = Owner
 *       ↓
 * HQ Admin
 *       ↓
 * Admin (Branch Director)
 *       ├── Teacher / Faculty
 *       ├── Accountant / Coordinator (One Combined Role)
 *       ├── HR Manager
 *       └── Custom Roles
 */

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  HQ_ADMIN: 'hq_admin',
  BRANCH_ADMIN: 'branch_admin',
  TEACHER: 'faculty',
  ACCOUNTANT_COORDINATOR: 'accountant',
  HR_MANAGER: 'hr_manager',
  COUNSELLOR: 'counsellor',
  STUDENT: 'student',
  PARENT: 'parent',
  CUSTOM: 'custom',
};

export const MODULES = {
  STUDENTS: 'students',
  FEES: 'fees',
  ATTENDANCE: 'attendance',
  ACADEMIC: 'academic',
  EXAMINATION: 'examination',
  REPORTS: 'reports',
  USERS: 'users',
  BRANCHES: 'branches',
  TEACHERS: 'teachers',
  DOCUMENTS: 'documents',
  COMMUNICATION: 'communication',
  INVENTORY: 'inventory',
  AUDIT_LOGS: 'audit_logs',
  CUSTOM_ROLES: 'custom_roles',
  CRM: 'admissions_crm',
};

export const ACTIONS = {
  VIEW: 'view',
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  ASSIGN: 'assign',
  COLLECT_PAYMENT: 'collect_payment',
  GENERATE_RECEIPT: 'generate_receipt',
  CANCEL_PAYMENT: 'cancel_payment',
  APPLY_DISCOUNT: 'apply_discount',
  MARK_ATTENDANCE: 'mark_attendance',
  EXPORT_REPORT: 'export_report',
  RESET_PASSWORD: 'reset_password',
  MANAGE_SALARY: 'manage_salary',
  SOLVE_DOUBTS: 'solve_doubts',
};

// Default Role Permissions Matrix
export const DEFAULT_ROLE_PERMISSIONS = {
  // SuperAdmin (CEO / Owner): Absolute authority across all modules & actions
  ceo: { '*': ['*'] },
  super_admin: { '*': ['*'] },

  // HQ Admin: Day-to-day central operations, branches, staff, students, fees, reports, custom roles
  hq_admin: {
    branches: ['view', 'add', 'edit'],
    users: ['view', 'add', 'edit', 'assign', 'reset_password'],
    custom_roles: ['view', 'create', 'edit'],
    students: ['view', 'add', 'edit', 'assign'],
    fees: ['view', 'collect_payment', 'generate_receipt', 'apply_discount', 'manage_salary'],
    attendance: ['view', 'mark_attendance', 'edit'],
    academic: ['view', 'add', 'edit'],
    examination: ['view', 'add', 'edit'],
    reports: ['view', 'export_report'],
    admissions_crm: ['view', 'add', 'edit'],
    documents: ['view', 'add', 'edit'],
    communication: ['view', 'add'],
    inventory: ['view', 'add', 'edit'],
    audit_logs: ['view'],
    teachers: ['view', 'assign'],
  },

  // Admin / Branch Director: Branch-specific operational authority
  branch_admin: {
    students: ['view', 'add', 'edit', 'assign'],
    fees: ['view', 'collect_payment', 'generate_receipt'],
    attendance: ['view', 'mark_attendance', 'edit'],
    academic: ['view', 'add', 'edit'],
    examination: ['view', 'add', 'edit'],
    reports: ['view', 'export_report'],
    admissions_crm: ['view', 'add', 'edit'],
    documents: ['view', 'add'],
    communication: ['view', 'add'],
    inventory: ['view', 'add'],
    teachers: ['view', 'assign'],
    users: ['view'],
  },

  // Accountant & Coordinator (ONE ROLE): Fees, Receipts, Discounts, Notifications, Salary Management
  accountant: {
    fees: ['view', 'collect_payment', 'generate_receipt', 'apply_discount', 'edit', 'manage_salary'],
    students: ['view'],
    reports: ['view', 'export_report'],
    communication: ['view', 'add'],
    documents: ['view', 'add'],
  },
  accountant_coordinator: {
    fees: ['view', 'collect_payment', 'generate_receipt', 'apply_discount', 'edit', 'manage_salary'],
    students: ['view'],
    reports: ['view', 'export_report'],
    communication: ['view', 'add'],
    documents: ['view', 'add'],
  },

  // Teacher / Faculty: Mark own attendance, mark assigned student attendance, doubts, notes, view exams
  faculty: {
    attendance: ['view', 'mark_attendance'],
    academic: ['view', 'add', 'edit', 'solve_doubts'],
    examination: ['view'],
    students: ['view'],
    communication: ['view', 'add'],
    documents: ['view', 'add'],
  },
  teacher: {
    attendance: ['view', 'mark_attendance'],
    academic: ['view', 'add', 'edit', 'solve_doubts'],
    examination: ['view'],
    students: ['view'],
    communication: ['view', 'add'],
    documents: ['view', 'add'],
  },

  // HR Manager: Staff directory, leaves, attendance, documents
  hr_manager: {
    users: ['view', 'add', 'edit'],
    attendance: ['view', 'mark_attendance', 'edit'],
    documents: ['view', 'add', 'edit'],
    communication: ['view', 'add'],
    reports: ['view'],
  },

  // Counsellor: Admissions CRM, CHTQ scholarship, student enquiries
  counsellor: {
    admissions_crm: ['view', 'add', 'edit'],
    students: ['view'],
    communication: ['view', 'add'],
    documents: ['view', 'add'],
  },

  // Student: View own academic progress, timetable, tests, fees, pay fees, post doubts
  student: {
    academic: ['view'],
    examination: ['view'],
    attendance: ['view'],
    fees: ['view'],
    documents: ['view'],
    communication: ['view'],
  },

  // Parent: View linked student(s), attendance, exams, fees, receipts, notices
  parent: {
    academic: ['view'],
    examination: ['view'],
    attendance: ['view'],
    fees: ['view'],
    documents: ['view'],
    communication: ['view'],
  },
};

/**
 * Check if a user has permission to perform an action on a module.
 * 
 * Enforces:
 * 1. View-Only Mode: If uiMode is 'view', ONLY 'view' action is permitted.
 * 2. SuperAdmin bypass: 'ceo' or 'super_admin' has unrestricted rights.
 * 3. Granular permission table check.
 * 4. Custom role permissions if user role is custom.
 */
export function checkPermission(user, module, action = 'view', uiMode = 'edit') {
  if (!user) return false;

  // VIEW ONLY MODE: Strictly prevent any mutating action
  if (uiMode === 'view' && action !== 'view') {
    return false;
  }

  const role = user.role;

  // SuperAdmin has full permissions
  if (role === 'ceo' || role === 'super_admin') {
    return true;
  }

  // Check if user has custom permissions attached
  if (user.customPermissions && user.customPermissions[module]) {
    const modPerms = user.customPermissions[module];
    if (modPerms.includes('*') || modPerms.includes(action)) {
      return true;
    }
  }

  // Check standard role permissions
  const rolePerms = DEFAULT_ROLE_PERMISSIONS[role];
  if (!rolePerms) return false;

  // Wildcard module
  if (rolePerms['*'] && (rolePerms['*'].includes('*') || rolePerms['*'].includes(action))) {
    return true;
  }

  const moduleActions = rolePerms[module];
  if (!moduleActions) return false;

  return moduleActions.includes('*') || moduleActions.includes(action);
}

/**
 * Resolve which branches a user can access.
 * SuperAdmin and HQ Admin can access all branches.
 * Other users are restricted to user.assignedBranchIds or user.branchId.
 */
export function getUserAccessibleBranches(user, allBranches = []) {
  if (!user) return [];

  const role = user.role;
  if (role === 'ceo' || role === 'super_admin' || role === 'hq_admin') {
    return allBranches;
  }

  const assigned = user.assignedBranchIds || (user.branchId ? [user.branchId] : []);
  if (assigned.includes('all')) {
    return allBranches;
  }

  return allBranches.filter((b) => assigned.includes(b.id));
}
