-- Adicionar nova coluna years como array
ALTER TABLE jerseys ADD COLUMN years integer[];

-- Copiar dados da coluna year para years como array
UPDATE jerseys SET years = ARRAY[year];

-- Definir years como NOT NULL após popular
ALTER TABLE jerseys ALTER COLUMN years SET NOT NULL;

-- Remover coluna year antiga
ALTER TABLE jerseys DROP COLUMN year;