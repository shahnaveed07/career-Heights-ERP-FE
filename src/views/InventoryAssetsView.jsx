import { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
export const InventoryAssetsView = () => {
  const { assets, scopedInventory, addAsset, branches } = useErpData();
  const { activeBranchFilter } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(
    activeBranchFilter === 'all' ? 'all' : activeBranchFilter
  );
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setSelectedBranch(activeBranchFilter);
  }, [activeBranchFilter]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: 'BenQ 4K Interactive Smart Panel',
    code: 'AST-AV-2026-09',
    category: 'Projectors & AV',
    branchId: activeBranchFilter !== 'all' ? activeBranchFilter : (branches[0]?.id || 'branch-handwara'),
    branchName: 'Handwara Campus',
    quantity: 4,
    unit: 'Units',
    locationRoom: 'Smart Lecture Hall 2',
    condition: 'good',
    status: 'in_use',
    purchaseDate: '2026-08-15',
    estimatedValue: 24e4,
  });
  const filteredAssets = scopedInventory.filter((item) => {
    const searchMatch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locationRoom?.toLowerCase().includes(searchTerm.toLowerCase());
    const branchMatch =
      selectedBranch === 'all' || item.branchId === selectedBranch;
    const catMatch =
      selectedCategory === 'all' || item.category === selectedCategory;
    return searchMatch && branchMatch && catMatch;
  });
  const totalValue = scopedInventory.reduce(
    (acc, i) => acc + (i.estimatedValue || 0),
    0
  );
  const maintenanceCount = scopedInventory.filter(
    (i) => i.status === 'maintenance' || i.condition === 'needs_repair'
  ).length;
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const branchObj = branches.find((b) => b.id === newAsset.branchId);
    addAsset({
      ...newAsset,
      branchName: branchObj ? branchObj.name : 'Handwara Campus',
    });
    setShowAddModal(false);
  };

  // Keyboard navigation & body scroll lock for modal
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
            <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              Campus Infrastructure
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Inventory, Classroom Assets &amp; Lab Equipment
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Multi-branch tracking of smart interactive boards, student study
            kits, laboratory instruments and furniture.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Provision New Asset</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            Total Tracked Assets
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {scopedInventory.length} Lines
          </div>
          <span className="text-[10px] text-slate-400">
            Fixed assets &amp; consumables
          </span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-800">
            Total Asset Valuation
          </span>
          <div className="mt-1 text-2xl font-black text-blue-900">
            ₹{(totalValue / 1e5).toFixed(1)}L
          </div>
          <span className="text-[10px] text-blue-700">Depreciation booked</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800">
            In Active Deployment
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-900">
            {assets.filter((i) => i.status === 'in_use').length}
          </div>
          <span className="text-[10px] font-bold text-emerald-700">
            In smart lecture rooms
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800">
            Maintenance Requisitions
          </span>
          <div className="mt-1 text-2xl font-black text-amber-900">
            {maintenanceCount}
          </div>
          <span className="text-[10px] font-bold text-amber-700">
            Service booked
          </span>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by asset name, barcode code, room location..."
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
          >
            <option value="all">All Campuses</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="Projectors & AV">Projectors &amp; AV</option>
            <option value="Computers & IT">Computers &amp; IT</option>
            <option value="Lab Equipment">Lab Equipment</option>
            <option value="Furniture">Furniture</option>
            <option value="Books & Library">Study Materials</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4 text-left">
                Asset Details &amp; Asset Code
              </th>
              <th className="py-3 px-4 text-left">Campus &amp; Room</th>
              <th className="py-3 px-4 text-center">Category</th>
              <th className="py-3 px-4 text-center">Quantity</th>
              <th className="py-3 px-4 text-center">Condition</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="font-mono text-[10px] text-blue-900 font-bold">
                    {item.code}
                  </p>
                </td>

                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-800">
                    {item.branchName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.locationRoom}
                  </p>
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {item.category}
                  </span>
                </td>

                <td className="py-3 px-4 text-center font-bold text-slate-900">
                  {item.quantity} {item.unit}
                </td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold capitalize ${item.condition === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                  >
                    {item.condition.replace('_', ' ')}
                  </span>
                </td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold capitalize ${item.status === 'in_use' ? 'bg-blue-100 text-blue-900' : item.status === 'maintenance' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </td>

                <td className="py-3 px-4 text-right font-black text-slate-900">
                  ₹{item.estimatedValue.toLocaleString()}
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8">
                  <EmptyState
                    title="No assets found"
                    description="No inventory or equipment records match your search or filter selection."
                    actionLabel={searchTerm ? 'Clear Search' : undefined}
                    onAction={searchTerm ? () => setSearchTerm('') : undefined}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Provision New Asset Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-asset-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 id="add-asset-title" className="font-bold text-slate-900 text-base">
                Add Infrastructure Asset
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
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Asset Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.code}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, code: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newAsset.category}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  >
                    <option value="Projectors & AV">Projectors &amp; AV</option>
                    <option value="Computers & IT">Computers &amp; IT</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Books & Library">Study Materials</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Branch
                  </label>
                  <select
                    value={newAsset.branchId}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, branchId: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.locationRoom}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, locationRoom: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newAsset.quantity}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valuation (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={newAsset.estimatedValue}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        estimatedValue: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-5 py-2 font-bold text-white hover:bg-blue-800"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
