-- =============================================
-- CORREÇÕES DE SEGURANÇA CRÍTICAS - RLS
-- =============================================

-- 1. CRÍTICO: Proteger tabela 'users' - emails expostos publicamente
-- Remover política permissiva e criar política restritiva
DROP POLICY IF EXISTS "Allow public select on users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert on users" ON public.users;
DROP POLICY IF EXISTS "Allow public update on users" ON public.users;
DROP POLICY IF EXISTS "Allow public delete on users" ON public.users;

-- Criar políticas restritivas para users
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- 2. CRÍTICO: Proteger tabela 'admin_users' - hashes de senha expostos
-- Remover todas as políticas públicas
DROP POLICY IF EXISTS "Allow public select on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Anyone can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Public read access" ON public.admin_users;

-- Negar acesso direto à tabela admin_users (usar views ou edge functions)
CREATE POLICY "No direct access to admin_users"
ON public.admin_users FOR SELECT
USING (false);

-- 3. CRÍTICO: Proteger tabela 'user_feedback' - emails expostos
DROP POLICY IF EXISTS "Admin pode ver todos os feedbacks" ON public.user_feedback;

-- Criar política que requer autenticação (user_id é uuid)
CREATE POLICY "Users can view their own feedback"
ON public.user_feedback FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can insert feedback"
ON public.user_feedback FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. CRÍTICO: Proteger tabela 'support_tickets' - emails expostos
DROP POLICY IF EXISTS "Admin pode ver todos os tickets" ON public.support_tickets;

-- Criar política restritiva (user_id é uuid)
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can create tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. CRÍTICO: Proteger tabela 'bugs' - emails expostos
DROP POLICY IF EXISTS "Only service role can view bug reports" ON public.bugs;

-- Criar política restritiva (apenas admins via service role podem ver)
CREATE POLICY "Users can view their own bug reports"
ON public.bugs FOR SELECT
USING (false);

CREATE POLICY "Authenticated users can create bug reports"
ON public.bugs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);