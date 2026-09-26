import { useState, useEffect } from 'react';
import { Building, Plus, MapPin, X, Check, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { normalizeRole, SYSTEM_ROLES } from '../utils/permissionManager';
import { canUserAccessBranch, getUserAccessibleBranches } from '../utils/branchAccessModel';

export const BranchManagementView = () => {
  const { branches, addBranch } = useErpData();
  const {
    activeBranchFilter,
    setActiveBranchFilter,
    setActiveBranch,
    currentUser,
    uiMode,
    can,
    branchSwitchError,
    clearBranchSwitchError,
  } = useAuth();
  const canonicalRole = normalizeRole(currentUser?.role);
  const isSuperOrHq =
    canonicalRole === SYSTEM_ROLES.SUPER_ADMIN ||
    canonicalRole === SYSTEM_ROLES.HQ_ADMIN;
  const canCreateBranch = uiMode !== 'view' && can('branches', 'create');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranchForm, setNewBranchForm] = useState({
    name: '',
    code: 'CH-BR-06',
    address: '',
    city: 'Kupwara',
    phone: '+91 94190 60000',
    email: 'kupwara@careerheights.edu.in',
    branchHead: 'Aijaz Ahmad',
    capacity: 250,
  });
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newBranchForm.name) return;
    addBranch({
      ...newBranchForm,
      capacity: Number(newBranchForm.capacity),
    });
    setShowAddModal(false);
    setNewBranchForm({
      name: '',
      code: 'CH-BR-06',
      address: '',
      city: 'Kupwara',
      phone: '+91 94190 60000',
      email: 'kupwara@careerheights.edu.in',
      branchHead: 'Aijaz Ahmad',
      capacity: 250,
    });
  };

  // Keyboard navigation & body scroll lock for modals
  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddModal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Network Architecture
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Branch Infrastructure &amp; Campus Operations
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Multi-branch institutional nodes with centralized financial and
            operational control.
          </p>
        </div>

        <div>
          {isSuperOrHq && (
            <button
              onClick={() => setActiveBranch('all')}
              className={`mr-2 rounded-lg border px-3 py-2 text-xs font-bold transition shadow-xs ${activeBranchFilter === 'all' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            >
              All Campuses (Consolidated)
            </button>
          )}
          {canCreateBranch ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-inline items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
            >
              <Plus className="h-4 w-4 inline mr-1" />
              <span>Provision New Campus</span>
            </button>
          ) : (
            <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500">
              Branch Creation Locked (View Mode)
            </span>
          )}
        </div>
      </div>

      {/* Access Restriction Warning Banner */}
      {branchSwitchError && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 flex items-center justify-between text-xs text-rose-900 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{branchSwitchError}</span>
          </div>
          <button
            onClick={clearBranchSwitchError}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Branch Status Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <p className="font-bold text-blue-950">
            Current Active Campus: {activeBranchFilter === 'all' ? 'Centralized Multi-Branch (All Campuses)' : `${branches.find((b) => b.id === activeBranchFilter)?.name || 'Selected'} Campus`}
          </p>
          <p className="text-blue-800/80 mt-0.5">
            Single Active Branch Directive: When a campus is active, students, faculty, batches, and operations reflect that campus context.
          </p>
        </div>
        {isSuperOrHq && activeBranchFilter !== 'all' && (
          <button
            onClick={() => setActiveBranch('all')}
            className="self-start sm:self-auto shrink-0 rounded-lg bg-white border border-blue-200 px-3 py-1.5 font-bold text-blue-900 hover:bg-blue-100 shadow-2xs"
          >
            Switch to All Branches
          </button>
        )}
      </div>

      {/* 5 Branches Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => {
          const isActiveBranch = activeBranchFilter === branch.id;
          const isAccessible = canUserAccessBranch(currentUser, branch.id);
          const utilRate = (
            (branch.studentCount / branch.capacity) *
            100
          ).toFixed(0);
          return (
            <div
              key={branch.id}
              className={`rounded-2xl border p-6 transition text-left flex flex-col justify-between ${isActiveBranch ? 'border-blue-900 ring-2 ring-blue-900/20 bg-blue-50/20 shadow-md' : 'border-slate-200 bg-white shadow-xs hover:border-blue-900 hover:shadow-md'}`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    {branch.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isActiveBranch && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-900 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                        <Check className="h-3 w-3" />
                        Active Focus
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Operational
                    </span>
                  </div>
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {branch.name} Campus
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {branch.address}, {branch.city}
                  </span>
                </p>

                {/* Branch Head & Contact */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Campus Principal:</span>
                    <strong className="text-slate-900">
                      {branch.branchHead}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Helpline Phone:</span>
                    <span className="font-mono text-slate-700">
                      {branch.phone}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Capacity
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {branch.studentCount} / {branch.capacity} ({utilRate}%)
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Faculty Staff
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {branch.facultyCount} Teachers
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Monthly Revenue
                    </span>
                    <p className="font-bold text-emerald-800 mt-0.5">
                      ₹{(branch.monthlyRevenue / 1e5).toFixed(2)}L
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Avg Attendance
                    </span>
                    <p className="font-bold text-blue-900 mt-0.5">
                      {branch.attendanceRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">
                  {branch.classroomCount} Classrooms
                </span>
                {isActiveBranch ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active Campus
                  </span>
                ) : isAccessible ? (
                  <button
                    onClick={() => setActiveBranch(branch.id)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-blue-900 hover:bg-blue-900 hover:text-white transition shadow-2xs"
                  >
                    Focus Campus &rarr;
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveBranch(branch.id)}
                    className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-rose-700 hover:bg-rose-100 transition shadow-2xs"
                    title="Campus not assigned to your account. Switch will be safely rejected."
                  >
                    Unassigned (Restricted)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Branch Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-branch-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3
                id="add-branch-modal-title"
                className="text-base font-bold text-slate-900 flex items-center gap-2"
              >
                <Building className="h-5 w-5 text-blue-900" />
                <span>Add Branch</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Campus Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBranchForm.name}
                  onChange={(e) =>
                    setNewBranchForm({ ...newBranchForm, name: e.target.value })
                  }
                  placeholder="e.g. Kupwara Main"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Campus Code
                  </label>
                  <input
                    type="text"
                    value={newBranchForm.code}
                    onChange={(e) =>
                      setNewBranchForm({
                        ...newBranchForm,
                        code: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City / Tehsil
                  </label>
                  <input
                    type="text"
                    value={newBranchForm.city}
                    onChange={(e) =>
                      setNewBranchForm({
                        ...newBranchForm,
                        city: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={newBranchForm.address}
                  onChange={(e) =>
                    setNewBranchForm({
                      ...newBranchForm,
                      address: e.target.value,
                    })
                  }
                  placeholder="Near Hospital Road..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Principal / In-Charge
                  </label>
                  <input
                    type="text"
                    value={newBranchForm.branchHead}
                    onChange={(e) =>
                      setNewBranchForm({
                        ...newBranchForm,
                        branchHead: e.target.value,
                      })
                    }
                    placeholder="Staff head name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    value={newBranchForm.capacity}
                    onChange={(e) =>
                      setNewBranchForm({
                        ...newBranchForm,
                        capacity: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-5 py-2 font-bold text-white hover:bg-blue-800"
                >
                  Create Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
