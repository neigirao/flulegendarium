CREATE OR REPLACE FUNCTION public.get_home_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'player_count', (SELECT count(*) FROM public.players),
    'jersey_count', (SELECT count(*) FROM public.jerseys),
    'today_players', (
      SELECT count(*) FROM public.game_starts
      WHERE started_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
    )
  );
$$;