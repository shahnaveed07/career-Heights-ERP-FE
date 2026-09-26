/**
 * Career Heights ERP — Centralized Canonical Role & Granular Permission Manager
 * 
 * Hierarchy:
 * SuperAdmin = Owner
 *       ↓
 * HQ Admin
 *       ↓
 * Admin (Branch Operational Director)
 *       ├── Accountant / Coordinator (One Combined Canonical Role)
 *       ├── Teacher (Role ≠ Designation e.g. Senior Physics Faculty)
 *       ├── HR (Head of HR & Staff Directory)
 *       └── Custom Roles (Role Name, Purpose, Permissions, Branch Access, Status)
 */

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  HQ_ADMIN: 'hq_admin',
  BRANCH_ADMIN: 'branch_admin',
  ACCOUNTANT_COORDINATOR: 'accountant_coordinator',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  HR: 'hr',
  CUSTOM: 'custom',
};

export const ROLE_LABELS = {
  [SYSTEM_ROLES.SUPER_ADMIN]: 'SuperAdmin / Owner',
  [SYSTEM_ROLES.HQ_ADMIN]: 'HQ Admin',
  [SYSTEM_ROLES.BRANCH_ADMIN]: 'Admin',
  [SYSTEM_ROLES.ACCOUNTANT_COORDINATOR]: 'Accountant / Coordinator',
  [SYSTEM_ROLES.TEACHER]: 'Teacher',
  [SYSTEM_ROLES.STUDENT]: 'Student',
  [SYSTEM_ROLES.PARENT]: 'Parent / Guardian',
  [SYSTEM_ROLES.HR]: 'HR',
  [SYSTEM_ROLES.CUSTOM]: 'Custom Role',
};

export const ROLE_DESCRIPTIONS = {
  [SYSTEM_ROLES.SUPER_ADMIN]: 'Full enterprise ownership. Manages branches, user creation, custom roles, and global finance.',
  [SYSTEM_ROLES.HQ_ADMIN]: 'Operational director. Configures branch admins, coordinators, and enterprise operations.',
  [SYSTEM_ROLES.BRANCH_ADMIN]: 'Campus operational director. Oversees campus admissions, attendance, teachers, and batches.',
  [SYSTEM_ROLES.ACCOUNTANT_COORDINATOR]: 'Unified desk for fee collections, invoicing, scholarship verification, and payroll records.',
  [SYSTEM_ROLES.TEACHER]: 'Classroom faculty. Manages daily attendance, syllabus, doubts resolution, and homework assignments.',
  [SYSTEM_ROLES.STUDENT]: 'Enrolled student learner portal for test results, OMR scorecards, attendance, and study materials.',
  [SYSTEM_ROLES.PARENT]: 'Guardian monitoring portal for fee installment ledger, attendance alerts, and test performance.',
  [SYSTEM_ROLES.HR]: 'Workforce administration, employee directory, leaves approval, and salary pool reconciliation.',
  [SYSTEM_ROLES.CUSTOM]: 'Specialized role configured with granular permissions for custom operational responsibilities.',
};

/**
 * Normalizes any legacy or alias role string into the canonical system role key.
 */
export function normalizeRole(role) {
  if (!role) return null;
  const r = String(role).toLowerCase().trim();

  // SuperAdmin aliases
  if (r === 'ceo' || r === 'super_admin' || r === 'superadmin' || r === 'owner') {
    return SYSTEM_ROLES.SUPER_ADMIN;
  }
  // HQ Admin aliases
  if (r === 'hq_admin' || r === 'hqadmin') {
    return SYSTEM_ROLES.HQ_ADMIN;
  }
  // Branch Admin aliases
  if (r === 'branch_admin' || r === 'branchadmin' || r === 'admin') {
    return SYSTEM_ROLES.BRANCH_ADMIN;
  }
  // Accountant / Coordinator aliases (Unified single canonical role)
  if (
    r === 'accountant' ||
    r === 'coordinator' ||
    r === 'accountant_coordinator' ||
    r === 'counsellor' // Legacy counsellor role migrated to coordinator permissions
  ) {
    return SYSTEM_ROLES.ACCOUNTANT_COORDINATOR;
  }
  // Teacher aliases
  if (r === 'faculty' || r === 'teacher') {
    return SYSTEM_ROLES.TEACHER;
  }
  // Student
  if (r === 'student') {
    return SYSTEM_ROLES.STUDENT;
  }
  // Parent / Guardian
  if (r === 'parent' || r === 'guardian') {
    return SYSTEM_ROLES.PARENT;
  }
  // HR aliases
  if (r === 'hr' || r === 'hr_manager' || r === 'hrmanager') {
    return SYSTEM_ROLES.HR;
  }
  // Custom roles retain their key or default to custom
  return r;
}

/**
 * Normalizes permission actions (supporting both canonical short verbs and legacy descriptive phrases)
 */
export function normalizeAction(action) {
  if (!action) return 'view';
  const a = String(action).toLowerCase().trim();

  if (a === 'add' || a === 'create') return 'create';
  if (a === 'collect_payment' || a === 'collect') return 'collect';
  if (a === 'generate_receipt' || a === 'receipt') return 'receipt';
  if (a === 'apply_discount' || a === 'discount') return 'discount';
  if (a === 'mark_attendance' || a === 'mark') return 'mark';
  if (a === 'export_report' || a === 'export') return 'export';
  if (a === 'upload_omr' || a === 'omr') return 'upload_omr';
  if (a === 'publish_result' || a === 'publish') return 'publish';
  return a;
}

export const MODULES = {
  STUDENTS: 'students',
  FEES: 'fees',
  ATTENDANCE: 'attendance',
  ACADEMIC: 'academic',
  EXAMINATION: 'examination',
  REPORTS: 'reports',
  USERS: 'users',
  ROLES: 'roles',
  CUSTOM_ROLES: 'custom_roles',
  BRANCHES: 'branches',
  TEACHERS: 'teachers',
  DOCUMENTS: 'documents',
  COMMUNICATION: 'communication',
  INVENTORY: 'inventory',
  AUDIT_LOGS: 'audit_logs',
  CRM: 'admissions_crm',
  CHTQ_SCHOLARSHIP: 'chtq_scholarship',
  HR_STAFF: 'hr_staff',
  CEO_DASHBOARD: 'ceo_dashboard',
  STUDENT_PORTAL: 'student_portal',
  PARENT_PORTAL: 'parent_portal',
  FACULTY_PORTAL: 'faculty_portal',
  DASHBOARD: 'dashboard',
};

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  ASSIGN: 'assign',
  COLLECT: 'collect',
  RECEIPT: 'receipt',
  CANCEL: 'cancel',
  REFUND: 'refund',
  DISCOUNT: 'discount',
  SCHOLARSHIP: 'scholarship',
  MARK: 'mark',
  EXPORT: 'export',
  DISABLE: 'disable',
  SOLVE_DOUBTS: 'solve_doubts',
  UPLOAD_OMR: 'upload_omr',
  PUBLISH: 'publish',
  MANAGE_SALARY: 'manage_salary',
  RESET_PASSWORD: 'reset_password',
};

/**
 * Checks whether an allowed actions list satisfies the requested action,
 * respecting wildcard and action aliases.
 */
function actionMatches(allowedList, targetAction) {
  if (!allowedList || !Array.isArray(allowedList)) return false;
  if (allowedList.includes('*')) return true;
  if (allowedList.includes(targetAction)) return true;

  const targetNorm = normalizeAction(targetAction);
  return allowedList.some((act) => {
    if (act === '*') return true;
    if (act === targetAction) return true;
    return normalizeAction(act) === targetNorm;
  });
}

/**
 * Canonical Role Permissions Matrix
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  // SuperAdmin (Owner): Unrestricted authority across all modules and actions
  [SYSTEM_ROLES.SUPER_ADMIN]: {
    '*': ['*'],
  },

  // HQ Admin: Central institutional operations, multi-branch oversight, staff & student admin
  [SYSTEM_ROLES.HQ_ADMIN]: {
    branches: ['view', 'create', 'edit', 'add'],
    users: ['view', 'create', 'edit', 'assign', 'reset_password', 'add'],
    roles: ['view', 'create', 'edit', 'assign'],
    custom_roles: ['view', 'create', 'edit', 'assign'],
    students: ['view', 'create', 'edit', 'assign', 'add'],
    fees: [
      'view',
      'collect',
      'collect_payment',
      'receipt',
      'generate_receipt',
      'discount',
      'apply_discount',
      'scholarship',
      'edit',
      'manage_salary',
    ],
    attendance: ['view', 'mark', 'mark_attendance', 'edit'],
    academic: ['view', 'create', 'edit', 'add'],
    examination: ['view', 'create', 'edit', 'upload_omr', 'publish', 'add'],
    reports: ['view', 'export', 'export_report'],
    admissions_crm: ['view', 'create', 'edit', 'convert', 'add'],
    documents: ['view', 'upload', 'approve', 'delete', 'add', 'edit'],
    communication: ['view', 'send', 'broadcast', 'add'],
    inventory: ['view', 'create', 'edit', 'assign', 'add'],
    audit_logs: ['view'],
    teachers: ['view', 'assign'],
    ceo_dashboard: ['view'],
    dashboard: ['view'],
    hr_staff: ['view', 'create', 'edit', 'add'],
    chtq_scholarship: ['view', 'create', 'edit', 'add'],
  },

  // Admin (Branch Director): Branch operational management
  [SYSTEM_ROLES.BRANCH_ADMIN]: {
    students: ['view', 'create', 'edit', 'assign', 'add'],
    teachers: ['view', 'assign'],
    accountant_coordinator: ['view'],
    fees: ['view', 'collect', 'collect_payment', 'receipt', 'generate_receipt'],
    attendance: ['view', 'mark', 'mark_attendance', 'edit'],
    academic: ['view', 'create', 'edit', 'add'],
    examination: ['view', 'create', 'edit', 'upload_omr', 'add'],
    reports: ['view', 'export', 'export_report'],
    admissions_crm: ['view', 'create', 'edit', 'convert', 'add'],
    documents: ['view', 'upload', 'approve', 'add'],
    communication: ['view', 'send', 'add'],
    inventory: ['view', 'create', 'add'],
    users: ['view'],
    dashboard: ['view'],
    ceo_dashboard: ['view'],
    hr_staff: ['view'],
    chtq_scholarship: ['view', 'create', 'edit', 'add'],
  },

  // Accountant / Coordinator (One Unified Canonical Role)
  [SYSTEM_ROLES.ACCOUNTANT_COORDINATOR]: {
    fees: [
      'view',
      'collect',
      'collect_payment',
      'receipt',
      'generate_receipt',
      'discount',
      'apply_discount',
      'edit',
      'scholarship',
      'manage_salary',
    ],
    students: ['view'],
    reports: ['view', 'export', 'export_report'],
    communication: ['view', 'send', 'add'],
    documents: ['view', 'upload', 'add'],
    academic: ['view'],
    attendance: ['view'],
    admissions_crm: ['view', 'create', 'edit', 'add'], // For coordinator enquiries
    chtq_scholarship: ['view', 'create', 'edit', 'add'],
    dashboard: ['view'],
  },

  // Teacher (System Role: teacher, Designation e.g. Senior Physics Faculty)
  [SYSTEM_ROLES.TEACHER]: {
    attendance: ['view', 'mark', 'mark_attendance'],
    academic: ['view', 'create', 'edit', 'solve_doubts', 'add'],
    examination: ['view'],
    students: ['view'],
    communication: ['view', 'send', 'add'],
    documents: ['view', 'upload', 'add'],
    faculty_portal: ['view'],
    teacher_portal: ['view'],
    dashboard: ['view'],
  },

  // Student: View own academic progress, timetable, tests, fees, doubts
  [SYSTEM_ROLES.STUDENT]: {
    student_portal: ['view'],
    academic: ['view', 'solve_doubts'],
    examination: ['view'],
    attendance: ['view'],
    fees: ['view'],
    documents: ['view'],
    communication: ['view'],
    dashboard: ['view'],
  },

  // Parent / Guardian: View linked student(s), attendance, exams, fees, notices
  [SYSTEM_ROLES.PARENT]: {
    parent_portal: ['view'],
    academic: ['view'],
    examination: ['view'],
    attendance: ['view'],
    fees: ['view'],
    documents: ['view'],
    communication: ['view'],
    dashboard: ['view'],
  },

  // HR (Head of HR, staff directory, leaves, attendance records)
  [SYSTEM_ROLES.HR]: {
    users: ['view', 'create', 'edit', 'assign', 'add'],
    hr_staff: ['view', 'create', 'edit', 'add'],
    attendance: ['view', 'mark', 'mark_attendance', 'edit'],
    documents: ['view', 'upload', 'approve', 'add', 'edit'],
    communication: ['view', 'send', 'add'],
    reports: ['view'],
    dashboard: ['view'],
  },
  // Custom Role (Granular user-defined role with custom permissions)
  [SYSTEM_ROLES.CUSTOM]: {
    dashboard: ['view'],
  },
};

// Aliases mapped into DEFAULT_ROLE_PERMISSIONS for backwards safety
DEFAULT_ROLE_PERMISSIONS.ceo = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.SUPER_ADMIN];
DEFAULT_ROLE_PERMISSIONS.faculty = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.TEACHER];
DEFAULT_ROLE_PERMISSIONS.accountant = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.ACCOUNTANT_COORDINATOR];
DEFAULT_ROLE_PERMISSIONS.hr_manager = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.HR];
DEFAULT_ROLE_PERMISSIONS.counsellor = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.ACCOUNTANT_COORDINATOR];

/**
 * Check if a user has permission to perform an action on a module.
 * 
 * Enforces:
 * 1. View-Only Mode: If uiMode === 'view', ONLY 'view' action is permitted.
 * 2. SuperAdmin bypass: 'super_admin' (or legacy 'ceo') has unrestricted rights.
 * 3. Custom permissions check (if user has customPermissions).
 * 4. Granular role permissions table check.
 * 
 * Supports both:
 * checkPermission(user, 'students', 'create', uiMode)
 * checkPermission(user, 'students.create', 'view', uiMode)
 */
export function checkPermission(user, moduleOrPermission, action = 'view', uiMode = 'edit') {
  if (!user) return false;

  let targetModule = moduleOrPermission;
  let targetAction = action;

  // Support dot notation: can('students.create')
  if (typeof moduleOrPermission === 'string' && moduleOrPermission.includes('.')) {
    const parts = moduleOrPermission.split('.');
    targetModule = parts[0];
    targetAction = parts.slice(1).join('.');
  }

  // VIEW ONLY MODE: Strictly prevent any mutating action
  if (uiMode === 'view' && targetAction !== 'view') {
    return false;
  }

  const role = normalizeRole(user.role);

  // SuperAdmin has full permissions
  if (role === SYSTEM_ROLES.SUPER_ADMIN) {
    return true;
  }

  // Check if user has customPermissions or permissions attached
  const customPerms = user.customPermissions || user.permissions;
  if (customPerms) {
    if (Array.isArray(customPerms)) {
      const match = customPerms.some((p) => {
        if (p === '*' || p === targetModule) return true;
        const separator = p.includes(':') ? ':' : p.includes('.') ? '.' : null;
        if (separator) {
          const [m, a] = p.split(separator);
          return m === targetModule && actionMatches([a], targetAction);
        }
        return false;
      });
      if (match) return true;
    } else if (typeof customPerms === 'object') {
      if (customPerms['*'] && actionMatches(customPerms['*'], targetAction)) {
        return true;
      }
      if (customPerms[targetModule] && actionMatches(customPerms[targetModule], targetAction)) {
        return true;
      }
    }
  }

  // Check standard role permissions matrix
  const rolePerms = DEFAULT_ROLE_PERMISSIONS[role];
  if (!rolePerms) return false;

  // Wildcard module
  if (rolePerms['*'] && actionMatches(rolePerms['*'], targetAction)) {
    return true;
  }

  const allowedActions = rolePerms[targetModule];
  if (!allowedActions) return false;

  return actionMatches(allowedActions, targetAction);
}

/**
 * Resolve which branches a user can access.
 * SuperAdmin and HQ Admin can access all branches.
 * Other users are restricted to user.assignedBranchIds or user.branchId.
 */
export function getUserAccessibleBranches(user, allBranches = []) {
  if (!user) return [];

  const role = normalizeRole(user.role);
  if (role === SYSTEM_ROLES.SUPER_ADMIN || role === SYSTEM_ROLES.HQ_ADMIN) {
    return allBranches;
  }

  const assigned = user.assignedBranchIds || (user.branchId ? [user.branchId] : []);
  if (assigned.includes('all')) {
    return allBranches;
  }

  return allBranches.filter((b) => assigned.includes(b.id));
}

/**
 * Check if a user has access to a specific branch ID.
 * SuperAdmin & HQ Admin can access any branch or 'all'.
 */
export function canAccessBranch(user, branchId) {
  if (!user) return false;
  const role = normalizeRole(user.role);
  if (role === SYSTEM_ROLES.SUPER_ADMIN || role === SYSTEM_ROLES.HQ_ADMIN) {
    return true;
  }
  if (branchId === 'all') {
    return false; // Only central leadership can view consolidated all-branches
  }
  const assigned = user.assignedBranchIds || (user.branchId ? [user.branchId] : []);
  return assigned.includes('all') || assigned.includes(branchId);
}

/**
 * Security Safeguard:
 * Never allow the last active SuperAdmin to be disabled/deactivated.
 */
export function canDisableUser(actor, targetUser, allUsers = []) {
  if (!actor || !targetUser) {
    return { allowed: false, reason: 'Invalid parameters for user state change.' };
  }

  const actorRole = normalizeRole(actor.role);
  const targetRole = normalizeRole(targetUser.role);

  if (targetRole === SYSTEM_ROLES.SUPER_ADMIN) {
    // Check if target is the last active SuperAdmin
    const activeSuperAdmins = (allUsers || []).filter(
      (u) =>
        normalizeRole(u.role) === SYSTEM_ROLES.SUPER_ADMIN &&
        u.status !== 'inactive' &&
        u.status !== 'disabled'
    );

    if (
      activeSuperAdmins.length <= 1 &&
      (targetUser.id === activeSuperAdmins[0]?.id ||
        activeSuperAdmins.some((u) => u.email === targetUser.email))
    ) {
      return {
        allowed: false,
        reason:
          'Governance Safeguard: The last active SuperAdmin / Owner account cannot be disabled or deactivated.',
      };
    }

    if (actorRole !== SYSTEM_ROLES.SUPER_ADMIN) {
      return {
        allowed: false,
        reason: 'Security Policy: Only a SuperAdmin can modify SuperAdmin account status.',
      };
    }
  }

  if (actorRole !== SYSTEM_ROLES.SUPER_ADMIN && actorRole !== SYSTEM_ROLES.HQ_ADMIN) {
    return {
      allowed: false,
      reason: 'Authority Denied: Only SuperAdmin or HQ Admin can disable staff accounts.',
    };
  }

  return { allowed: true };
}

/**
 * Determine which roles an actor is authorized to create.
 * SuperAdmin: Can create all roles.
 * HQ Admin: Can create Admin, Accountant / Coordinator, Teacher, Student, Parent, Custom Roles.
 * Admin: Can create Student, Parent.
 */
export function getCreatableRoles(actor) {
  if (!actor) return [];
  const role = normalizeRole(actor.role);

  if (role === SYSTEM_ROLES.SUPER_ADMIN) {
    return [
      SYSTEM_ROLES.SUPER_ADMIN,
      SYSTEM_ROLES.HQ_ADMIN,
      SYSTEM_ROLES.BRANCH_ADMIN,
      SYSTEM_ROLES.ACCOUNTANT_COORDINATOR,
      SYSTEM_ROLES.TEACHER,
      SYSTEM_ROLES.HR,
      SYSTEM_ROLES.STUDENT,
      SYSTEM_ROLES.PARENT,
      SYSTEM_ROLES.CUSTOM,
    ];
  }

  if (role === SYSTEM_ROLES.HQ_ADMIN) {
    return [
      SYSTEM_ROLES.BRANCH_ADMIN,
      SYSTEM_ROLES.ACCOUNTANT_COORDINATOR,
      SYSTEM_ROLES.TEACHER,
      SYSTEM_ROLES.STUDENT,
      SYSTEM_ROLES.PARENT,
      SYSTEM_ROLES.CUSTOM,
    ];
  }

  if (role === SYSTEM_ROLES.BRANCH_ADMIN) {
    return [SYSTEM_ROLES.STUDENT, SYSTEM_ROLES.PARENT];
  }

  return [];
}
