'use client';

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
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
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import AddSubscriptionForm from './components/AddSubscriptionForm';
import type { Subscription } from '@/context/SubscriptionContext';

const categories = ['All', 'Entertainment', 'Productivity', 'Cloud Storage', 'Health', 'News & Media', 'Developer Tools', 'Education'];
const statusFilters = ['All', 'Active', 'Paused', 'Trial', 'Cancelled'];
type SortKey = 'name' | 'price' | 'nextBilling' | 'daysUntil' | 'status';

export default function SubscriptionManagementPage() {
  const { subscriptions, deleteSubscription, toggleStatus, addSubscription, updateSubscription, totalMonthly, activeCount, pausedCount, trialCount } = useSubscriptions();
  const router = useRouter();
  const { format } = useCurrency();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('daysUntil');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    let result = [...subscriptions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
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

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedRows);
    for (const id of ids) {
      await deleteSubscription(id);
    }
    setSelectedRows(new Set());
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  return (
    <AppShell>
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">
        {/* Header */}
<div className="flex items-center justify-between flex-wrap gap-3">
  <div>
    <h1 className="text-xl sm:text-2xl font-700 text-foreground">
      Subscriptions
    </h1>
    <p className="text-sm text-muted-foreground mt-1">
      {subscriptions.length} total · {activeCount} active
    </p>
  </div>
</div>

        {/* Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Active', value: activeCount, color: 'text-emerald-700 bg-emerald-50' },
            { label: 'Paused', value: pausedCount, color: 'text-amber-700 bg-amber-50' },
            { label: 'Trial', value: trialCount, color: 'text-purple-700 bg-purple-50' },
            { label: 'Monthly Total', value: format(totalMonthly), color: 'text-primary bg-secondary' },
          ].map((item) => (
            <div key={`summary-${item.label}`} className={`rounded-xl px-3 sm:px-4 py-3 ${item.color}`}>
              <p className="text-xs font-600 uppercase tracking-wider opacity-70">{item.label}</p>
              <p className="text-lg sm:text-xl font-800 tabular-nums mt-0.5 break-all">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="card p-3 sm:p-4 space-y-3">
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
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground flex-shrink-0" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="input-field w-36 py-2.5">
                {statusFilters.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={() => router.push('/add-subscription')} className="btn-primary flex-shrink-0 hidden sm:inline-flex">
              <Plus size={16} /> Add Subscription
            </button>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-600 transition-all duration-150 ${categoryFilter === cat ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-secondary-foreground'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions */}
        {selectedRows.size > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-600 text-primary">{selectedRows.size} selected</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedRows(new Set())} className="btn-secondary text-xs py-1.5 px-3">Clear</button>
              <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-xs font-600 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                <Trash2 size={13} /> Delete {selectedRows.size}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              title="No subscriptions found"
              description="Try adjusting your search or filters, or add a new subscription."
              action={{ label: 'Add Subscription', onClick: () => router.push('/add-subscription') }}
            />
          ) : (
            <>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" checked={selectedRows.size === paginated.length && paginated.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border accent-primary" />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wider hover:text-foreground">
                          Service <SortIcon col="name" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => handleSort('price')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wider hover:text-foreground">
                          Price <SortIcon col="price" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider hidden md:table-cell">Billing</th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => handleSort('daysUntil')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wider hover:text-foreground">
                          Next Billing <SortIcon col="daysUntil" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => handleSort('status')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wider hover:text-foreground">
                          Status <SortIcon col="status" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-600 text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginated.map((sub) => (
                      <tr key={sub.id} className={`hover:bg-muted/40 transition-colors duration-100 ${selectedRows.has(sub.id) ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-3.5">
                          <input type="checkbox" checked={selectedRows.has(sub.id)} onChange={() => toggleRow(sub.id)} className="w-4 h-4 rounded border-border accent-primary" />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-800 flex-shrink-0" style={{ backgroundColor: sub.color }}>
                              {sub.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-600 text-foreground truncate max-w-[120px] sm:max-w-[160px]">{sub.name}</p>
                              {sub.website && <p className="text-xs text-muted-foreground truncate max-w-[120px]">{sub.website}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-500 whitespace-nowrap">{sub.category}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-700 text-foreground tabular-nums whitespace-nowrap">{format(sub.price)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground hidden md:table-cell whitespace-nowrap">{sub.billingCycle}</td>
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-sm text-foreground whitespace-nowrap">{sub.nextBilling}</p>
                            <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${sub.daysUntil <= 3 ? 'bg-red-50 text-red-600' : sub.daysUntil <= 7 ? 'bg-amber-50 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                              {sub.daysUntil}d
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={sub.status} size="sm" />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={async () => { await toggleStatus(sub.id); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title={sub.status === 'active' ? 'Pause' : 'Resume'}
                            >
                              {sub.status === 'active' ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                            </button>
                            <button
                              onClick={() => setEditSub(sub)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(sub.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-wrap gap-2">
                  <p className="text-xs text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-xs font-600 transition-colors ${p === currentPage ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>{p}</button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editSub && (
        <Modal
          isOpen={!!editSub}
          onClose={() => setEditSub(null)}
          title="Edit Subscription"
          size="lg"
        >
          <AddSubscriptionForm
            initialData={editSub}
            onSubmit={async (data) => {
              await updateSubscription(editSub.id, data);
              setEditSub(null);
            }}
            onCancel={() => setEditSub(null)}
          />
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Subscription"
          size="sm"
        >
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">This will permanently remove the subscription from your list.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={async () => { await deleteSubscription(deleteConfirm); setDeleteConfirm(null); }}
                className="flex items-center gap-2 bg-red-600 text-white font-600 text-sm px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}