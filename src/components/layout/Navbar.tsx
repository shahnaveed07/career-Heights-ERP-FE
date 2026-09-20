import React, { useState } from 'react';
import {
  Bell,
  Search,
  Building2,
  ChevronDown,
  UserCheck,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useErpData } from '../../context/ErpDataContext';
import { Role } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSearch?: () => void;
  onSelectModule: (module: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onSelectModule }) => {
  const { currentUser, activeBranchFilter, setActiveBranchFilter, logout, loginAsDemoRole } = useAuth();
  const { branches, notifications, markNotificationAsRead } = useErpData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const rolesList: { role: Role; label: string; name: string }[] = [
    { role: 'ceo', label: 'CEO / Super Admin', name: 'Dr. Ghulam Mohammad' },
    { role: 'hq_admin', label: 'HQ Admin', name: 'Syed Tanveer' },
    { role: 'branch_admin', label: 'Branch Admin (Handwara)', name: 'Mohammad Altaf' },
    { role: 'faculty', label: 'Faculty (Physics)', name: 'Dr. Rahul Sharma' },
    { role: 'student', label: 'Student (JEE-A)', name: 'Aarav Sharma' },
    { role: 'parent', label: 'Parent', name: 'Rajesh Sharma' },
    { role: 'counsellor', label: 'Counsellor', name: 'Mehak Khan' },
    { role: 'accountant', label: 'Accountant', name: 'Imran Lone' },
    { role: 'hr_manager', label: 'HR Manager', name: 'Parveena Akhtar' },
  ];

  const currentBranchObj = branches.find(b => b.id === activeBranchFilter);

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
              <span className="font-bold tracking-tight text-slate-900 text-base">CAREER HEIGHTS</span>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">ERP</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none">Centralized Multi-Branch Academy</p>
          </div>
        </div>

        {/* Branch Switcher for HQ/CEO */}
        {(currentUser?.role === 'ceo' || currentUser?.role === 'hq_admin') && (
          <div className="relative ml-4">
            <button
              onClick={() => {
                setShowBranchDropdown(!showBranchDropdown);
                setShowUserMenu(false);
                setShowRoleSwitcher(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-700" />
              <span>{activeBranchFilter === 'all' ? 'All Branches (HQ View)' : currentBranchObj?.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>

            {showBranchDropdown && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Select Operating Branch
                </div>
                <button
                  onClick={() => {
                    setActiveBranchFilter('all');
                    setShowBranchDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-blue-50 hover:text-blue-900 ${
                    activeBranchFilter === 'all' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span>HQ Consolidated (All 5 Branches)</span>
                  {activeBranchFilter === 'all' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />}
                </button>
                <div className="my-1 border-t border-slate-100" />
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBranchFilter(b.id);
                      setShowBranchDropdown(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${
                      activeBranchFilter === b.id ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.studentCount} Students • {b.code}</div>
                    </div>
                    {activeBranchFilter === b.id && <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentUser?.role !== 'ceo' && currentUser?.role !== 'hq_admin' && currentUser?.branchName && (
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Branch: <strong className="text-slate-900">{currentUser.branchName}</strong></span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleSwitcher(!showRoleSwitcher);
              setShowUserMenu(false);
              setShowNotifications(false);
              setShowBranchDropdown(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100"
            title="Fast switch between demo roles to test all dashboards"
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-700" />
            <span className="hidden sm:inline">Role Switcher:</span>
            <span className="capitalize">{currentUser?.role.replace('_', ' ')}</span>
            <ChevronDown className="h-3 w-3 text-amber-700" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-900">Switch Demo Role (1-Click)</p>
                <p className="text-[10px] text-slate-500">Test role-specific workflows and dashboards</p>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {rolesList.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      loginAsDemoRole(r.role);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      currentUser?.role === r.role ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.name}</div>
                    </div>
                    {currentUser?.role === r.role && <span className="h-2 w-2 rounded-full bg-blue-600"></span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setShowRoleSwitcher(false);
              setShowBranchDropdown(false);
            }}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Notification Center"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">System Notifications</h3>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    {unreadNotifications.length} New
                  </span>
                </div>
                <button
                  onClick={() => unreadNotifications.forEach(n => markNotificationAsRead(n.id))}
                  className="text-[11px] font-medium text-blue-700 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${!n.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {n.type === 'fee_overdue' || n.type === 'low_attendance' ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : n.type === 'new_enquiry' || n.type === 'new_admission' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="mt-0.5 text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                        {n.branchName && (
                          <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-600">
                            {n.branchName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowRoleSwitcher(false);
              setShowBranchDropdown(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 sm:px-3 sm:py-1.5 hover:bg-slate-50 transition"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}
              alt={currentUser?.name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 font-medium">{currentUser?.roleTitle}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                <div className="mt-1.5 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  {currentUser?.roleTitle}
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSelectModule('audit_logs');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Activity & Audit Trail</span>
                </button>
                <button
                  onClick={logout}
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
    </header>
  );
};
