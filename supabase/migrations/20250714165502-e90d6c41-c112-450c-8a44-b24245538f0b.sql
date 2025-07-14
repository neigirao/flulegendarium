-- Tabelas para recursos sociais e real-time da Sprint 8

-- Tabela para comentários dos jogadores
CREATE TABLE public.player_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  user_id UUID,
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_moderated BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE
);

-- Tabela para desafios diários/semanais
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'special')),
  target_value INTEGER NOT NULL,
  target_metric TEXT NOT NULL CHECK (target_metric IN ('accuracy', 'speed', 'streak', 'games_played')),
  reward_points INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para progresso dos usuários nos desafios
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  challenge_id UUID NOT NULL,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (challenge_id) REFERENCES public.daily_challenges(id) ON DELETE CASCADE
);

-- Tabela para eventos ao vivo
CREATE TABLE public.live_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('anniversary', 'achievement', 'special', 'maintenance')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para contadores em tempo real
CREATE TABLE public.live_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT NOT NULL UNIQUE,
  stat_value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir alguns contadores básicos
INSERT INTO public.live_stats (stat_key, stat_value) VALUES 
  ('online_users', 0),
  ('games_played_today', 0),
  ('total_players_discovered', 0);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.player_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comentários
CREATE POLICY "Todos podem ver comentários aprovados" 
ON public.player_comments 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Usuários podem criar comentários" 
ON public.player_comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários podem editar seus próprios comentários" 
ON public.player_comments 
FOR UPDATE 
USING (user_id = auth.uid() OR user_id IS NULL);

-- Políticas para desafios (todos podem ver)
CREATE POLICY "Todos podem ver desafios ativos" 
ON public.daily_challenges 
FOR SELECT 
USING (is_active = true);

-- Políticas para progresso dos usuários
CREATE POLICY "Usuários podem ver seu próprio progresso" 
ON public.user_challenge_progress 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuários podem inserir seu progresso" 
ON public.user_challenge_progress 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuários podem atualizar seu progresso" 
ON public.user_challenge_progress 
FOR UPDATE 
USING (user_id = auth.uid() OR user_id IS NULL);

-- Políticas para eventos (todos podem ver)
CREATE POLICY "Todos podem ver eventos ativos" 
ON public.live_events 
FOR SELECT 
USING (is_active = true);

-- Políticas para estatísticas (todos podem ver)
CREATE POLICY "Todos podem ver estatísticas" 
ON public.live_stats 
FOR SELECT 
USING (true);

-- Trigger para atualizar timestamps
CREATE TRIGGER update_player_comments_updated_at
BEFORE UPDATE ON public.player_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_challenge_progress_updated_at
BEFORE UPDATE ON public.user_challenge_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para as tabelas
ALTER TABLE public.player_comments REPLICA IDENTITY FULL;
ALTER TABLE public.daily_challenges REPLICA IDENTITY FULL;
ALTER TABLE public.user_challenge_progress REPLICA IDENTITY FULL;
ALTER TABLE public.live_events REPLICA IDENTITY FULL;
ALTER TABLE public.live_stats REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER publication supabase_realtime ADD TABLE public.player_comments;
ALTER publication supabase_realtime ADD TABLE public.daily_challenges;
ALTER publication supabase_realtime ADD TABLE public.user_challenge_progress;
ALTER publication supabase_realtime ADD TABLE public.live_events;
ALTER publication supabase_realtime ADD TABLE public.live_stats;