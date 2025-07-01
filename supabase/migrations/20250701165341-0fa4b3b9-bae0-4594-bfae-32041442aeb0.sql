
-- Adicionar campo decade na tabela players
ALTER TABLE public.players 
ADD COLUMN decade TEXT;

-- Criar índice para otimizar consultas por década
CREATE INDEX idx_players_decade ON public.players(decade);

-- Atualizar alguns jogadores existentes com décadas de exemplo
-- (Você pode ajustar essas décadas conforme a história real dos jogadores)
UPDATE public.players 
SET decade = '2020s' 
WHERE name IN ('Germán Cano', 'Paulo Henrique Ganso', 'André');

UPDATE public.players 
SET decade = '2010s' 
WHERE name IN ('Fred', 'Conca', 'Thiago Neves');

UPDATE public.players 
SET decade = '2000s' 
WHERE name IN ('Romário', 'Edmundo', 'Túlio Maravilha');

UPDATE public.players 
SET decade = '1990s' 
WHERE name IN ('Renato Gaúcho', 'Bebeto', 'Assis');

UPDATE public.players 
SET decade = '1980s' 
WHERE name IN ('Zico', 'Júnior', 'Tita');

UPDATE public.players 
SET decade = '1970s' 
WHERE name IN ('Rivelino', 'Doval', 'Lula');
