
-- Criar tabela para feedback dos usuários
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  user_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('gameplay', 'ui', 'performance', 'content', 'bug', 'suggestion', 'general')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para tickets de suporte
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  user_email TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category TEXT NOT NULL DEFAULT 'technical' CHECK (category IN ('technical', 'gameplay', 'account', 'billing', 'feature_request')),
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Políticas para user_feedback (leitura pública para admin, inserção pública)
CREATE POLICY "Admin pode ver todos os feedbacks" ON public.user_feedback FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir feedback" ON public.user_feedback FOR INSERT WITH CHECK (true);

-- Políticas para support_tickets (leitura pública para admin, inserção pública)
CREATE POLICY "Admin pode ver todos os tickets" ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode criar tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin pode atualizar tickets" ON public.support_tickets FOR UPDATE USING (true);

-- Criar índices para melhor performance
CREATE INDEX idx_user_feedback_created_at ON public.user_feedback(created_at);
CREATE INDEX idx_user_feedback_rating ON public.user_feedback(rating);
CREATE INDEX idx_user_feedback_category ON public.user_feedback(category);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
