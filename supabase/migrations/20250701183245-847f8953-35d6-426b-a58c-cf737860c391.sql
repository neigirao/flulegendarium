
-- Inserir jogadores históricos do Fluminense com suas respectivas décadas
INSERT INTO public.players (name, position, image_url, year_highlight, fun_fact, achievements, nicknames, decade, difficulty_level, statistics) VALUES

-- Anos 70
('Rivelino', 'Meio-campo', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '1974', 'Considerado um dos maiores jogadores brasileiros de todos os tempos', ARRAY['Copa do Mundo 1970'], ARRAY['Rei do Drible'], '1970s', 'facil', '{"gols": 127, "jogos": 245}'),
('Carlos Alberto Torres', 'Lateral-direito', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '1975', 'Capitão da seleção na Copa de 70', ARRAY['Copa do Mundo 1970', 'Campeonato Carioca 1975'], ARRAY['Capitão'], '1970s', 'medio', '{"gols": 32, "jogos": 198}'),
('Doval', 'Atacante', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '1976', 'Artilheiro histórico dos anos 70', ARRAY['Campeonato Carioca 1976'], ARRAY['Artilheiro'], '1970s', 'dificil', '{"gols": 89, "jogos": 156}'),

-- Anos 80
('Assis', 'Meio-campo', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '1984', 'Maestro do meio-campo tricolor', ARRAY['Campeonato Brasileiro 1984'], ARRAY['Maestro'], '1980s', 'medio', '{"gols": 45, "jogos": 287}'),
('Washington', 'Atacante', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '1987', 'Grande goleador da década de 80', ARRAY['Campeonato Carioca 1983', 'Campeonato Carioca 1985'], ARRAY['Goleador'], '1980s', 'facil', '{"gols": 134, "jogos": 243}'),
('Pintinho', 'Meio-campo', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '1985', 'Jogador técnico e elegante', ARRAY['Campeonato Brasileiro 1984'], ARRAY['Elegante'], '1980s', 'dificil', '{"gols": 28, "jogos": 178}'),

-- Anos 90
('Renato Gaúcho', 'Atacante', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '1995', 'Ídolo tricolor dos anos 90', ARRAY['Copa do Brasil 2007'], ARRAY['Portaluppi'], '1990s', 'facil', '{"gols": 67, "jogos": 156}'),
('Ailton', 'Atacante', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '1999', 'Artilheiro letal dos anos 90', ARRAY['Campeonato Carioca 1995'], ARRAY['Milagre'], '1990s', 'medio', '{"gols": 89, "jogos": 134}'),
('Jandir', 'Goleiro', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '1992', 'Goleiro seguro da década', ARRAY['Campeonato Carioca 1995'], ARRAY['Muralha'], '1990s', 'dificil', '{"gols": 0, "jogos": 156}'),

-- Anos 2000
('Thiago Neves', 'Meio-campo', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2007', 'Meia habilidoso e goleador', ARRAY['Copa do Brasil 2007'], ARRAY['Maestro'], '2000s', 'facil', '{"gols": 23, "jogos": 89}'),
('Conca', 'Meio-campo', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2008', 'Argentino craque que brilhou no Flu', ARRAY['Copa do Brasil 2007'], ARRAY['Dario'], '2000s', 'medio', '{"gols": 34, "jogos": 125}'),
('Washington', 'Atacante', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2005', 'Retornou ao Flu nos anos 2000', ARRAY['Copa do Brasil 2007'], ARRAY['Coração Valente'], '2000s', 'medio', '{"gols": 45, "jogos": 98}'),

-- Anos 2010
('Fred', 'Atacante', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2012', 'Maior ídolo do Fluminense no século XXI', ARRAY['Campeonato Brasileiro 2010', 'Campeonato Brasileiro 2012'], ARRAY['Fredgol'], '2010s', 'muito_facil', '{"gols": 199, "jogos": 356}'),
('Ganso', 'Meio-campo', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2010', 'Revelação tricolor que brilhou na base', ARRAY['Campeonato Brasileiro 2010'], ARRAY['Ganso'], '2010s', 'facil', '{"gols": 21, "jogos": 67}'),
('Deco', 'Meio-campo', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2010', 'Craque português que chegou ao Flu', ARRAY['Campeonato Brasileiro 2010'], ARRAY['Maestro'], '2010s', 'facil', '{"gols": 8, "jogos": 34}'),
('Carlinhos', 'Lateral-esquerdo', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2012', 'Lateral ofensivo muito querido', ARRAY['Campeonato Brasileiro 2012'], ARRAY['Carlinho'], '2010s', 'dificil', '{"gols": 15, "jogos": 145}'),

-- Anos 2020
('Germán Cano', 'Atacante', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2022', 'Artilheiro argentino que conquistou os tricolores', ARRAY['Campeonato Carioca 2022', 'Campeonato Carioca 2023'], ARRAY['Cano'], '2020s', 'muito_facil', '{"gols": 84, "jogos": 123}'),
('Paulo Henrique Ganso', 'Meio-campo', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2021', 'Retornou ao Flu como grande estrela', ARRAY['Campeonato Carioca 2022'], ARRAY['Ganso'], '2020s', 'facil', '{"gols": 12, "jogos": 89}'),
('Nino', 'Zagueiro', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2023', 'Zagueiro sólido da era atual', ARRAY['Campeonato Carioca 2022', 'Libertadores 2023'], ARRAY['Muralha'], '2020s', 'medio', '{"gols": 8, "jogos": 156}'),
('André', 'Volante', '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', '2022', 'Volante que se destacou recentemente', ARRAY['Campeonato Carioca 2023'], ARRAY['Pitbull'], '2020s', 'dificil', '{"gols": 3, "jogos": 98}');
