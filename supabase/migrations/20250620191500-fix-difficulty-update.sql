
-- Criar função RPC para atualizar dificuldade de jogador de forma mais robusta
CREATE OR REPLACE FUNCTION update_player_difficulty(player_id uuid, new_difficulty text)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    -- Verificar se a dificuldade é válida
    IF new_difficulty NOT IN ('muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil') THEN
        RAISE EXCEPTION 'Dificuldade inválida: %', new_difficulty;
    END IF;
    
    -- Atualizar a dificuldade
    UPDATE public.players 
    SET difficulty_level = new_difficulty
    WHERE id = player_id;
    
    -- Verificar se a atualização foi bem-sucedida
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Jogador não encontrado com ID: %', player_id;
    END IF;
    
    -- Retornar o resultado
    SELECT json_build_object(
        'success', true,
        'player_id', player_id,
        'new_difficulty', new_difficulty,
        'updated_at', now()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
