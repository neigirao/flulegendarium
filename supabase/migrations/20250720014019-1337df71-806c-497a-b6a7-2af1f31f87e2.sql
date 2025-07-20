-- Fix Function Search Path Mutable warnings by updating existing functions with proper search_path

-- Update handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$function$;

-- Update cleanup_expired_notifications function with proper search_path
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.admin_notifications 
  SET is_active = false 
  WHERE expires_at IS NOT NULL 
  AND expires_at < now() 
  AND is_active = true;
END;
$function$;

-- Update update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$;

-- Update calculate_player_difficulty function with proper search_path
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
$function$;