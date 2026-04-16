import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type NotificationCategory =
  | "changes_since_last_visit"
  | "new_permit_nearby"
  | "production_anomaly"
  | "new_report_available";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  changes_since_last_visit: boolean;
  new_permit_nearby: boolean;
  production_anomaly: boolean;
  new_report_available: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  frequency: "realtime" | "daily_digest" | "weekly_digest";
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const DEFAULT_PREFS: Omit<NotificationPreferences, "id"> = {
  changes_since_last_visit: true,
  new_permit_nearby: true,
  production_anomaly: true,
  new_report_available: true,
  in_app_enabled: true,
  push_enabled: false,
  frequency: "daily_digest",
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
};

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
}

export function useNotifications() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    loading: true,
  });

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setState({
      notifications: (data ?? []) as AppNotification[],
      unreadCount: (data ?? []).filter((n) => !n.is_read).length,
      loading: false,
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!active) return;
        setState({
          notifications: (data ?? []) as AppNotification[],
          unreadCount: (data ?? []).filter((n) => !n.is_read).length,
          loading: false,
        });
      });
    return () => { active = false; };
  }, [userId]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setState((prev) => {
      const removed = prev.notifications.find((n) => n.id === id);
      return {
        notifications: prev.notifications.filter((n) => n.id !== id),
        unreadCount: removed && !removed.is_read ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        loading: prev.loading,
      };
    });
  };

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}

export function useNotificationPreferences() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setPrefs(data as unknown as NotificationPreferences);
      } else {
        // Create default preferences
        const { data: created } = await supabase
          .from("notification_preferences")
          .insert({ user_id: userId, ...DEFAULT_PREFS })
          .select()
          .single();
        if (created) setPrefs(created as unknown as NotificationPreferences);
      }
      setLoading(false);
    })();
  }, [userId]);

  const updatePrefs = async (updates: Partial<NotificationPreferences>) => {
    if (!prefs) return;
    const { data } = await supabase
      .from("notification_preferences")
      .update(updates)
      .eq("id", prefs.id)
      .select()
      .single();
    if (data) setPrefs(data as unknown as NotificationPreferences);
  };

  return { prefs, loading, updatePrefs };
}
