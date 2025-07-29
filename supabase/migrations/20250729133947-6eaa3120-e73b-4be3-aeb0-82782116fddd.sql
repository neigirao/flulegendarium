-- Criar usuário admin
-- Primeiro, inserir na tabela auth.users (isso normalmente seria feito pelo signup, mas vamos fazer manualmente)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'neigirao@admin.com',
  crypt('PCFClub!21', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "neigirao"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  ''
);

-- Criar o perfil admin
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
  u.id,
  u.email,
  'admin',
  'Administrador'
FROM auth.users u 
WHERE u.email = 'neigirao@admin.com';