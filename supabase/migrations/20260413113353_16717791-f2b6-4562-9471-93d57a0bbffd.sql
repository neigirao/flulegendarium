
-- Índices de performance para o MCP Server
CREATE INDEX IF NOT EXISTS idx_user_game_history_user_id ON public.user_game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_history_user_created ON public.user_game_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_score_desc ON public.rankings(score DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_user_id ON public.rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_target_player ON public.game_attempts(target_player_id);

-- RPC: get_user_game_stats
CREATE OR REPLACE FUNCTION public.get_user_game_stats(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_games integer;
  v_total_correct integer;
  v_total_attempts integer;
  v_accuracy integer;
  v_best_score integer;
  v_best_streak integer;
  v_avg_duration integer;
  v_fan_level text;
  v_fan_label text;
  v_fan_emoji text;
  v_fan_desc text;
  v_modes text[];
BEGIN
  SELECT
    COUNT(*),
    COALESCE(SUM(correct_guesses), 0),
    COALESCE(SUM(total_attempts), 0),
    COALESCE(MAX(score), 0),
    COALESCE(MAX(max_streak), 0),
    COALESCE(AVG(game_duration)::integer, 0)
  INTO v_total_games, v_total_correct, v_total_attempts, v_best_score, v_best_streak, v_avg_duration
  FROM user_game_history
  WHERE user_id = p_user_id;

  IF v_total_attempts > 0 THEN
    v_accuracy := ROUND((v_total_correct::numeric / v_total_attempts) * 100);
  ELSE
    v_accuracy := 0;
  END IF;

  SELECT ARRAY_AGG(DISTINCT game_mode) INTO v_modes
  FROM user_game_history
  WHERE user_id = p_user_id AND game_mode IS NOT NULL;

  -- Fan level classification
  IF v_total_games < 3 THEN
    v_fan_level := 'novato'; v_fan_label := 'Novato Tricolor'; v_fan_emoji := '🐣';
    v_fan_desc := 'Ainda conhecendo as lendas do Flu!';
  ELSIF v_accuracy >= 90 THEN
    v_fan_level := 'lenda'; v_fan_label := 'Lenda Tricolor'; v_fan_emoji := '👑';
    v_fan_desc := 'Conhecimento enciclopédico do Fluminense!';
  ELSIF v_accuracy >= 75 THEN
    v_fan_level := 'craque'; v_fan_label := 'Craque da Memória'; v_fan_emoji := '⭐';
    v_fan_desc := 'Domínio impressionante da história tricolor.';
  ELSIF v_accuracy >= 60 THEN
    v_fan_level := 'titular'; v_fan_label := 'Titular Absoluto'; v_fan_emoji := '🏟️';
    v_fan_desc := 'Bom conhecimento, mas ainda pode evoluir.';
  ELSIF v_accuracy >= 40 THEN
    v_fan_level := 'reserva'; v_fan_label := 'Reserva Promissor'; v_fan_emoji := '📋';
    v_fan_desc := 'Tem potencial, precisa treinar mais!';
  ELSE
    v_fan_level := 'base'; v_fan_label := 'Base Tricolor'; v_fan_emoji := '🌱';
    v_fan_desc := 'Comece a estudar as lendas e suba de nível!';
  END IF;

  RETURN json_build_object(
    'data', json_build_object(
      'total_games', v_total_games,
      'total_correct', v_total_correct,
      'total_attempts', v_total_attempts,
      'accuracy_percent', v_accuracy,
      'best_score', v_best_score,
      'best_streak', v_best_streak,
      'average_game_duration_seconds', v_avg_duration,
      'game_modes_played', COALESCE(v_modes, ARRAY[]::text[])
    ),
    'classification', json_build_object(
      'fan_level', v_fan_level,
      'fan_label', v_fan_label,
      'fan_emoji', v_fan_emoji
    ),
    'insight', v_fan_emoji || ' ' || v_fan_label || ': ' || v_fan_desc || ' Acurácia de ' || v_accuracy || '% em ' || v_total_games || ' jogos. Melhor sequência: ' || v_best_streak || ' acertos seguidos.',
    'metadata', json_build_object(
      'timestamp', now()::text,
      'source', 'supabase_rpc'
    )
  );
END;
$$;

-- RPC: get_user_ranking_position
CREATE OR REPLACE FUNCTION public.get_user_ranking_position(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position integer;
  v_total_players integer;
  v_percentile integer;
  v_user_score integer;
  v_user_games integer;
  v_top5 json;
  v_insight text;
BEGIN
  SELECT COUNT(*) INTO v_total_players FROM rankings;

  SELECT score, games_played INTO v_user_score, v_user_games
  FROM rankings WHERE user_id = p_user_id
  ORDER BY score DESC LIMIT 1;

  IF v_user_score IS NOT NULL THEN
    SELECT COUNT(*) + 1 INTO v_position
    FROM rankings WHERE score > v_user_score;

    v_percentile := CASE WHEN v_total_players > 0
      THEN ROUND(((v_total_players - v_position)::numeric / v_total_players) * 100)
      ELSE 0 END;
  ELSE
    v_position := NULL;
    v_percentile := NULL;
    v_user_score := 0;
    v_user_games := 0;
  END IF;

  SELECT json_agg(row_to_json(t)) INTO v_top5
  FROM (
    SELECT
      ROW_NUMBER() OVER (ORDER BY score DESC) as position,
      player_name,
      score,
      (user_id = p_user_id) as is_current_user
    FROM rankings
    ORDER BY score DESC
    LIMIT 5
  ) t;

  IF v_position IS NULL THEN
    v_insight := 'Você ainda não aparece no ranking. Jogue mais para entrar!';
  ELSIF v_position <= 3 THEN
    v_insight := '🏆 Incrível! Você está no TOP 3 — posição #' || v_position || '! Verdadeira lenda!';
  ELSIF v_percentile >= 75 THEN
    v_insight := '⭐ Posição #' || v_position || ' — melhor que ' || v_percentile || '% dos jogadores!';
  ELSE
    v_insight := '📊 Posição #' || v_position || ' de ' || v_total_players || '. Continue jogando para subir!';
  END IF;

  RETURN json_build_object(
    'data', json_build_object(
      'position', v_position,
      'total_players', v_total_players,
      'percentile', v_percentile,
      'user_score', v_user_score,
      'games_played', v_user_games,
      'top_5', COALESCE(v_top5, '[]'::json)
    ),
    'insight', v_insight,
    'metadata', json_build_object(
      'timestamp', now()::text,
      'source', 'supabase_rpc'
    )
  );
END;
$$;
