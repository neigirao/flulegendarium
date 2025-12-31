-- Criar tabela para reports de erros de imagem
CREATE TABLE IF NOT EXISTS public.image_error_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  original_url TEXT,
  resolved_url TEXT,
  error_type TEXT NOT NULL DEFAULT 'load_error',
  retry_count INTEGER DEFAULT 0,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_image_error_reports_player_id ON public.image_error_reports(player_id);
CREATE INDEX IF NOT EXISTS idx_image_error_reports_resolved ON public.image_error_reports(resolved);
CREATE INDEX IF NOT EXISTS idx_image_error_reports_reported_at ON public.image_error_reports(reported_at DESC);

-- Enable RLS
ALTER TABLE public.image_error_reports ENABLE ROW LEVEL SECURITY;

-- Política para permitir insert de qualquer usuário (anônimo ou autenticado)
CREATE POLICY "Allow insert for all users" ON public.image_error_reports
  FOR INSERT WITH CHECK (true);

-- Política para admins visualizarem todos os reports
CREATE POLICY "Allow admin to view all reports" ON public.image_error_reports
  FOR SELECT USING (public.is_admin());

-- Política para admins atualizarem reports
CREATE POLICY "Allow admin to update reports" ON public.image_error_reports
  FOR UPDATE USING (public.is_admin());