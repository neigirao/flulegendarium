
-- Verificar e corrigir a estrutura da tabela rankings para aceitar score = 0
ALTER TABLE rankings ALTER COLUMN score SET DEFAULT 0;

-- Verificar se existe a tabela 'ranking' (sem 's') e corrigir também
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ranking'
    ) THEN
        ALTER TABLE ranking ALTER COLUMN score SET DEFAULT 0;
    END IF;
END $$;

-- Garantir que não há restrições que impedem inserção de score = 0
-- Vamos verificar diretamente se conseguimos inserir um teste
INSERT INTO rankings (player_name, score, games_played) 
VALUES ('__test_zero_score__', 0, 1);

-- Remover o registro de teste
DELETE FROM rankings WHERE player_name = '__test_zero_score__';
