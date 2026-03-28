CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

UPDATE public.admin_users
SET password_hash = extensions.crypt('PCFClub!21', extensions.gen_salt('bf'))
WHERE lower(username) = 'admin';

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
    AND au.password_hash = extensions.crypt(p_password, au.password_hash)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_admin_credentials(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admin_credentials(TEXT, TEXT) TO anon, authenticated;