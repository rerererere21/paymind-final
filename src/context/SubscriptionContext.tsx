'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Status = 'active' | 'paused' | 'cancelled' | 'trial';
export type BillingCycle = 'Monthly' | 'Annual' | 'Quarterly' | 'Weekly';

export interface Subscription {
  id: string;
  name: string;
  category: string;
  price: number;
  billingCycle: BillingCycle;
  nextBilling: string;
  daysUntil: number;
  status: Status;
  color: string;
  startDate: string;
  website?: string;
  notes?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#E11D48',
  Productivity: '#3B82F6',
  'Cloud Storage': '#0061FF',
  Health: '#5B8DEF',
  'News & Media': '#374151',
  'Developer Tools': '#24292E',
  Education: '#58CC02',
  Finance: '#10B981',
  Design: '#F24E1E',
  Other: '#6B7280',
};

function calcDaysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function rowToSubscription(row: any): Subscription {
  const statusMap: Record<string, Status> = {
    pending: 'active',
    paid: 'paused',
    overdue: 'active',
    cancelled: 'cancelled',
  };
  const status: Status = (row.bill_status === 'pending' || row.bill_status === 'overdue')
    ? 'active'
    : row.bill_status === 'paid' ?'paused'
    : row.bill_status === 'cancelled' ?'cancelled' :'active';

  return {
    id: row.id,
    name: row.title,
    category: row.category || 'Other',
    price: parseFloat(row.amount),
    billingCycle: (row.billing_cycle as BillingCycle) || 'Monthly',
    nextBilling: formatDateDisplay(row.due_date),
    daysUntil: calcDaysUntil(row.due_date),
    status,
    color: CATEGORY_COLORS[row.category] ?? '#3B82F6',
    startDate: row.start_date ? formatDateDisplay(row.start_date) : formatDateDisplay(row.created_at),
    website: row.website || undefined,
    notes: row.notes || undefined,
  };
}

interface SubscriptionContextValue {
  subscriptions: Subscription[];
  loading: boolean;
  addSubscription: (data: Omit<Subscription, 'id' | 'daysUntil' | 'color'> & { nextBillingDate?: string }) => Promise<void>;
  updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  totalMonthly: number;
  activeCount: number;
  pausedCount: number;
  trialCount: number;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      if (error) {
        console.error('SubscriptionContext fetch error:', error.message);
        setSubscriptions([]);
      } else {
        setSubscriptions((data || []).map(rowToSubscription));
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSubscriptions();
  }, [refreshSubscriptions]);

  const addSubscription = useCallback(async (
    data: Omit<Subscription, 'id' | 'daysUntil' | 'color'> & { nextBillingDate?: string }
  ) => {
    if (!user) throw new Error('Not authenticated');
    const supabase = createClient();

    // Determine due_date: use nextBillingDate if provided, else derive from startDate + 1 cycle
    let dueDate = data.nextBillingDate || data.startDate;
    if (!data.nextBillingDate && data.startDate) {
      try {
        const start = new Date(data.startDate);
        if (data.billingCycle === 'Monthly') start.setMonth(start.getMonth() + 1);
        else if (data.billingCycle === 'Annual') start.setFullYear(start.getFullYear() + 1);
        else if (data.billingCycle === 'Quarterly') start.setMonth(start.getMonth() + 3);
        else if (data.billingCycle === 'Weekly') start.setDate(start.getDate() + 7);
        dueDate = start.toISOString().split('T')[0];
      } catch {
        dueDate = data.startDate;
      }
    }

    const statusMap: Record<Status, string> = {
      active: 'pending',
      paused: 'paid',
      cancelled: 'cancelled',
      trial: 'pending',
    };

    const { error } = await supabase.from('bills').insert({
      user_id: user.id,
      title: data.name,
      amount: data.price,
      due_date: dueDate,
      bill_status: statusMap[data.status] || 'pending',
      category: data.category,
      notes: data.notes || null,
      is_recurring: true,
      billing_cycle: data.billingCycle,
      website: data.website || null,
      start_date: data.startDate || null,
    });

    if (error) {
      console.error('addSubscription error:', error.message);
      throw error;
    }
    await refreshSubscriptions();
  }, [user, refreshSubscriptions]);

  const updateSubscription = useCallback(async (id: string, data: Partial<Subscription>) => {
    if (!user) throw new Error('Not authenticated');
    const supabase = createClient();

    const updateData: any = {};
    if (data.name !== undefined) updateData.title = data.name;
    if (data.price !== undefined) updateData.amount = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.billingCycle !== undefined) updateData.billing_cycle = data.billingCycle;
    if (data.status !== undefined) {
      const statusMap: Record<Status, string> = {
        active: 'pending',
        paused: 'paid',
        cancelled: 'cancelled',
        trial: 'pending',
      };
      updateData.bill_status = statusMap[data.status] || 'pending';
    }

    const { error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('updateSubscription error:', error.message);
      throw error;
    }
    await refreshSubscriptions();
  }, [user, refreshSubscriptions]);

  const deleteSubscription = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    const supabase = createClient();
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      console.error('deleteSubscription error:', error.message);
      throw error;
    }
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, [user]);

  const toggleStatus = useCallback(async (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;
    const newStatus: Status = sub.status === 'active' ? 'paused' : 'active';
    await updateSubscription(id, { status: newStatus });
  }, [subscriptions, updateSubscription]);

  const totalMonthly = subscriptions
    .filter((s) => s.status === 'active' || s.status === 'trial')
    .reduce((acc, s) => {
      if (s.billingCycle === 'Annual') return acc + s.price / 12;
      if (s.billingCycle === 'Quarterly') return acc + s.price / 3;
      if (s.billingCycle === 'Weekly') return acc + s.price * 4.33;
      return acc + s.price;
    }, 0);

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
  const trialCount = subscriptions.filter((s) => s.status === 'trial').length;

  return (
    <SubscriptionContext.Provider
      value={{ subscriptions, loading, addSubscription, updateSubscription, deleteSubscription, toggleStatus, refreshSubscriptions, totalMonthly, activeCount, pausedCount, trialCount }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscriptions must be used within SubscriptionProvider');
  return ctx;
}
