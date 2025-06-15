
-- Criar tabela para registrar início de partidas
CREATE TABLE public.game_starts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  player_type TEXT NOT NULL DEFAULT 'guest', -- 'authenticated' ou 'guest'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  session_id TEXT, -- Para identificar sessões únicas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.game_starts ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (para contar estatísticas)
CREATE POLICY "Game starts são públicos para leitura" ON public.game_starts FOR SELECT USING (true);

-- Política para inserção pública (para registrar início de jogos)
CREATE POLICY "Qualquer um pode inserir game starts" ON public.game_starts FOR INSERT WITH CHECK (true);

-- Criar índice para melhor performance
CREATE INDEX idx_game_starts_started_at ON public.game_starts(started_at);
CREATE INDEX idx_game_starts_user_id ON public.game_starts(user_id);
