
-- Adicionar campo para distinguir tipo de jogo nas tabelas existentes
ALTER TABLE public.game_starts 
ADD COLUMN game_mode TEXT DEFAULT 'classic';

ALTER TABLE public.user_game_history 
ADD COLUMN game_mode TEXT DEFAULT 'classic',
ADD COLUMN difficulty_level TEXT,
ADD COLUMN difficulty_multiplier DECIMAL DEFAULT 1.0;

ALTER TABLE public.rankings 
ADD COLUMN game_mode TEXT DEFAULT 'classic',
ADD COLUMN difficulty_level TEXT;

-- Criar índices para melhor performance
CREATE INDEX idx_game_starts_game_mode ON public.game_starts(game_mode);
CREATE INDEX idx_user_game_history_game_mode ON public.user_game_history(game_mode);
CREATE INDEX idx_rankings_game_mode ON public.rankings(game_mode);
