-- GRANTs explícitos para o Data API (Supabase deixa de auto-conceder em 30/out/2026:
-- https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
-- Cobre as 25 tabelas usadas pelo cliente via Data API que não tinham GRANT explícito.
-- Preserva o comportamento atual (os default privileges de hoje concedem tudo a
-- anon/authenticated/service_role); RLS segue sendo o porteiro real por linha.
-- Refinamento futuro (fora do escopo): restringir anon vs authenticated tabela a
-- tabela, auditando policy por policy.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_challenges TO anon, authenticated;
GRANT ALL ON public.daily_challenges TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.funnel_events TO anon, authenticated;
GRANT ALL ON public.funnel_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_attempts TO anon, authenticated;
GRANT ALL ON public.game_attempts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_sessions TO anon, authenticated;
GRANT ALL ON public.game_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_starts TO anon, authenticated;
GRANT ALL ON public.game_starts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.image_error_reports TO anon, authenticated;
GRANT ALL ON public.image_error_reports TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jersey_difficulty_stats TO anon, authenticated;
GRANT ALL ON public.jersey_difficulty_stats TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jersey_game_rankings TO anon, authenticated;
GRANT ALL ON public.jersey_game_rankings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jersey_game_sessions TO anon, authenticated;
GRANT ALL ON public.jersey_game_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jerseys TO anon, authenticated;
GRANT ALL ON public.jerseys TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_events TO anon, authenticated;
GRANT ALL ON public.live_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_stats TO anon, authenticated;
GRANT ALL ON public.live_stats TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_articles TO anon, authenticated;
GRANT ALL ON public.news_articles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_categories TO anon, authenticated;
GRANT ALL ON public.news_categories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_comments TO anon, authenticated;
GRANT ALL ON public.player_comments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_difficulty_stats TO anon, authenticated;
GRANT ALL ON public.player_difficulty_stats TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rankings TO anon, authenticated;
GRANT ALL ON public.rankings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO anon, authenticated;
GRANT ALL ON public.support_tickets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO anon, authenticated;
GRANT ALL ON public.user_achievements TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_challenge_progress TO anon, authenticated;
GRANT ALL ON public.user_challenge_progress TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_challenges TO anon, authenticated;
GRANT ALL ON public.user_challenges TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_feedback TO anon, authenticated;
GRANT ALL ON public.user_feedback TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_game_history TO anon, authenticated;
GRANT ALL ON public.user_game_history TO service_role;
-- SEM grant de propósito (acesso só via RPCs security definer / painel negado por policy):
-- admin_users, admin_sessions, admin_login_attempts, admin_notifications, user_notification_reads.
