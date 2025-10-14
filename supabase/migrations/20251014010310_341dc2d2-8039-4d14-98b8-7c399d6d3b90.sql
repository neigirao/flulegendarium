-- Corrigir trigger calculate_player_difficulty para resolver ambiguidade da coluna difficulty_score
-- Primeiro, dropar todos os triggers que dependem da função
DROP TRIGGER IF EXISTS update_player_difficulty ON player_difficulty_stats;
DROP TRIGGER IF EXISTS update_player_difficulty_trigger ON player_difficulty_stats;
DROP TRIGGER IF EXISTS trigger_calculate_difficulty ON player_difficulty_stats;

-- Agora dropar a função
DROP FUNCTION IF EXISTS calculate_player_difficulty();

-- Recriar a função com nome de variável não ambíguo
CREATE OR REPLACE FUNCTION public.calculate_player_difficulty()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    total_attempts_count INTEGER;
    correct_attempts_count INTEGER;
    success_rate DECIMAL;
    avg_time INTEGER;
    calculated_difficulty_score INTEGER;
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
    calculated_difficulty_score := GREATEST(0, LEAST(100, 
        ROUND(
            (100 - success_rate) * 0.7 + 
            (LEAST(avg_time, 60000) / 600) * 0.3
        )
    ));

    -- Determinar nível de dificuldade com valores corretos
    CASE 
        WHEN calculated_difficulty_score <= 20 THEN new_difficulty_level := 'muito_facil';
        WHEN calculated_difficulty_score <= 40 THEN new_difficulty_level := 'facil';
        WHEN calculated_difficulty_score <= 60 THEN new_difficulty_level := 'medio';
        WHEN calculated_difficulty_score <= 80 THEN new_difficulty_level := 'dificil';
        ELSE new_difficulty_level := 'muito_dificil';
    END CASE;

    -- Calcular confiança baseada no número de tentativas
    confidence := LEAST(100, (total_attempts_count::DECIMAL / 10) * 100);

    -- Atualizar tabela players
    UPDATE public.players 
    SET 
        difficulty_level = new_difficulty_level,
        difficulty_score = calculated_difficulty_score,
        difficulty_confidence = confidence,
        total_attempts = total_attempts_count,
        correct_attempts = correct_attempts_count,
        average_guess_time = avg_time
    WHERE id = NEW.player_id;

    RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER update_player_difficulty
    AFTER INSERT ON public.player_difficulty_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_player_difficulty();