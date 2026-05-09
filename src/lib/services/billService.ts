'use client';

import { createClient } from '@/lib/supabase/client';

export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type BillCategory =
  | 'Housing' |'Utilities' |'Insurance' |'Subscriptions' |'Healthcare' |'Transportation' |'Education' |'Entertainment' |'Food' |'Finance' |'Other';

export interface Bill {
  id: string;
  userId: string;
  title: string;
  amount: number;
  dueDate: string;
  billStatus: BillStatus;
  category: BillCategory;
  notes?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillInput {
  title: string;
  amount: number;
  dueDate: string;
  billStatus: BillStatus;
  category: BillCategory;
  notes?: string;
  isRecurring?: boolean;
}

function rowToBill(row: any): Bill {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    amount: parseFloat(row.amount),
    dueDate: row.due_date,
    billStatus: row.bill_status,
    category: row.category,
    notes: row.notes,
    isRecurring: row.is_recurring,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const billService = {
  async getAll(): Promise<Bill[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('billService.getAll error:', error.message);
      return [];
    }
    return (data || []).map(rowToBill);
  },

  async create(input: CreateBillInput): Promise<Bill | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bills')
      .insert({
        user_id: user.id,
        title: input.title,
        amount: input.amount,
        due_date: input.dueDate,
        bill_status: input.billStatus,
        category: input.category,
        notes: input.notes || null,
        is_recurring: input.isRecurring ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('billService.create error:', error.message);
      throw error;
    }
    return rowToBill(data);
  },

  async update(id: string, input: Partial<CreateBillInput>): Promise<Bill | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
    if (input.billStatus !== undefined) updateData.bill_status = input.billStatus;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.isRecurring !== undefined) updateData.is_recurring = input.isRecurring;

    const { data, error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('billService.update error:', error.message);
      throw error;
    }
    return rowToBill(data);
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('billService.delete error:', error.message);
      throw error;
    }
  },
};
