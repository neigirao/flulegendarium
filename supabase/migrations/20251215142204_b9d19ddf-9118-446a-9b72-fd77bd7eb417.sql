-- =============================================
-- QUIZ DAS CAMISAS - Fase 1: Estrutura de Banco
-- =============================================

-- Tabela principal de camisas
CREATE TABLE public.jerseys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL CHECK (year >= 1902 AND year <= 2030),
  image_url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'home' CHECK (type IN ('home', 'away', 'third', 'special')),
  manufacturer TEXT,
  season TEXT,
  title TEXT,
  fun_fact TEXT,
  nicknames TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'medio' CHECK (difficulty_level IN ('muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil')),
  difficulty_score INTEGER DEFAULT 50 CHECK (difficulty_score >= 0 AND difficulty_score <= 100),
  difficulty_confidence NUMERIC DEFAULT 0.0 CHECK (difficulty_confidence >= 0 AND difficulty_confidence <= 1),
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  average_guess_time INTEGER DEFAULT 0,
  decades TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_jerseys_year ON public.jerseys(year);
CREATE INDEX idx_jerseys_difficulty ON public.jerseys(difficulty_level);
CREATE INDEX idx_jerseys_decades ON public.jerseys USING GIN(decades);
CREATE INDEX idx_jerseys_type ON public.jerseys(type);

-- Enable RLS
ALTER TABLE public.jerseys ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para jerseys
CREATE POLICY "Camisas são públicas para leitura" 
  ON public.jerseys FOR SELECT 
  USING (true);

CREATE POLICY "Apenas admins podem gerenciar camisas" 
  ON public.jerseys FOR ALL 
  USING (is_admin());

-- =============================================
-- Tabela de Rankings do Quiz das Camisas
-- =============================================

CREATE TABLE public.jersey_game_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL CHECK (char_length(trim(player_name)) > 0),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  correct_guesses INTEGER NOT NULL DEFAULT 0 CHECK (correct_guesses >= 0),
  total_attempts INTEGER NOT NULL DEFAULT 0 CHECK (total_attempts >= 0),
  max_streak INTEGER NOT NULL DEFAULT 0 CHECK (max_streak >= 0),
  difficulty_level TEXT DEFAULT 'medio',
  game_mode TEXT DEFAULT 'adaptive' CHECK (game_mode IN ('adaptive', 'decade', 'classic')),
  game_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para rankings
CREATE INDEX idx_jersey_rankings_score ON public.jersey_game_rankings(score DESC);
CREATE INDEX idx_jersey_rankings_user ON public.jersey_game_rankings(user_id);
CREATE INDEX idx_jersey_rankings_created ON public.jersey_game_rankings(created_at DESC);

-- Enable RLS
ALTER TABLE public.jersey_game_rankings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rankings
CREATE POLICY "Rankings são públicos para leitura" 
  ON public.jersey_game_rankings FOR SELECT 
  USING (true);

CREATE POLICY "Qualquer um pode inserir ranking" 
  ON public.jersey_game_rankings FOR INSERT 
  WITH CHECK (true);

-- =============================================
-- Tabela de Sessões/Histórico do Quiz das Camisas
-- =============================================

CREATE TABLE public.jersey_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  game_mode TEXT NOT NULL DEFAULT 'adaptive',
  final_score INTEGER NOT NULL DEFAULT 0,
  correct_guesses INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  difficulty_level TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Índices para sessões
CREATE INDEX idx_jersey_sessions_user ON public.jersey_game_sessions(user_id);
CREATE INDEX idx_jersey_sessions_created ON public.jersey_game_sessions(started_at DESC);

-- Enable RLS
ALTER TABLE public.jersey_game_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sessões
CREATE POLICY "Usuários podem ver suas próprias sessões" 
  ON public.jersey_game_sessions FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários podem inserir suas sessões" 
  ON public.jersey_game_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =============================================
-- Tabela de Estatísticas de Dificuldade (para cálculo adaptativo)
-- =============================================

CREATE TABLE public.jersey_difficulty_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jersey_id UUID REFERENCES public.jerseys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  guess_time INTEGER NOT NULL,
  year_difference INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  device_type TEXT DEFAULT 'desktop',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para stats
CREATE INDEX idx_jersey_stats_jersey ON public.jersey_difficulty_stats(jersey_id);
CREATE INDEX idx_jersey_stats_created ON public.jersey_difficulty_stats(created_at DESC);

-- Enable RLS
ALTER TABLE public.jersey_difficulty_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Stats são públicos para leitura" 
  ON public.jersey_difficulty_stats FOR SELECT 
  USING (true);

CREATE POLICY "Qualquer um pode inserir stats" 
  ON public.jersey_difficulty_stats FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =============================================
-- Trigger para calcular dificuldade automaticamente
-- =============================================

CREATE OR REPLACE FUNCTION public.calculate_jersey_difficulty()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  total_attempts_count INTEGER;
  correct_attempts_count INTEGER;
  success_rate DECIMAL;
  avg_time INTEGER;
  calculated_difficulty_score INTEGER;
  new_difficulty_level TEXT;
  confidence DECIMAL;
BEGIN
  -- Calcular estatísticas da camisa
  SELECT 
    COUNT(*),
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END),
    AVG(guess_time)
  INTO total_attempts_count, correct_attempts_count, avg_time
  FROM public.jersey_difficulty_stats 
  WHERE jersey_id = NEW.jersey_id;

  -- Calcular taxa de sucesso
  IF total_attempts_count > 0 THEN
    success_rate := (correct_attempts_count::DECIMAL / total_attempts_count::DECIMAL) * 100;
  ELSE
    success_rate := 0;
  END IF;

  -- Calcular score de dificuldade (0-100, onde 100 = muito difícil)
  calculated_difficulty_score := GREATEST(0, LEAST(100, 
    ROUND(
      (100 - success_rate) * 0.7 + 
      (LEAST(avg_time, 60000) / 600) * 0.3
    )
  ));

  -- Determinar nível de dificuldade
  CASE 
    WHEN calculated_difficulty_score <= 20 THEN new_difficulty_level := 'muito_facil';
    WHEN calculated_difficulty_score <= 40 THEN new_difficulty_level := 'facil';
    WHEN calculated_difficulty_score <= 60 THEN new_difficulty_level := 'medio';
    WHEN calculated_difficulty_score <= 80 THEN new_difficulty_level := 'dificil';
    ELSE new_difficulty_level := 'muito_dificil';
  END CASE;

  -- Calcular confiança baseada no número de tentativas
  confidence := LEAST(1, (total_attempts_count::DECIMAL / 10));

  -- Atualizar tabela jerseys
  UPDATE public.jerseys 
  SET 
    difficulty_level = new_difficulty_level,
    difficulty_score = calculated_difficulty_score,
    difficulty_confidence = confidence,
    total_attempts = total_attempts_count,
    correct_attempts = correct_attempts_count,
    average_guess_time = avg_time
  WHERE id = NEW.jersey_id;

  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER calculate_jersey_difficulty_trigger
  AFTER INSERT ON public.jersey_difficulty_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_jersey_difficulty();