import { useEffect } from 'react';
import {
  Users,
  CreditCard,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  Building,
  UserCheck,
  FileText,
  MessageSquare,
  Package,
  FileSpreadsheet,
  BarChart3,
  Award,
  ShieldAlert,
  ShieldCheck,
  User,
  HeartHandshake,
  School,
  X,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole, ROLE_LABELS } from '../../utils/permissionManager';
import { ROUTES } from '../../routes/routeConfig';

export const Sidebar = ({
  activeModule,
  onSelectModule,
  isOpen,
  onClose,
}) => {
  const { currentUser, can } = useAuth();
  const canonicalRole = normalizeRole(currentUser?.role);
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile body scroll lock and restore
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Navigation sections with centralized permission requirements and URL paths
  const navigationSections = [
    {
      title: 'Portals & Dashboards',
      items: [
        {
          id: 'ceo_dashboard',
          label: 'Dashboard',
          icon: ShieldCheck,
          module: 'ceo_dashboard',
          action: 'view',
          path: ROUTES.DASHBOARD,
        },
        {
          id: 'student_portal',
          label: 'Student Portal',
          icon: GraduationCap,
          module: 'student_portal',
          action: 'view',
          path: ROUTES.STUDENT_PORTAL,
        },
        {
          id: 'parent_portal',
          label: 'Parent Portal',
          icon: HeartHandshake,
          module: 'parent_portal',
          action: 'view',
          path: ROUTES.PARENT_PORTAL,
        },
        {
          id: 'faculty_portal',
          label: 'Teacher Portal',
          icon: School,
          module: 'faculty_portal',
          action: 'view',
          path: ROUTES.TEACHER_PORTAL,
        },
      ],
    },
    {
      title: 'Student Lifecycle & Academics',
      items: [
        {
          id: 'students',
          label: 'Students',
          icon: Users,
          module: 'students',
          action: 'view',
          path: ROUTES.STUDENTS,
        },
        {
          id: 'admissions_crm',
          label: 'Admissions CRM',
          icon: UserCheck,
          module: 'admissions_crm',
          action: 'view',
          path: ROUTES.ADMISSIONS,
        },
        {
          id: 'attendance',
          label: 'Attendance',
          icon: CalendarCheck,
          module: 'attendance',
          action: 'view',
          path: ROUTES.ATTENDANCE,
        },
        {
          id: 'academic',
          label: 'Academics & Batches',
          icon: BookOpen,
          module: 'academic',
          action: 'view',
          path: ROUTES.ACADEMIC,
        },
        {
          id: 'examination',
          label: 'Exams & OMR',
          icon: Award,
          module: 'examination',
          action: 'view',
          path: ROUTES.EXAMINATIONS,
        },
        {
          id: 'chtq_scholarship',
          label: 'CHTQ Scholarship',
          icon: GraduationCap,
          module: 'chtq_scholarship',
          action: 'view',
          path: ROUTES.CHTQ,
        },
      ],
    },
    {
      title: 'Operations & Finance',
      items: [
        {
          id: 'fees',
          label: 'Fees & Accounts',
          icon: CreditCard,
          module: 'fees',
          action: 'view',
          path: ROUTES.FEES,
        },
        {
          id: 'reports',
          label: 'Reports & Analytics',
          icon: BarChart3,
          module: 'reports',
          action: 'view',
          path: ROUTES.REPORTS,
        },
        {
          id: 'branch_management',
          label: 'Branches',
          icon: Building,
          module: 'branches',
          action: 'view',
          path: ROUTES.BRANCHES,
        },
        {
          id: 'hr_staff',
          label: 'Staff Management',
          icon: UserCheck,
          module: 'hr_staff',
          action: 'view',
          path: ROUTES.HR_STAFF,
        },
      ],
    },
    {
      title: 'Support & Administration',
      items: [
        {
          id: 'documents',
          label: 'Document Vault',
          icon: FileSpreadsheet,
          module: 'documents',
          action: 'view',
          path: ROUTES.DOCUMENTS,
        },
        {
          id: 'communication',
          label: 'Communications',
          icon: MessageSquare,
          module: 'communication',
          action: 'view',
          path: ROUTES.COMMUNICATION,
        },
        {
          id: 'inventory',
          label: 'Inventory & Assets',
          icon: Package,
          module: 'inventory',
          action: 'view',
          path: ROUTES.INVENTORY,
        },
        {
          id: 'audit_logs',
          label: 'Demo Audit Trail',
          icon: ShieldAlert,
          module: 'audit_logs',
          action: 'view',
          path: ROUTES.AUDIT_LOGS,
        },
      ],
    },
  ];

  const roleLabel = ROLE_LABELS[canonicalRole] || currentUser?.roleTitle || 'User';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 font-black text-white shadow-xs">
              CH
            </div>
            <div>
              <span className="block text-sm font-black tracking-tight text-blue-900 leading-tight">
                CAREER HEIGHTS
              </span>
              <span className="block text-[10px] font-bold text-amber-600 tracking-wider uppercase">
                Enterprise ERP
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Navigation filtered through can(module, action) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navigationSections.map((section) => {
            const visibleItems = section.items.filter((item) => {
              return can(item.module, item.action);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-0.5 pt-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isPathActive =
                      location.pathname === item.path ||
                      (item.path !== ROUTES.DASHBOARD && location.pathname.startsWith(item.path + '/')) ||
                      (item.id === 'students' && location.pathname.startsWith('/students'));
                    const isActive = isPathActive || activeModule === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(item.path);
                          if (onSelectModule) {
                            onSelectModule(item.id);
                          }
                          onClose();
                        }}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                          isActive
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition ${
                            isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-blue-900'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Identity & System Role Card (Role ≠ Designation) */}
        <div className="border-t border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-900 text-xs shadow-2xs border border-blue-200">
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'CH'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">
                {currentUser?.name || 'Authorized Staff'}
              </p>
              {/* Designation display (Role ≠ Designation) */}
              <p className="truncate text-[10px] text-slate-500 font-medium">
                {currentUser?.designation || currentUser?.branchName || 'Career Heights Kashmir'}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center rounded bg-blue-900/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-900">
                  {roleLabel}
                </span>
                {currentUser?.assignedBranchIds?.includes('all') || !currentUser?.branchId ? (
                  <span className="text-[9px] text-emerald-700 font-semibold">
                    All Campuses
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 truncate">
                    {currentUser.branchName || 'Branch Node'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
