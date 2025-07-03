-- Alterar o campo decade de text para text[] (array)
ALTER TABLE public.players 
DROP COLUMN decade;

ALTER TABLE public.players 
ADD COLUMN decades text[] DEFAULT '{}';

-- Atualizar jogadores existentes com suas décadas
UPDATE public.players SET decades = ARRAY['1970s'] WHERE name IN ('Rivelino', 'Carlos Alberto Torres', 'Doval');
UPDATE public.players SET decades = ARRAY['1980s'] WHERE name IN ('Assis', 'Pintinho');
UPDATE public.players SET decades = ARRAY['1980s', '2000s'] WHERE name = 'Washington'; -- Múltiplas passagens
UPDATE public.players SET decades = ARRAY['1990s'] WHERE name IN ('Renato Gaúcho', 'Ailton', 'Jandir');
UPDATE public.players SET decades = ARRAY['2000s'] WHERE name IN ('Thiago Neves', 'Conca');
UPDATE public.players SET decades = ARRAY['2010s'] WHERE name IN ('Fred', 'Ganso', 'Deco', 'Carlinhos');
UPDATE public.players SET decades = ARRAY['2010s', '2020s'] WHERE name = 'Paulo Henrique Ganso'; -- Múltiplas passagens
UPDATE public.players SET decades = ARRAY['2020s'] WHERE name IN ('Germán Cano', 'Nino', 'André');