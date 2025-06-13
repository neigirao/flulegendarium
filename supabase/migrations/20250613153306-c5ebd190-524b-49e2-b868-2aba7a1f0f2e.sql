
-- Criar tabela para armazenar tentativas de palpites
CREATE TABLE public.game_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  target_player_id UUID REFERENCES public.players(id),
  target_player_name TEXT NOT NULL,
  guess TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela para sessões de jogo completas
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela para administradores
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$rGJZq8P8WQxkVZ0P.QxkVe8P8WQxkVZ0P.QxkVe8P8WQxkVZ0P.Qx');

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.game_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura pública dos dados de tentativas e sessões
CREATE POLICY "Game attempts são públicos para leitura" ON public.game_attempts FOR SELECT USING (true);
CREATE POLICY "Game sessions são públicos para leitura" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Admin users são públicos para leitura" ON public.admin_users FOR SELECT USING (true);

-- Políticas para permitir inserção pública (para registrar jogadas)
CREATE POLICY "Qualquer um pode inserir game attempts" ON public.game_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode inserir game sessions" ON public.game_sessions FOR INSERT WITH CHECK (true);
