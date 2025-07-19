import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'challenge' | 'social' | 'system' | 'announcement';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_audience: 'all' | 'registered' | 'guests' | 'top_players';
  is_active: boolean;
  expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_read?: boolean;
}

export const useAdminNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar notificações ativas
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: async () => {
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      if (!user) {
        // Para usuários não logados, retornar apenas notificações públicas
        return notificationsData?.map(notification => ({
          ...notification,
          is_read: false
        })) || [];
      }

      // Para usuários logados, verificar quais foram lidas
      const { data: readData, error: readError } = await supabase
        .from('user_notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);

      if (readError) throw readError;

      const readNotificationIds = new Set(readData?.map(r => r.notification_id) || []);

      return notificationsData?.map(notification => ({
        ...notification,
        is_read: readNotificationIds.has(notification.id)
      })) || [];
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada minuto
  });

  // Marcar notificação como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('user_notification_reads')
        .upsert({
          user_id: user.id,
          notification_id: notificationId,
          read_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      const { error } = await supabase
        .from('user_notification_reads')
        .upsert(
          unreadNotifications.map(notification => ({
            user_id: user.id,
            notification_id: notification.id,
            read_at: new Date().toISOString()
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
  };
};