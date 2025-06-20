
-- Vamos verificar a estrutura atual da tabela players e fazer alguns testes
-- Primeiro, vamos ver os dados atuais da coluna difficulty_level
SELECT id, name, difficulty_level, created_at 
FROM players 
ORDER BY name 
LIMIT 10;

-- Vamos também verificar se existe alguma constraint ou trigger que possa estar interferindo
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'players'::regclass;

-- Verificar se há triggers na tabela players
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'players'::regclass;

-- Fazer um teste de atualização manual para verificar se a coluna aceita updates
-- (vamos apenas verificar, não executar de fato)
-- UPDATE players SET difficulty_level = 'facil' WHERE id = (SELECT id FROM players LIMIT 1);
