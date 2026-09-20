import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  MapPin,
  Phone,
  User,
  Users,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { Branch } from '../types';

export const BranchManagementView: React.FC = () => {
  const { branches, addBranch } = useErpData();
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

  const handleAddSubmit = (e: React.FormEvent) => {
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
            Multi-branch institutional nodes with centralized financial and operational control.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Provision New Campus</span>
        </button>
      </div>

      {/* 5 Branches Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(branch => {
          const utilRate = ((branch.studentCount / branch.capacity) * 100).toFixed(0);

          return (
            <div
              key={branch.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-900 hover:shadow-md transition text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    {branch.code}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Operational
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900">{branch.name} Campus</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{branch.address}, {branch.city}</span>
                </p>

                {/* Branch Head & Contact */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Campus Principal:</span>
                    <strong className="text-slate-900">{branch.branchHead}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Helpline Phone:</span>
                    <span className="font-mono text-slate-700">{branch.phone}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Capacity</span>
                    <p className="font-bold text-slate-900 mt-0.5">{branch.studentCount} / {branch.capacity} ({utilRate}%)</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Faculty Staff</span>
                    <p className="font-bold text-slate-900 mt-0.5">{branch.facultyCount} Teachers</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Monthly Revenue</span>
                    <p className="font-bold text-emerald-800 mt-0.5">₹{(branch.monthlyRevenue / 100000).toFixed(2)}L</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Attendance</span>
                    <p className="font-bold text-blue-900 mt-0.5">{branch.attendanceRate}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">{branch.classroomCount} Smart Classrooms</span>
                <span className="text-blue-900 hover:underline cursor-pointer">
                  Branch Audit &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-900" />
                <span>Provision New Campus Branch</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Name *</label>
                <input
                  type="text"
                  required
                  value={newBranchForm.name}
                  onChange={e => setNewBranchForm({ ...newBranchForm, name: e.target.value })}
                  placeholder="e.g. Kupwara Main"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campus Code</label>
                  <input
                    type="text"
                    value={newBranchForm.code}
                    onChange={e => setNewBranchForm({ ...newBranchForm, code: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Tehsil</label>
                  <input
                    type="text"
                    value={newBranchForm.city}
                    onChange={e => setNewBranchForm({ ...newBranchForm, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  value={newBranchForm.address}
                  onChange={e => setNewBranchForm({ ...newBranchForm, address: e.target.value })}
                  placeholder="Near Hospital Road..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Principal / In-Charge</label>
                  <input
                    type="text"
                    value={newBranchForm.branchHead}
                    onChange={e => setNewBranchForm({ ...newBranchForm, branchHead: e.target.value })}
                    placeholder="Staff head name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Capacity</label>
                  <input
                    type="number"
                    value={newBranchForm.capacity}
                    onChange={e => setNewBranchForm({ ...newBranchForm, capacity: Number(e.target.value) })}
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
