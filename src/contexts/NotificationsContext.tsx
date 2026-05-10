'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  notificationService,
  AppNotification,
} from '@/lib/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

function isIgnorableError(error: any): boolean {
  const message = error?.message || '';

  return (
    error?.name === 'AbortError' ||
    message.includes('Lock broken by another request') ||
    message.includes('was released because another request stole it')
  );
}

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setLoading(true);

    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err: any) {
      if (!isIgnorableError(err)) {
        console.error(
          'refreshNotifications error:',
          err?.message || err
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif: AppNotification = {
              id: payload.new.id,
              userId: payload.new.user_id,
              billId: payload.new.bill_id,
              title: payload.new.title,
              message: payload.new.message,
              notificationType:
                payload.new.notification_type,
              isRead: payload.new.is_read,
              createdAt: payload.new.created_at,
            };

            setNotifications((prev) => [
              newNotif,
              ...prev,
            ]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id
                  ? {
                      ...n,
                      isRead: payload.new.is_read,
                    }
                  : n
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) =>
              prev.filter(
                (n) => n.id !== payload.old.id
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, isRead: true }
            : n
        )
      );
    } catch (err: any) {
      if (!isIgnorableError(err)) {
        console.error(
          'markAsRead error:',
          err?.message || err
        );
      }
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
    } catch (err: any) {
      if (!isIgnorableError(err)) {
        console.error(
          'markAllAsRead error:',
          err?.message || err
        );
      }
    }
  }, []);

  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);

  if (!ctx) {
    throw new Error(
      'useNotifications must be used within NotificationsProvider'
    );
  }

  return ctx;
}
