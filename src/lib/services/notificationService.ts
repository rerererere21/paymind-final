'use client';

import { createClient } from '@/lib/supabase/client';

export interface AppNotification {
  id: string;
  userId: string;
  billId?: string;
  title: string;
  message: string;
  notificationType: 'due_soon' | 'overdue' | 'paid' | 'reminder';
  isRead: boolean;
  createdAt: string;
}

function rowToNotification(row: any): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    billId: row.bill_id,
    title: row.title,
    message: row.message,
    notificationType: row.notification_type,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export const notificationService = {
  async getAll(): Promise<AppNotification[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('notificationService.getAll error:', error.message);
      return [];
    }
    return (data || []).map(rowToNotification);
  },

  async markAsRead(id: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('notificationService.markAsRead error:', error.message);
  },

  async markAllAsRead(): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) console.error('notificationService.markAllAsRead error:', error.message);
  },

  async createForBill(
    userId: string,
    billId: string,
    title: string,
    message: string,
    type: 'due_soon' | 'overdue'
  ): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      bill_id: billId,
      title,
      message,
      notification_type: type,
      is_read: false,
    });

    if (error) console.error('notificationService.createForBill error:', error.message);
  },
};
