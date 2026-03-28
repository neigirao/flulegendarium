-- Reativar login admin de forma segura via função RPC com SECURITY DEFINER
-- e redefinir a senha solicitada para os usuários administrativos conhecidos.

CREATE OR REPLACE FUNCTION public.verify_admin_credentials(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  username TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.username
  FROM public.admin_users au
  WHERE lower(au.username) = lower(p_username)
    AND au.password_hash = crypt(p_password, au.password_hash)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_admin_credentials(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admin_credentials(TEXT, TEXT) TO anon, authenticated;

-- Garante um usuário admin padrão e redefine senha conforme solicitado.
INSERT INTO public.admin_users (username, password_hash)
SELECT 'admin', crypt('PCFClub!21', gen_salt('bf'))
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE lower(username) = 'admin'
);

UPDATE public.admin_users
SET password_hash = crypt('PCFClub!21', gen_salt('bf'))
WHERE lower(username) IN ('admin', 'neigirao');
