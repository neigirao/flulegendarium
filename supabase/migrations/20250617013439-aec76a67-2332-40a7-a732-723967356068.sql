
-- Criar tabela para métricas comportamentais dos usuários
CREATE TABLE public.user_behavioral_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  metrics_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela para perfis comportamentais dos usuários
CREATE TABLE public.user_behavioral_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_play_times TEXT[] DEFAULT '{}',
  average_session_duration INTEGER DEFAULT 0,
  game_completion_rate DECIMAL(5,2) DEFAULT 0.0,
  help_seeking_frequency INTEGER DEFAULT 0,
  learning_progression_score INTEGER DEFAULT 0,
  engagement_level TEXT DEFAULT 'medium' CHECK (engagement_level IN ('low', 'medium', 'high', 'very_high')),
  churn_risk_score INTEGER DEFAULT 0 CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
  player_type_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar colunas de dificuldade à tabela players
ALTER TABLE public.players 
ADD COLUMN difficulty_level TEXT DEFAULT 'medio' CHECK (difficulty_level IN ('muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil')),
ADD COLUMN difficulty_score INTEGER DEFAULT 50 CHECK (difficulty_score >= 0 AND difficulty_score <= 100),
ADD COLUMN difficulty_confidence DECIMAL(5,2) DEFAULT 0.0 CHECK (difficulty_confidence >= 0.0 AND difficulty_confidence <= 100.0),
ADD COLUMN total_attempts INTEGER DEFAULT 0,
ADD COLUMN correct_attempts INTEGER DEFAULT 0,
ADD COLUMN average_guess_time INTEGER DEFAULT 30000;

-- Criar tabela para tracking detalhado de tentativas por jogador
CREATE TABLE public.player_difficulty_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guess_time INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  session_id TEXT,
  device_type TEXT DEFAULT 'desktop',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_behavioral_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavioral_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_difficulty_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_behavioral_metrics
CREATE POLICY "Users can insert their own behavioral metrics" 
  ON public.user_behavioral_metrics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own behavioral metrics" 
  ON public.user_behavioral_metrics FOR SELECT 
  USING (auth.uid() = user_id);

-- Políticas RLS para user_behavioral_profiles
CREATE POLICY "Users can view their own behavioral profile" 
  ON public.user_behavioral_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavioral profile" 
  ON public.user_behavioral_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavioral profile" 
  ON public.user_behavioral_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para player_difficulty_stats
CREATE POLICY "Users can insert their own difficulty stats" 
  ON public.player_difficulty_stats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all difficulty stats" 
  ON public.player_difficulty_stats FOR SELECT 
  USING (true); -- Public read for admin analytics

-- Função para calcular dificuldade dos jogadores automaticamente
CREATE OR REPLACE FUNCTION public.calculate_player_difficulty()
RETURNS TRIGGER AS $$
DECLARE
  total_attempts_count INTEGER;
  correct_attempts_count INTEGER;
  success_rate DECIMAL;
  avg_time INTEGER;
  difficulty_score INTEGER;
  difficulty_level TEXT;
  confidence DECIMAL;
BEGIN
  -- Calcular estatísticas do jogador
  SELECT 
    COUNT(*),
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END),
    AVG(guess_time)
  INTO total_attempts_count, correct_attempts_count, avg_time
  FROM public.player_difficulty_stats 
  WHERE player_id = NEW.player_id;

  -- Calcular taxa de sucesso
  IF total_attempts_count > 0 THEN
    success_rate := (correct_attempts_count::DECIMAL / total_attempts_count::DECIMAL) * 100;
  ELSE
    success_rate := 0;
  END IF;

  -- Calcular score de dificuldade (0-100, onde 100 = muito difícil)
  difficulty_score := GREATEST(0, LEAST(100, 
    ROUND(
      (100 - success_rate) * 0.7 + 
      (LEAST(avg_time, 60000) / 600) * 0.3
    )
  ));

  -- Determinar nível de dificuldade
  CASE 
    WHEN difficulty_score <= 20 THEN difficulty_level := 'muito_facil';
    WHEN difficulty_score <= 40 THEN difficulty_level := 'facil';
    WHEN difficulty_score <= 60 THEN difficulty_level := 'medio';
    WHEN difficulty_score <= 80 THEN difficulty_level := 'dificil';
    ELSE difficulty_level := 'muito_dificil';
  END CASE;

  -- Calcular confiança baseada no número de tentativas
  confidence := LEAST(100, (total_attempts_count::DECIMAL / 10) * 100);

  -- Atualizar tabela players
  UPDATE public.players 
  SET 
    difficulty_level = difficulty_level,
    difficulty_score = difficulty_score,
    difficulty_confidence = confidence,
    total_attempts = total_attempts_count,
    correct_attempts = correct_attempts_count,
    average_guess_time = avg_time
  WHERE id = NEW.player_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular dificuldade automaticamente
CREATE TRIGGER update_player_difficulty_trigger
  AFTER INSERT ON public.player_difficulty_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_player_difficulty();

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at em user_behavioral_profiles
CREATE TRIGGER update_user_behavioral_profiles_updated_at
  BEFORE UPDATE ON public.user_behavioral_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais de dificuldade para jogadores existentes
UPDATE public.players 
SET 
  difficulty_level = 'medio',
  difficulty_score = 50,
  difficulty_confidence = 0.0,
  total_attempts = 0,
  correct_attempts = 0,
  average_guess_time = 30000
WHERE difficulty_level IS NULL;
