
-- Adicionar campos de dificuldade na tabela players (se não existirem)
-- Verificar se as colunas já existem antes de adicionar

DO $$ 
BEGIN
    -- Adicionar difficulty_level se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'difficulty_level') THEN
        ALTER TABLE public.players 
        ADD COLUMN difficulty_level TEXT DEFAULT 'medio' 
        CHECK (difficulty_level IN ('muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'));
    END IF;

    -- Adicionar difficulty_score se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'difficulty_score') THEN
        ALTER TABLE public.players 
        ADD COLUMN difficulty_score INTEGER DEFAULT 50 CHECK (difficulty_score >= 0 AND difficulty_score <= 100);
    END IF;

    -- Adicionar difficulty_confidence se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'difficulty_confidence') THEN
        ALTER TABLE public.players 
        ADD COLUMN difficulty_confidence DECIMAL DEFAULT 0.0 CHECK (difficulty_confidence >= 0.0 AND difficulty_confidence <= 100.0);
    END IF;

    -- Adicionar total_attempts se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'total_attempts') THEN
        ALTER TABLE public.players 
        ADD COLUMN total_attempts INTEGER DEFAULT 0;
    END IF;

    -- Adicionar correct_attempts se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'correct_attempts') THEN
        ALTER TABLE public.players 
        ADD COLUMN correct_attempts INTEGER DEFAULT 0;
    END IF;

    -- Adicionar average_guess_time se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'average_guess_time') THEN
        ALTER TABLE public.players 
        ADD COLUMN average_guess_time INTEGER DEFAULT 30000; -- 30 segundos em ms
    END IF;
END $$;

-- Criar tabela para estatísticas de dificuldade por jogador se não existir
CREATE TABLE IF NOT EXISTS public.player_difficulty_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.players(id),
    user_id UUID REFERENCES auth.users(id),
    guess_time INTEGER NOT NULL, -- tempo em milissegundos
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    session_id TEXT,
    device_type TEXT DEFAULT 'desktop'
);

-- Criar função para calcular dificuldade do jogador automaticamente
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

-- Criar trigger para calcular dificuldade automaticamente
DROP TRIGGER IF EXISTS trigger_calculate_difficulty ON public.player_difficulty_stats;
CREATE TRIGGER trigger_calculate_difficulty
    AFTER INSERT ON public.player_difficulty_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_player_difficulty();

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_player_difficulty_stats_player_id ON public.player_difficulty_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_difficulty_stats_user_id ON public.player_difficulty_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_players_difficulty_level ON public.players(difficulty_level);
