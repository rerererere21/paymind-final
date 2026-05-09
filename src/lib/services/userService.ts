'use client';

import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  language: string;
  notificationsEnabled: boolean;
  renewalAlerts: boolean;
  weeklyDigest: boolean;
  createdAt: string;
}

function rowToProfile(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    language: row.language || 'en',
    notificationsEnabled: row.notifications_enabled ?? true,
    renewalAlerts: row.renewal_alerts ?? true,
    weeklyDigest: row.weekly_digest ?? false,
    createdAt: row.created_at,
  };
}

export const userService = {
  async getProfile(): Promise<UserProfile | null> {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('userService.getProfile error:', error.message);
      return null;
    }

    if (!data) return null;

    return rowToProfile(data);
  },

  async updateProfile(
    updates: Partial<{
      fullName: string;
      avatarUrl: string;
      language: string;
      notificationsEnabled: boolean;
      renewalAlerts: boolean;
      weeklyDigest: boolean;
    }>
  ): Promise<UserProfile | null> {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // جلب الملف الحالي إذا كان موجودًا
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // تجهيز البيانات مع ضمان وجود الحقول المطلوبة
    const dbUpdates: any = {
      id: user.id,
      email: existingProfile?.email || user.email || '',
      full_name:
        updates.fullName ??
        existingProfile?.full_name ??
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        '',
      avatar_url:
        updates.avatarUrl ??
        existingProfile?.avatar_url ??
        null,
      language:
        updates.language ??
        existingProfile?.language ??
        'en',
      notifications_enabled:
        updates.notificationsEnabled ??
        existingProfile?.notifications_enabled ??
        true,
      renewal_alerts:
        updates.renewalAlerts ??
        existingProfile?.renewal_alerts ??
        true,
      weekly_digest:
        updates.weeklyDigest ??
        existingProfile?.weekly_digest ??
        false,
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(dbUpdates, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('userService.updateProfile error:', error.message);
      throw error;
    }

    return rowToProfile(data);
  },
};