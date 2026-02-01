-- Tabela para armazenar eventos do funil de conversão
CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  device_type TEXT DEFAULT 'desktop',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para consultas eficientes
CREATE INDEX idx_funnel_events_session ON public.funnel_events(session_id);
CREATE INDEX idx_funnel_events_type ON public.funnel_events(event_type);
CREATE INDEX idx_funnel_events_created ON public.funnel_events(created_at DESC);
CREATE INDEX idx_funnel_events_user ON public.funnel_events(user_id) WHERE user_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir eventos (anônimos ou autenticados)
CREATE POLICY "Anyone can insert funnel events" 
ON public.funnel_events 
FOR INSERT 
WITH CHECK (true);

-- Apenas admins podem visualizar todos os eventos
CREATE POLICY "Admins can view all funnel events" 
ON public.funnel_events 
FOR SELECT 
USING (is_admin());

-- View materializada para agregação rápida do funil
CREATE OR REPLACE VIEW public.funnel_summary AS
WITH daily_events AS (
  SELECT 
    DATE(created_at) as event_date,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_sessions
  FROM public.funnel_events
  WHERE created_at >= NOW() - INTERVAL '90 days'
  GROUP BY DATE(created_at), event_type
)
SELECT 
  event_date,
  SUM(CASE WHEN event_type = 'page_view_home' THEN unique_sessions ELSE 0 END) as home_views,
  SUM(CASE WHEN event_type = 'game_mode_click' THEN unique_sessions ELSE 0 END) as mode_clicks,
  SUM(CASE WHEN event_type = 'game_started' THEN unique_sessions ELSE 0 END) as game_starts,
  SUM(CASE WHEN event_type = 'first_guess' THEN unique_sessions ELSE 0 END) as first_guesses,
  SUM(CASE WHEN event_type = 'game_completed' THEN unique_sessions ELSE 0 END) as completions,
  SUM(CASE WHEN event_type = 'ranking_saved' THEN unique_sessions ELSE 0 END) as rankings_saved,
  SUM(CASE WHEN event_type = 'share_completed' THEN unique_sessions ELSE 0 END) as shares
FROM daily_events
GROUP BY event_date
ORDER BY event_date DESC;