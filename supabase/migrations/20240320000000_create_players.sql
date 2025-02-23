
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    image_url TEXT NOT NULL,
    year_highlight TEXT NOT NULL,
    fun_fact TEXT NOT NULL,
    achievements TEXT[] DEFAULT '{}',
    statistics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Adiciona alguns jogadores iniciais
INSERT INTO players (name, position, image_url, year_highlight, fun_fact, achievements, statistics)
VALUES
    ('Germán Cano', 'Atacante', 'URL_DA_IMAGEM', '2022', 'Artilheiro da Libertadores 2022', 
     ARRAY['Libertadores 2023', 'Carioca 2022'], 
     '{"gols": 81, "jogos": 123}'::jsonb),
    ('Fred', 'Atacante', 'URL_DA_IMAGEM', '2012', 'Maior artilheiro da história do Brasileirão', 
     ARRAY['Brasileirão 2012', 'Copa do Brasil 2007'],
     '{"gols": 199, "jogos": 288}'::jsonb);

-- Cria tabela de rankings
CREATE TABLE rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES auth.users ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    perfect_guesses INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Políticas de segurança
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players são públicos" ON players FOR SELECT TO PUBLIC USING (true);

ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rankings são públicos" ON rankings FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Usuários podem atualizar seus próprios rankings" ON rankings
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Usuários podem atualizar seus próprios rankings" ON rankings
    FOR UPDATE TO authenticated
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);
