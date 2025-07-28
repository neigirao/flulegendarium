-- Phase 1: Fix critical admin security
-- Add role column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Create security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Phase 2: Fix player_difficulty_stats RLS policy to allow guest insertions
DROP POLICY IF EXISTS "Users can insert their own difficulty stats" ON public.player_difficulty_stats;

-- Create new policy that allows both authenticated users and guest insertions
CREATE POLICY "Users can insert difficulty stats" 
ON public.player_difficulty_stats 
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated and matches user_id
  (auth.uid() = user_id) OR 
  -- Allow guest insertions where user_id is null
  (user_id IS NULL)
);

-- Update admin notifications policies to use security definer function
DROP POLICY IF EXISTS "Admin can manage all notifications" ON public.admin_notifications;
CREATE POLICY "Admin can manage all notifications" 
ON public.admin_notifications 
FOR ALL 
USING (public.is_admin());

-- Update news management policies to use security definer function
DROP POLICY IF EXISTS "Apenas admins podem gerenciar notícias" ON public.news_articles;
CREATE POLICY "Apenas admins podem gerenciar notícias" 
ON public.news_articles 
FOR ALL 
USING (public.is_admin());

DROP POLICY IF EXISTS "Apenas admins podem gerenciar categorias" ON public.news_categories;
CREATE POLICY "Apenas admins podem gerenciar categorias" 
ON public.news_categories 
FOR ALL 
USING (public.is_admin());

-- Create admin user with proper role (replace the hardcoded auth)
-- This assumes the admin user will need to sign up through the normal flow
-- and then have their role manually set to 'admin' in the database