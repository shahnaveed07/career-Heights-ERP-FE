import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  ChevronDown,
  Building2,
  Check,
  Globe,
  FileText,
  LogOut,
  UserCheck,
  Eye,
  Edit3,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useErpData } from '../../context/ErpDataContext';
import { StudentAvatar } from '../common/StudentAvatar';
import {
  getUserAccessibleBranches,
  normalizeRole,
  SYSTEM_ROLES,
  ROLE_LABELS,
} from '../../utils/permissionManager';
import { ROUTES, getDefaultRouteForRole } from '../../routes/routeConfig';

export const Navbar = ({
  onToggleSidebar,
  onSelectModule,
  onGoToPublicWebsite,
}) => {
  const {
    currentUser,
    activeBranchFilter,
    setActiveBranchFilter,
    uiMode,
    toggleUiMode,
    loginAsDemoRole,
    logout,
    branchSwitchError,
    clearBranchSwitchError,
  } = useAuth();
  const navigate = useNavigate();
  const { branches, notifications, markNotificationAsRead } = useErpData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  // Close open dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
        setShowRoleSwitcher(false);
        setShowBranchDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

  // Canonical demo roles list
  const rolesList = [
    {
      role: SYSTEM_ROLES.SUPER_ADMIN,
      label: 'SuperAdmin / Owner',
      name: 'Dr. Ghulam Mohammad Lone',
    },
    {
      role: SYSTEM_ROLES.HQ_ADMIN,
      label: 'HQ Admin',
      name: 'Syed Tanveer Hashmi',
    },
    {
      role: SYSTEM_ROLES.BRANCH_ADMIN,
      label: 'Admin',
      name: 'Mohammad Altaf Lone',
    },
    {
      role: SYSTEM_ROLES.ACCOUNTANT_COORDINATOR,
      label: 'Accountant / Coordinator',
      name: 'Imran Lone',
    },
    {
      role: SYSTEM_ROLES.TEACHER,
      label: 'Teacher',
      name: 'Dr. Rahul Sharma',
    },
    {
      role: SYSTEM_ROLES.STUDENT,
      label: 'Student',
      name: 'Aarav Sharma',
    },
    {
      role: SYSTEM_ROLES.PARENT,
      label: 'Parent / Guardian',
      name: 'Rajesh Sharma',
    },
    {
      role: SYSTEM_ROLES.HR,
      label: 'HR',
      name: 'Parveena Akhtar',
    },
  ];

  const canonicalRole = normalizeRole(currentUser?.role);
  const isSuperOrHq =
    canonicalRole === SYSTEM_ROLES.SUPER_ADMIN ||
    canonicalRole === SYSTEM_ROLES.HQ_ADMIN;
  const accessibleBranches = getUserAccessibleBranches(currentUser, branches);
  const currentBranchObj = branches.find((b) => b.id === activeBranchFilter);
  const displayRoleTitle =
    ROLE_LABELS[canonicalRole] || currentUser?.roleTitle || currentUser?.role;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-xs backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-white font-bold text-base shadow-xs">
            CH
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-base">
                CAREER HEIGHTS
              </span>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none">
              Centralized Multi-Branch Academy
            </p>
          </div>
        </div>

        {/* ACTIVE BRANCH SELECTOR (Strict single active branch context) */}
        <div className="relative ml-2 sm:ml-4">
          {accessibleBranches.length > 1 || isSuperOrHq ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowBranchDropdown(!showBranchDropdown);
                  setShowUserMenu(false);
                  setShowRoleSwitcher(false);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900"
                aria-label="Select Operating Campus"
                aria-expanded={showBranchDropdown}
              >
                <Building2 className="h-3.5 w-3.5 text-blue-900 shrink-0" />
                <span className="font-medium text-slate-500 hidden md:inline">
                  Campus:
                </span>
                <span className="font-bold text-blue-950 truncate max-w-[75px] xs:max-w-[110px] sm:max-w-[150px]">
                  {activeBranchFilter === 'all'
                    ? 'All Campuses'
                    : currentBranchObj?.shortName || currentBranchObj?.name || 'Selected'}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
              </button>

              {showBranchDropdown && (
                <div className="absolute left-0 mt-1.5 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-900">
                      Select Operating Campus Focus
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Single active branch context applies across all modules
                    </p>
                  </div>

                  <div className="py-1 max-h-60 overflow-y-auto">
                    {isSuperOrHq && (
                      <button
                        onClick={() => {
                          setActiveBranchFilter('all');
                          setShowBranchDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          activeBranchFilter === 'all'
                            ? 'bg-blue-50 text-blue-900 font-bold'
                            : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          <span>All Campuses (Consolidated HQ)</span>
                        </div>
                        {activeBranchFilter === 'all' && (
                          <Check className="h-3.5 w-3.5 text-blue-900" />
                        )}
                      </button>
                    )}

                    {accessibleBranches.map((branch) => {
                      const isSelected = activeBranchFilter === branch.id;
                      return (
                        <button
                          key={branch.id}
                          onClick={() => {
                            setActiveBranchFilter(branch.id);
                            setShowBranchDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-900">
                              {branch.name} Campus
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {branch.code} • {branch.city}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-blue-900" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
              <Building2 className="h-3.5 w-3.5 text-blue-900" />
              <span className="font-bold text-slate-900">
                {currentUser?.branchName || currentBranchObj?.name || 'Handwara'} Campus
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* VIEW ONLY VS EDIT MODE TOGGLE */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleUiMode}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-xs font-black transition shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900 ${
              uiMode === 'view'
                ? 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                : 'border-emerald-500 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
            }`}
            title={
              uiMode === 'view'
                ? 'Current: VIEW ONLY mode (Inspections & search allowed, mutating actions locked). Click to switch to Edit Mode.'
                : 'Current: EDIT MODE (Authorized mutations allowed). Click to switch to View Only mode.'
            }
            aria-label={`Current mode: ${uiMode === 'view' ? 'View Only' : 'Edit Mode'}. Click to toggle.`}
          >
            {uiMode === 'view' ? (
              <>
                <Eye className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <span className="uppercase tracking-wider hidden sm:inline">VIEW ONLY</span>
                <span className="uppercase tracking-wider sm:hidden text-[10px]">VIEW</span>
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span className="uppercase tracking-wider hidden sm:inline">EDIT MODE</span>
                <span className="uppercase tracking-wider sm:hidden text-[10px]">EDIT</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Demo Role Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowRoleSwitcher(!showRoleSwitcher);
              setShowUserMenu(false);
              setShowNotifications(false);
              setShowBranchDropdown(false);
            }}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900"
            title="Fast switch between demo roles to test all authority tiers"
            aria-label="Switch Role"
            aria-expanded={showRoleSwitcher}
          >
            <UserCheck className="h-3.5 w-3.5 text-blue-700 shrink-0" />
            <span className="hidden md:inline text-slate-500">Role:</span>
            <span className="truncate max-w-[65px] xs:max-w-[95px] sm:max-w-[120px]">{displayRoleTitle}</span>
            <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-1.5 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-900">
                  Switch Demo Role (1-Click)
                </p>
                <p className="text-[10px] text-slate-500">
                  Test role-specific workflows and dashboards
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {rolesList.map((r) => (
                  <button
                    type="button"
                    key={r.role}
                    onClick={() => {
                      loginAsDemoRole(r.role);
                      setShowRoleSwitcher(false);
                      navigate(getDefaultRouteForRole(r.role));
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      canonicalRole === r.role
                        ? 'bg-blue-50 text-blue-900 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.name}</div>
                    </div>
                    {canonicalRole === r.role && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setShowRoleSwitcher(false);
              setShowBranchDropdown(false);
            }}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900"
            title="System Alerts"
            aria-label={`Notifications, ${unreadNotifications.length} unread`}
            aria-expanded={showNotifications}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <span className="text-xs font-bold text-slate-900">
                  Notifications &amp; Activity
                </span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                  {unreadNotifications.length} Unread
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`cursor-pointer p-3 transition hover:bg-slate-50 ${
                      !notif.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600">
                        {notif.branchName}
                      </span>
                      {!notif.read && (
                        <span className="text-[9px] font-semibold text-blue-600">
                          Mark as read
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowRoleSwitcher(false);
              setShowBranchDropdown(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-200 bg-white p-1.5 sm:px-3 sm:py-1.5 hover:bg-slate-50 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900"
            aria-label="User Profile Menu"
            aria-expanded={showUserMenu}
          >
            <StudentAvatar
              photo={currentUser?.avatar}
              name={currentUser?.name || 'Staff'}
              size="sm"
              className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser?.name}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {currentUser?.designation || displayRoleTitle}
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-60 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-bold text-slate-900">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentUser?.email}
                </p>
                <div className="mt-1 text-[11px] font-bold text-blue-900">
                  {displayRoleTitle}
                </div>
                {currentUser?.designation && (
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    {currentUser.designation}
                  </p>
                )}
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onGoToPublicWebsite) onGoToPublicWebsite();
                    else navigate(ROUTES.HOME);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-blue-900 hover:bg-blue-50"
                >
                  <Globe className="h-4 w-4 text-blue-700" />
                  <span>View Institute Website</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate(ROUTES.AUDIT_LOGS);
                    if (onSelectModule) onSelectModule('audit_logs');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Activity & Audit Trail</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate(ROUTES.LOGIN);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  <span>Sign Out of ERP</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {branchSwitchError && (
        <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs text-rose-900 shadow-xl animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{branchSwitchError}</span>
          <button
            onClick={clearBranchSwitchError}
            className="ml-2 rounded p-1 hover:bg-rose-100 text-rose-700"
            title="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
