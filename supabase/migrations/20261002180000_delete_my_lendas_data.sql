-- Exclusão de conta (Apple 5.1.1): apaga SOMENTE dados do Lendas do usuário logado.
-- Não apaga auth.users (login compartilhado com outros projetos do mesmo banco).
create or replace function public.delete_my_lendas_data()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  uemail text;
  n bigint;
  res jsonb := '{}'::jsonb;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select email into uemail from auth.users where id = uid;

  delete from public.user_game_history where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('user_game_history', n);
  delete from public.user_achievements where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('user_achievements', n);
  delete from public.user_challenge_progress where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('user_challenge_progress', n);
  delete from public.user_challenges where challenger_id = uid or challenged_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('user_challenges', n);
  delete from public.game_starts where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('game_starts', n);
  delete from public.jersey_game_rankings where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('jersey_game_rankings', n);
  delete from public.jersey_game_sessions where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('jersey_game_sessions', n);
  delete from public.jersey_difficulty_stats where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('jersey_difficulty_stats', n);
  delete from public.player_difficulty_stats where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('player_difficulty_stats', n);
  delete from public.rankings where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('rankings', n);
  delete from public.player_comments where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('player_comments', n);
  delete from public.user_feedback where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('user_feedback', n);
  delete from public.support_tickets where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('support_tickets', n);
  delete from public.funnel_events where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('funnel_events', n);
  delete from public.user_notification_reads where user_id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('user_notification_reads', n);
  if uemail is not null then
    delete from public.bugs where lower(email) = lower(uemail);
    get diagnostics n = row_count; res := res || jsonb_build_object('bugs', n);
  end if;
  update public.profiles set full_name = null, avatar_url = null where id = uid;
  get diagnostics n = row_count; res := res || jsonb_build_object('profiles_cleared', n);

  return res;
end;
$$;

revoke all on function public.delete_my_lendas_data() from public, anon;
grant execute on function public.delete_my_lendas_data() to authenticated, service_role;
