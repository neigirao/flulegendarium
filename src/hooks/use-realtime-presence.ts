import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

export const useRealtimePresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const onlineCount = Object.keys(presenceState).length;
        
        // Update online users count
        supabase
          .from('live_stats')
          .update({ stat_value: onlineCount, updated_at: new Date().toISOString() })
          .eq('stat_key', 'online_users')
          .then(({ error }) => {
            if (error) logger.error('Erro ao atualizar contagem online', 'REALTIME_PRESENCE', error);
          });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);
};