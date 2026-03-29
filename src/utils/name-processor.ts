import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Resultado do processamento e validação de um nome.
 */
export interface NameProcessingResult {
  /** Nome processado do jogador (null se não houver match) */
  processedName: string | null;
  /** Nível de confiança do match (0-1) */
  confidence: number;
  /** Tipo de match encontrado ('name' | 'nickname') */
  matchType?: string;
}

/**
 * Normaliza texto para comparação.
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
};

/**
 * Verifica se há correspondência parcial entre palpite e nome alvo.
 */
const isPartialMatch = (guess: string, target: string): boolean => {
  const normalizedGuess = normalizeText(guess);
  const normalizedTarget = normalizeText(target);
  
  if (normalizedGuess === normalizedTarget) return true;
  if (normalizedTarget.includes(normalizedGuess)) return true;
  if (normalizedGuess.includes(normalizedTarget)) return true;
  
  const guessWords = normalizedGuess.split(' ').filter(w => w.length > 2);
  const targetWords = normalizedTarget.split(' ').filter(w => w.length > 2);
  
  return guessWords.some(gw => 
    targetWords.some(tw => tw.includes(gw) || gw.includes(tw))
  );
};

/**
 * Validação simples de palpite (fallback local sem banco de dados).
 */
export const isCorrectGuess = (guess: string, playerName: string): boolean => {
  return isPartialMatch(guess, playerName);
};

/**
 * Processa e valida palpite do usuário contra dados do jogador.
 */
export const processPlayerName = async (
  guess: string,
  targetPlayerName: string,
  targetPlayerId: string
): Promise<NameProcessingResult> => {
  try {
    logger.debug("Processando palpite", "NAME_PROCESSOR", { guess, targetPlayerName });
    
    const { data: playerData, error } = await supabase
      .from('players')
      .select('name, nicknames')
      .eq('id', targetPlayerId)
      .single();

    if (error) {
      logger.error("Erro ao buscar dados do jogador", "NAME_PROCESSOR", error);
      return { processedName: null, confidence: 0 };
    }

    const playerName = playerData.name;
    const nicknames = playerData.nicknames || [];
    
    logger.debug("Dados do jogador carregados", "NAME_PROCESSOR", { playerName, nicknames });

    if (isPartialMatch(guess, playerName)) {
      logger.debug("Match encontrado com nome principal", "NAME_PROCESSOR");
      return {
        processedName: playerName,
        confidence: 0.9,
        matchType: 'name'
      };
    }

    for (const nickname of nicknames) {
      if (isPartialMatch(guess, nickname)) {
        logger.debug("Match encontrado com apelido", "NAME_PROCESSOR", { nickname });
        return {
          processedName: playerName,
          confidence: 0.85,
          matchType: 'nickname'
        };
      }
    }

    logger.debug("Nenhum match encontrado", "NAME_PROCESSOR");
    return { processedName: null, confidence: 0 };

  } catch (error) {
    logger.error("Erro no processamento do nome", "NAME_PROCESSOR", error);
    return { processedName: null, confidence: 0 };
  }
};
