import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  CreditCard,
  BookOpen,
  Award,
  GraduationCap,
  Building,
  MessageSquare,
  Briefcase,
  Package,
  FileCheck2,
  ScrollText,
  UserCheck,
  Layers,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useErpData } from '../../context/ErpDataContext';
export const Sidebar = ({ activeModule, onSelectModule, isOpen, onClose }) => {
  const { currentUser, can, activeBranchFilter } = useAuth();
  const { students, enquiries, documents, doubts, branches } = useErpData();

  const currentBranch = branches.find((b) => b.id === activeBranchFilter);
  const activeBranchDisplay =
    activeBranchFilter === 'all'
      ? 'HQ Central (All 5 Branches)'
      : `${currentBranch?.name || currentUser?.branchName || 'Handwara'} Campus`;

  const pendingDocsCount = documents.filter(
    (d) => d.status === 'pending'
  ).length;
  const openDoubtsCount = doubts.filter((d) => d.status === 'open').length;
  const activeEnquiriesCount = enquiries.filter(
    (e) => e.status !== 'admission' && e.status !== 'lost'
  ).length;
  const sections = [
    {
      sectionTitle: 'MAIN CONSOLE',
      items: [
        {
          id: 'dashboard',
          label:
            currentUser?.role === 'ceo'
              ? 'CEO Dashboard'
              : currentUser?.role === 'student'
                ? 'Student Portal'
                : currentUser?.role === 'parent'
                  ? 'Parent Portal'
                  : currentUser?.role === 'faculty'
                    ? 'Faculty Portal'
                    : 'Executive Dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      sectionTitle: 'ROLE-SPECIFIC PORTALS',
      items: [
        {
          id: 'ceo_dashboard',
          label: 'CEO Dashboard (Primary)',
          icon: ShieldCheck,
          roles: ['ceo', 'hq_admin'],
        },
        {
          id: 'student_portal',
          label: 'Student Portal',
          icon: GraduationCap,
          roles: ['student', 'ceo', 'hq_admin', 'branch_admin'],
        },
        {
          id: 'parent_portal',
          label: 'Parent Portal',
          icon: Users,
          roles: ['parent', 'ceo', 'hq_admin', 'branch_admin'],
        },
        {
          id: 'faculty_portal',
          label: 'Faculty Module',
          icon: UserCheck,
          roles: ['faculty', 'ceo', 'hq_admin', 'branch_admin'],
        },
      ],
    },
    {
      sectionTitle: 'ACADEMIC & STUDENTS',
      items: [
        {
          id: 'students',
          label: 'Student Management',
          icon: Users,
          badge: students.length,
          roles: [
            'ceo',
            'hq_admin',
            'branch_admin',
            'faculty',
            'counsellor',
            'accountant',
          ],
        },
        {
          id: 'admissions_crm',
          label: 'Admission & Enquiry CRM',
          icon: UserPlus,
          badge: activeEnquiriesCount,
          badgeColor: 'bg-amber-100 text-amber-800',
          roles: ['ceo', 'hq_admin', 'branch_admin', 'counsellor'],
        },
        {
          id: 'attendance',
          label: 'Attendance Management',
          icon: CalendarCheck,
          roles: ['ceo', 'hq_admin', 'branch_admin', 'faculty'],
        },
        {
          id: 'academic',
          label: 'Academic & Syllabus',
          icon: BookOpen,
          badge: openDoubtsCount > 0 ? `${openDoubtsCount} doubts` : void 0,
          badgeColor: 'bg-blue-100 text-blue-800',
          roles: [
            'ceo',
            'hq_admin',
            'branch_admin',
            'faculty',
            'student',
            'parent',
          ],
        },
        {
          id: 'examination',
          label: 'Examinations & OMR',
          icon: Award,
          roles: [
            'ceo',
            'hq_admin',
            'branch_admin',
            'faculty',
            'student',
            'parent',
          ],
        },
        {
          id: 'chtq_scholarship',
          label: 'CHTQ Scholarship Test',
          icon: Layers,
          roles: ['ceo', 'hq_admin', 'branch_admin', 'counsellor'],
        },
      ],
    },
    {
      sectionTitle: 'ADMINISTRATION & FINANCE',
      items: [
        {
          id: 'fees',
          label: 'Fees & Accounts',
          icon: CreditCard,
          roles: ['ceo', 'hq_admin', 'branch_admin', 'accountant', 'parent'],
        },
        {
          id: 'reports',
          label: 'Reports & Analytics',
          icon: BarChart3,
          roles: ['ceo', 'hq_admin', 'branch_admin', 'accountant'],
        },
        {
          id: 'branch_management',
          label: 'Branch Management',
          icon: Building,
          badge: `${branches.length} Branches`,
          roles: ['ceo', 'hq_admin'],
        },
        {
          id: 'hr_staff',
          label: 'HR & Staff Directory',
          icon: Briefcase,
          roles: ['ceo', 'hq_admin', 'branch_admin', 'hr_manager'],
        },
        {
          id: 'documents',
          label: 'Document Vault',
          icon: FileCheck2,
          badge: pendingDocsCount > 0 ? pendingDocsCount : void 0,
          badgeColor: 'bg-red-100 text-red-700',
        },
        {
          id: 'communication',
          label: 'Communication Centre',
          icon: MessageSquare,
          roles: [
            'ceo',
            'hq_admin',
            'branch_admin',
            'counsellor',
            'hr_manager',
            'faculty',
          ],
        },
        {
          id: 'inventory',
          label: 'Inventory & Assets',
          icon: Package,
          roles: ['ceo', 'hq_admin', 'branch_admin'],
        },
        {
          id: 'audit_logs',
          label: 'Audit & Activity Log',
          icon: ScrollText,
          roles: ['ceo', 'hq_admin'],
        },
      ],
    },
  ];
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-white font-bold text-sm">
              CH
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">
                CAREER HEIGHTS
              </span>
              <span className="ml-1 text-[10px] font-bold text-blue-800">
                ERP
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Branch Indicator */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Organization Node
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-800 truncate" title={activeBranchDisplay}>
            {activeBranchDisplay}
          </p>
          <p className="text-[10px] text-slate-500">
            Tier: Centralized Multi-Branch ERP
          </p>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          {sections.map((section, idx) => {
            const visibleItems = section.items.filter((item) => {
              if (item.id === 'dashboard') return true;
              return can(item.id, 'view');
            });
            if (visibleItems.length === 0) return null;
            return (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.sectionTitle}
                </div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectModule(item.id);
                        onClose();
                      }}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${isActive ? 'bg-blue-900 text-white shadow-xs font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-800'}`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.badge !== void 0 && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-700'}`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight className="h-3 w-3 text-white/70" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer info */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/50">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
              <span>Career Heights ERP</span>
              <span className="text-blue-700 font-bold">v2.6 Enterprise</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">
              5 Branches • 328 Students • PostgreSQL-ready
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
