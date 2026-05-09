'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import AddSubscriptionForm from './AddSubscriptionForm';

import ServiceLogo from '@/components/ServiceLogo';
import { useCurrency } from '@/context/CurrencyContext';
import { useSubscriptions, Subscription } from '@/context/SubscriptionContext';

const categories = ['All', 'Entertainment', 'Productivity', 'Cloud Storage', 'Health', 'News & Media', 'Developer Tools', 'Education'];
const statusFilters = ['All', 'Active', 'Paused', 'Trial', 'Cancelled'];

type SortKey = 'name' | 'price' | 'nextBilling' | 'daysUntil' | 'status';

export default function SubscriptionTable() {
  const { subscriptions, loading, deleteSubscription, toggleStatus, addSubscription, updateSubscription } = useSubscriptions();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('daysUntil');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { format } = useCurrency();

  const filtered = useMemo(() => {
    let result = [...subscriptions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'All') result = result.filter((s) => s.category === categoryFilter);
    if (statusFilter !== 'All') result = result.filter((s) => s.status.toLowerCase() === statusFilter.toLowerCase());

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'price') cmp = a.price - b.price;
      else if (sortKey === 'daysUntil') cmp = a.daysUntil - b.daysUntil;
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [subscriptions, search, categoryFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === paginated.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(paginated.map((s) => s.id)));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSubscription(id);
    } finally {
      setDeleteConfirm(null);
      setDeletingId(null);
      setSelectedRows((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleToggleStatus = async (id: string) => {
    await toggleStatus(id);
  };

  const handleAddSubscription = async (data: any) => {
    await addSubscription(data);
    setAddModalOpen(false);
  };

  const handleEditSubscription = async (data: any) => {
    if (!editSub) return;
    await updateSubscription(editSub.id, {
      name: data.name,
      price: data.price,
      billingCycle: data.billingCycle,
      category: data.category,
      status: data.status,
      website: data.website,
      notes: data.notes,
    });
    setEditSub(null);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedRows);
    for (const id of ids) {
      await deleteSubscription(id);
    }
    setSelectedRows(new Set());
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-primary" />
    ) : (
      <ChevronDown size={12} className="text-primary" />
    );
  };

  const totalMonthly = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => acc + (s.billingCycle === 'Annual' ? s.price / 12 : s.price), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: subscriptions.filter(s => s.status === 'active').length, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Paused', value: subscriptions.filter(s => s.status === 'paused').length, color: 'text-amber-700 bg-amber-50' },
          { label: 'Trial', value: subscriptions.filter(s => s.status === 'trial').length, color: 'text-purple-700 bg-purple-50' },
          { label: 'Monthly Total', value: format(totalMonthly), color: 'text-primary bg-secondary' },
        ].map((item) => (
          <div key={`summary-${item.label}`} className={`rounded-xl px-4 py-3 ${item.color} border border-transparent`}>
            <p className="text-xs font-600 uppercase tracking-wider opacity-70">{item.label}</p>
            <p className="text-xl font-800 tabular-nums mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="input-field pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="input-field w-36 py-2.5"
            >
              {statusFilters.map((s) => (
                <option key={`status-opt-${s}`} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="btn-primary flex-shrink-0"
          >
            <Plus size={16} /> Add Subscription
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={`cat-chip-${cat}`}
              onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-600 transition-all duration-150 ${
                categoryFilter === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-secondary-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.size > 0 && (
        <div className="bg-primary text-white rounded-xl px-5 py-3 flex items-center justify-between animate-fadeIn shadow-blue">
          <p className="text-sm font-600">{selectedRows.size} subscription{selectedRows.size > 1 ? 's' : ''} selected</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={14} /> Delete selected
            </button>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No subscriptions yet"
            description="Add your first subscription to start tracking your spending."
            actionLabel="Add Subscription"
            onAction={() => setAddModalOpen(true)}
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === paginated.length && paginated.length > 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-border accent-primary"
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                      >
                        Service <SortIcon col="name" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('price')}
                        className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                      >
                        Price <SortIcon col="price" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Billing Cycle</th>
                    <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Next Billing</th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('daysUntil')}
                        className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                      >
                        Days Left <SortIcon col="daysUntil" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                      >
                        Status <SortIcon col="status" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-600 text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((sub) => (
                    <tr
                      key={sub.id}
                      className={`hover:bg-muted/40 transition-all duration-200 ${selectedRows.has(sub.id) ? 'bg-secondary/60' : ''}`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(sub.id)}
                          onChange={() => toggleRow(sub.id)}
                          className="w-4 h-4 rounded border-border accent-primary"
                          aria-label={`Select ${sub.name}`}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <ServiceLogo name={sub.name} color={sub.color} size={32} />
                          <div>
                            <p className="text-sm font-600 text-foreground">{sub.name}</p>
                            {sub.website && (
                              <p className="text-xs text-muted-foreground">{sub.website}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-500">
                          {sub.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-700 text-foreground tabular-nums">{format(sub.price)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{sub.billingCycle}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{sub.nextBilling}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-700 tabular-nums px-2 py-1 rounded-full ${
                          sub.daysUntil <= 3 ? 'bg-red-50 text-red-600' :
                          sub.daysUntil <= 7 ? 'bg-amber-50 text-amber-600' :
                          sub.daysUntil <= 14 ? 'bg-blue-50 text-blue-600': 'bg-muted text-muted-foreground'
                        }`}>
                          {sub.daysUntil}d
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={sub.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditSub(sub)}
                            title="Edit subscription"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-primary transition-all duration-150"
                            aria-label={`Edit ${sub.name}`}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(sub.id)}
                            title={sub.status === 'active' ? 'Pause subscription' : 'Resume subscription'}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition-all duration-150"
                            aria-label={sub.status === 'active' ? `Pause ${sub.name}` : `Resume ${sub.name}`}
                          >
                            {sub.status === 'active' ? <PauseCircle size={13} /> : <PlayCircle size={13} />}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(sub.id)}
                            title="Delete subscription"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-150"
                            aria-label={`Delete ${sub.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > itemsPerPage && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="border border-border rounded-lg px-2 py-1 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {[5, 10, 20].map((n) => (
                      <option key={`per-page-${n}`} value={n}>{n}</option>
                    ))}
                  </select>
                  <span>of {filtered.length} results</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg text-sm font-500 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={`page-${i + 1}`}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-600 transition-colors ${currentPage === i + 1 ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-lg text-sm font-500 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Subscription" size="lg">
        <AddSubscriptionForm
          onSubmit={handleAddSubscription}
          onCancel={() => setAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editSub} onClose={() => setEditSub(null)} title="Edit Subscription" size="lg">
        {editSub && (
          <AddSubscriptionForm
            initialData={editSub}
            onSubmit={handleEditSubscription}
            onCancel={() => setEditSub(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-card rounded-xl shadow-modal w-full max-w-sm p-6 animate-scaleIn space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-700 text-foreground">Delete subscription?</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {subscriptions.find(s => s.id === deleteConfirm)?.name} will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1"
              >
                Keep it
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={!!deletingId}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-600 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deletingId ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}