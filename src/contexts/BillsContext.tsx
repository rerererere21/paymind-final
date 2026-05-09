'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { billService, Bill, CreateBillInput } from '@/lib/services/billService';
import { useAuth } from '@/contexts/AuthContext';

interface BillsContextValue {
  bills: Bill[];
  loading: boolean;
  error: string | null;
  addBill: (input: CreateBillInput) => Promise<Bill | null>;
  updateBill: (id: string, input: Partial<CreateBillInput>) => Promise<Bill | null>;
  deleteBill: (id: string) => Promise<void>;
  refreshBills: () => Promise<void>;
  totalMonthly: number;
  overdueBills: Bill[];
  upcomingBills: Bill[];
  paidBills: Bill[];
}

const BillsContext = createContext<BillsContextValue | null>(null);

export function BillsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBills = useCallback(async () => {
    if (!user) {
      setBills([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await billService.getAll();
      setBills(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshBills();
  }, [refreshBills]);

  const addBill = useCallback(async (input: CreateBillInput): Promise<Bill | null> => {
    const bill = await billService.create(input);
    if (bill) setBills((prev) => [bill, ...prev]);
    return bill;
  }, []);

  const updateBill = useCallback(async (id: string, input: Partial<CreateBillInput>): Promise<Bill | null> => {
    const updated = await billService.update(id, input);
    if (updated) setBills((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  }, []);

  const deleteBill = useCallback(async (id: string): Promise<void> => {
    await billService.delete(id);
    setBills((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueBills = bills.filter((b) => {
    const due = new Date(b.dueDate);
    return b.billStatus === 'overdue' || (b.billStatus === 'pending' && due < today);
  });

  const upcomingBills = bills.filter((b) => {
    const due = new Date(b.dueDate);
    const in14 = new Date(today);
    in14.setDate(in14.getDate() + 14);
    return b.billStatus === 'pending' && due >= today && due <= in14;
  });

  const paidBills = bills.filter((b) => b.billStatus === 'paid');

  const totalMonthly = bills
    .filter((b) => b.billStatus !== 'cancelled' && b.billStatus !== 'paid')
    .reduce((acc, b) => acc + b.amount, 0);

  return (
    <BillsContext.Provider
      value={{
        bills,
        loading,
        error,
        addBill,
        updateBill,
        deleteBill,
        refreshBills,
        totalMonthly,
        overdueBills,
        upcomingBills,
        paidBills,
      }}
    >
      {children}
    </BillsContext.Provider>
  );
}

export function useBills() {
  const ctx = useContext(BillsContext);
  if (!ctx) throw new Error('useBills must be used within BillsProvider');
  return ctx;
}
