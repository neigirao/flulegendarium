-- Pacote de seguranca do admin (2026-09-25)
--
-- Contexto: o painel admin se autenticava por senha via RPC executavel pela
-- chave anon e gravava imagens de jogadores com policies publicas. Esta
-- migration:
--   1. cria sessoes de admin com token opaco (24h) - o painel passa a provar
--      cada escrita com um token, nao com "estar logado no navegador";
--   2. adiciona throttle na verificacao de senha (5 falhas/15min por usuario);
--   3. cria RPC protegida para atualizar a imagem de um jogador.
--
-- A senha admin NAO mora aqui nem em nenhuma migration: rotacionada fora do
-- repositorio, no cofre do dono.

-- 1. Sessoes de admin --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours'
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
-- Sem policies: ninguem le nem escreve direto; so as funcoes SECURITY DEFINER.

CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON public.admin_sessions (expires_at);

-- 2. Tentativas de login (para o throttle) -----------------------------------

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username text NOT NULL,
  success boolean NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
-- Sem policies: idem.

-- 3. verify_admin_credentials: agora com throttle e token de sessao ----------
-- DROP necessario porque o tipo de retorno muda (ganha session_token).

DROP FUNCTION IF EXISTS public.verify_admin_credentials(text, text);

CREATE FUNCTION public.verify_admin_credentials(p_username text, p_password text)
RETURNS TABLE (id uuid, username text, session_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_fails int;
  v_id uuid;
  v_username text;
  v_token uuid;
BEGIN
  SELECT count(*) INTO v_fails
  FROM public.admin_login_attempts a
  WHERE lower(a.username) = lower(p_username)
    AND NOT a.success
    AND a.attempted_at > now() - interval '15 minutes';

  -- Resposta identica a "senha errada": nao vaza que a conta existe nem que esta bloqueada.
  IF v_fails >= 5 THEN
    RETURN;
  END IF;

  SELECT au.id, au.username INTO v_id, v_username
  FROM public.admin_users au
  WHERE lower(au.username) = lower(p_username)
    AND au.password_hash = crypt(p_password, au.password_hash)
  LIMIT 1;

  INSERT INTO public.admin_login_attempts (username, success)
  VALUES (p_username, v_id IS NOT NULL);

  IF v_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.admin_sessions (admin_user_id)
  VALUES (v_id)
  RETURNING token INTO v_token;

  RETURN QUERY SELECT v_id, v_username, v_token;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_admin_credentials(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admin_credentials(text, text) TO anon, authenticated;

-- 4. Escrita protegida na imagem de jogador ----------------------------------

CREATE OR REPLACE FUNCTION public.admin_set_player_image(p_token uuid, p_player_id uuid, p_image_url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_sessions s
    WHERE s.token = p_token AND s.expires_at > now()
  ) THEN
    RETURN false;
  END IF;

  UPDATE public.players SET image_url = p_image_url WHERE id = p_player_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_player_image(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_player_image(uuid, uuid, text) TO anon, authenticated;

-- 5. Limpeza opportunista de sessoes vencidas e tentativas antigas -----------

CREATE OR REPLACE FUNCTION public.admin_sessions_cleanup()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.admin_sessions WHERE expires_at < now();
  DELETE FROM public.admin_login_attempts WHERE attempted_at < now() - interval '7 days';
$$;

REVOKE ALL ON FUNCTION public.admin_sessions_cleanup() FROM PUBLIC;
