-- Fix Function Search Path Mutable warnings by setting search_path for all functions

-- Update handle_new_user function with proper search_path
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$function$;

-- Update cleanup_expired_notifications function with proper search_path
DROP FUNCTION IF EXISTS public.cleanup_expired_notifications();
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.admin_notifications 
  SET is_active = false 
  WHERE expires_at IS NOT NULL 
  AND expires_at < now() 
  AND is_active = true;
END;
$function$;

-- Update update_updated_at_column function with proper search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$;