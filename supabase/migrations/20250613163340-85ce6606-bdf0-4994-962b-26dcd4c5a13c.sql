
-- Adicionar campo de apelidos na tabela players
ALTER TABLE public.players 
ADD COLUMN nicknames TEXT[] DEFAULT '{}';

-- Atualizar alguns jogadores existentes com apelidos comuns
UPDATE public.players 
SET nicknames = ARRAY['Cano', 'Germán'] 
WHERE name ILIKE '%Germán Cano%';

UPDATE public.players 
SET nicknames = ARRAY['Frederico', 'Chaves Guedes'] 
WHERE name ILIKE '%Fred%';
