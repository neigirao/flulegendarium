
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para inserir perfil (será usado pelo trigger)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Adicionar coluna user_id na tabela rankings para vincular com usuários
ALTER TABLE public.rankings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Habilitar RLS na tabela rankings
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Política para todos verem rankings (para o ranking público)
CREATE POLICY "Anyone can view rankings" ON public.rankings
  FOR SELECT TO PUBLIC USING (true);

-- Política para inserir rankings (usuários logados ou anônimos)
CREATE POLICY "Anyone can insert rankings" ON public.rankings
  FOR INSERT TO PUBLIC WITH CHECK (true);

-- Criar tabela para histórico de jogos dos usuários
CREATE TABLE public.user_game_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  correct_guesses INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  game_duration INTEGER, -- em segundos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS na tabela user_game_history
ALTER TABLE public.user_game_history ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio histórico
CREATE POLICY "Users can view own game history" ON public.user_game_history
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários inserirem apenas seu próprio histórico
CREATE POLICY "Users can insert own game history" ON public.user_game_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
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
$$;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
