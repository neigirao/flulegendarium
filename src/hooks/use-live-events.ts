import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'anniversary' | 'achievement' | 'special' | 'maintenance';
  start_time: string;
  end_time?: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export const useLiveEvents = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<LiveEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('live_events')
          .select('*')
          .eq('is_active', true)
          .lte('start_time', now)
          .or(`end_time.is.null,end_time.gte.${now}`)
          .order('start_time', { ascending: false });
          
        if (error) throw error;
        
        setEvents((data || []) as LiveEvent[]);
        setActiveEvent((data?.[0] || null) as LiveEvent | null);
      } catch (error) {
        logger.error('Erro ao buscar eventos', 'LIVE_EVENTS', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('live-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_events'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    events,
    activeEvent,
    isLoading
  };
};