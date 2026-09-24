import { SYSTEM_ROLES, normalizeRole } from '../utils/permissionManager';

export const ROUTES = {
  // Public Routes
  HOME: '/',
  ABOUT: '/about',
  COURSES: '/courses',
  BATCHES: '/batches',
  RESULTS: '/results',
  PUBLIC_BRANCHES: '/branches',
  CONTACT: '/contact',
  LOGIN: '/login',

  // ERP Routes
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  STUDENT_DETAIL: '/students/:studentId',
  ADMISSIONS: '/admissions',
  ATTENDANCE: '/attendance',
  ACADEMIC: '/academic',
  EXAMINATIONS: '/examinations',
  FEES: '/fees',
  FEES_PAYMENT_NEW: '/fees/payments/new',
  BRANCHES: '/branches',
  CAMPUS: '/campus',
  COMMUNICATION: '/communication',
  REPORTS: '/reports',
  AUDIT_LOGS: '/audit-logs',
  DOCUMENTS: '/documents',
  INVENTORY: '/inventory',
  CHTQ: '/chtq',
  HR_STAFF: '/hr-staff',

  // Portals
  STUDENT_PORTAL: '/student',
  PARENT_PORTAL: '/parent',
  TEACHER_PORTAL: '/teacher',
};

/**
 * Resolves the primary default landing route for an authenticated user based on role.
 */
export function getDefaultRouteForRole(role) {
  const canonical = normalizeRole(role);
  switch (canonical) {
    case SYSTEM_ROLES.STUDENT:
      return ROUTES.STUDENT_PORTAL;
    case SYSTEM_ROLES.PARENT:
      return ROUTES.PARENT_PORTAL;
    case SYSTEM_ROLES.TEACHER:
      return ROUTES.TEACHER_PORTAL;
    case SYSTEM_ROLES.ACCOUNTANT_COORDINATOR:
      return ROUTES.FEES;
    case SYSTEM_ROLES.HR:
      return ROUTES.HR_STAFF;
    case SYSTEM_ROLES.BRANCH_ADMIN:
    case SYSTEM_ROLES.HQ_ADMIN:
    case SYSTEM_ROLES.SUPER_ADMIN:
    default:
      return ROUTES.DASHBOARD;
  }
}

/**
 * Maps legacy module keys to modern URL paths.
 */
export function moduleToPath(moduleId) {
  switch (moduleId) {
    case 'ceo_dashboard':
    case 'dashboard':
      return ROUTES.DASHBOARD;
    case 'student_portal':
      return ROUTES.STUDENT_PORTAL;
    case 'parent_portal':
      return ROUTES.PARENT_PORTAL;
    case 'faculty_portal':
    case 'teacher':
      return ROUTES.TEACHER_PORTAL;
    case 'students':
      return ROUTES.STUDENTS;
    case 'admissions_crm':
    case 'admissions':
      return ROUTES.ADMISSIONS;
    case 'attendance':
      return ROUTES.ATTENDANCE;
    case 'academic':
      return ROUTES.ACADEMIC;
    case 'examination':
    case 'examinations':
      return ROUTES.EXAMINATIONS;
    case 'fees':
      return ROUTES.FEES;
    case 'branch_management':
    case 'branches':
      return ROUTES.BRANCHES;
    case 'communication':
      return ROUTES.COMMUNICATION;
    case 'reports':
      return ROUTES.REPORTS;
    case 'audit_logs':
    case 'audit-logs':
      return ROUTES.AUDIT_LOGS;
    case 'documents':
      return ROUTES.DOCUMENTS;
    case 'inventory':
      return ROUTES.INVENTORY;
    case 'chtq_scholarship':
    case 'chtq':
      return ROUTES.CHTQ;
    case 'hr_staff':
    case 'hr':
      return ROUTES.HR_STAFF;
    default:
      return ROUTES.DASHBOARD;
  }
}
