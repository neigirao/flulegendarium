-- Apply only after backup and live schema preflight. No service-role key in the app.
-- This transaction only creates a self-service function; it deletes no user now.
BEGIN;
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  me uuid := auth.uid();
  owned_table text;
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'Sessão inválida.' USING ERRCODE = '28000';
  END IF;

  -- Explicit allowlist: gameplay, comments, support and personal data, including
  -- legacy tables without FKs and rankings whose FKs would otherwise SET NULL.
  -- Order is child before parent. Absent legacy tables can safely be skipped.
  FOREACH owned_table IN ARRAY ARRAY[
    'user_notification_reads', 'user_challenge_progress', 'player_comments',
    'user_tutorial_progress', 'user_behavioral_metrics', 'user_behavioral_profiles',
    'user_pack_openings', 'user_cards', 'user_decks', 'user_customization',
    'user_achievements', 'user_game_history', 'game_starts', 'check_ins',
    'player_difficulty_stats', 'jersey_difficulty_stats', 'jersey_game_sessions',
    'jersey_game_rankings', 'card_game_rankings', 'rankings', 'funnel_events',
    'support_tickets', 'user_feedback'
  ] LOOP
    IF pg_catalog.to_regclass('public.' || owned_table) IS NOT NULL THEN
      EXECUTE pg_catalog.format('DELETE FROM public.%I WHERE user_id = $1', owned_table) USING me;
    END IF;
  END LOOP;
  -- Remove the whole challenge so names/results do not survive through SET NULL.
  DELETE FROM public.user_challenges WHERE challenger_id = me OR challenged_id = me;
  DELETE FROM public.profiles WHERE id = me;
  DELETE FROM auth.users WHERE id = me;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta não encontrada.';
  END IF;
  -- Any error rolls back ALL deletes. Never catch/ignore a deletion error here.
END;
$$;
REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
COMMIT;
