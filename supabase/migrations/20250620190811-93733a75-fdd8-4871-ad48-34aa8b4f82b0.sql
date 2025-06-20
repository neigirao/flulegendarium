
-- Verificar e corrigir as opções de dificuldade no banco
-- Primeiro, vamos remover a constraint existente e criar uma nova com as opções corretas

ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_difficulty_level_check;

-- Adicionar nova constraint com as opções corretas (com underscore)
ALTER TABLE public.players 
ADD CONSTRAINT players_difficulty_level_check 
CHECK (difficulty_level IN ('muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'));

-- Atualizar registros existentes que possam ter valores incorretos
UPDATE public.players 
SET difficulty_level = 'muito_facil' 
WHERE difficulty_level = 'muito facil' OR difficulty_level = 'muito_fácil';

UPDATE public.players 
SET difficulty_level = 'facil' 
WHERE difficulty_level = 'fácil';

UPDATE public.players 
SET difficulty_level = 'medio' 
WHERE difficulty_level = 'médio';

UPDATE public.players 
SET difficulty_level = 'dificil' 
WHERE difficulty_level = 'difícil';

UPDATE public.players 
SET difficulty_level = 'muito_dificil' 
WHERE difficulty_level = 'muito difícil' OR difficulty_level = 'muito_difícil';

-- Atualizar a função de cálculo de dificuldade para usar os valores corretos
CREATE OR REPLACE FUNCTION public.calculate_player_difficulty()
RETURNS TRIGGER AS $$
DECLARE
    total_attempts_count INTEGER;
    correct_attempts_count INTEGER;
    success_rate DECIMAL;
    avg_time INTEGER;
    difficulty_score INTEGER;
    new_difficulty_level TEXT;
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

    -- Determinar nível de dificuldade com valores corretos
    CASE 
        WHEN difficulty_score <= 20 THEN new_difficulty_level := 'muito_facil';
        WHEN difficulty_score <= 40 THEN new_difficulty_level := 'facil';
        WHEN difficulty_score <= 60 THEN new_difficulty_level := 'medio';
        WHEN difficulty_score <= 80 THEN new_difficulty_level := 'dificil';
        ELSE new_difficulty_level := 'muito_dificil';
    END CASE;

    -- Calcular confiança baseada no número de tentativas
    confidence := LEAST(100, (total_attempts_count::DECIMAL / 10) * 100);

    -- Atualizar tabela players
    UPDATE public.players 
    SET 
        difficulty_level = new_difficulty_level,
        difficulty_score = difficulty_score,
        difficulty_confidence = confidence,
        total_attempts = total_attempts_count,
        correct_attempts = correct_attempts_count,
        average_guess_time = avg_time
    WHERE id = NEW.player_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
