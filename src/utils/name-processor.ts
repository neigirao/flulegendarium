import { supabase } from "@/integrations/supabase/client";

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
 * 
 * Remove acentos, converte para minúsculo e limpa caracteres especiais.
 * 
 * @param {string} text - Texto a ser normalizado
 * @returns {string} Texto normalizado
 * 
 * @example
 * ```typescript
 * normalizeText("José Ângelo"); // "jose angelo"
 * normalizeText("Fred!"); // "fred"
 * ```
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
 * 
 * Aplica múltiplas estratégias de matching:
 * - Match exato normalizado
 * - Substring em qualquer direção
 * - Match por palavras individuais (> 2 caracteres)
 * 
 * @param {string} guess - Palpite do usuário
 * @param {string} target - Nome alvo para comparação
 * @returns {boolean} True se houver correspondência
 * 
 * @example
 * ```typescript
 * isPartialMatch("fred", "Fred Chaves"); // true
 * isPartialMatch("chaves", "Fred Chaves"); // true
 * isPartialMatch("paulo", "Fred Chaves"); // false
 * ```
 */
const isPartialMatch = (guess: string, target: string): boolean => {
  const normalizedGuess = normalizeText(guess);
  const normalizedTarget = normalizeText(target);
  
  // Verifica match exato primeiro
  if (normalizedGuess === normalizedTarget) return true;
  
  // Verifica se o palpite está contido no nome
  if (normalizedTarget.includes(normalizedGuess)) return true;
  
  // Verifica se o nome está contido no palpite
  if (normalizedGuess.includes(normalizedTarget)) return true;
  
  // Verifica por palavras individuais
  const guessWords = normalizedGuess.split(' ').filter(w => w.length > 2);
  const targetWords = normalizedTarget.split(' ').filter(w => w.length > 2);
  
  return guessWords.some(gw => 
    targetWords.some(tw => tw.includes(gw) || gw.includes(tw))
  );
};

/**
 * Validação simples de palpite (fallback local sem banco de dados).
 * 
 * @param {string} guess - Palpite do usuário
 * @param {string} playerName - Nome do jogador
 * @returns {boolean} True se o palpite está correto
 * 
 * @example
 * ```typescript
 * isCorrectGuess("fred", "Fred"); // true
 * ```
 */
export const isCorrectGuess = (guess: string, playerName: string): boolean => {
  return isPartialMatch(guess, playerName);
};

/**
 * Processa e valida palpite do usuário contra dados do jogador.
 * 
 * Busca os dados completos do jogador no banco (nome + apelidos) e verifica
 * se o palpite corresponde a algum deles. Retorna resultado com nível de
 * confiança e tipo de match encontrado.
 * 
 * ### Estratégia de Validação
 * 1. Busca nome e apelidos do jogador no banco
 * 2. Verifica match com nome principal (confidence: 0.9)
 * 3. Verifica match com apelidos (confidence: 0.85)
 * 4. Retorna confiança 0 se não houver match
 * 
 * ### Normalização
 * - Remove acentos de ambos os lados
 * - Converte para minúsculas
 * - Remove caracteres especiais
 * - Suporta match parcial de palavras
 * 
 * @param {string} guess - Palpite digitado pelo usuário
 * @param {string} targetPlayerName - Nome correto do jogador (referência)
 * @param {string} targetPlayerId - ID do jogador no banco de dados
 * 
 * @returns {Promise<NameProcessingResult>} Resultado do processamento
 * 
 * @throws {Error} Não lança erro, retorna confidence 0 em caso de falha
 * 
 * @example
 * ```typescript
 * const result = await processPlayerName(
 *   "fred",
 *   "Fred Chaves Guedes",
 *   "player-uuid-123"
 * );
 * 
 * if (result.confidence > 0.7) {
 *   console.log("Palpite correto!");
 *   console.log("Match type:", result.matchType); // "name" ou "nickname"
 * }
 * ```
 * 
 * @see {@link isPartialMatch} Lógica de comparação de strings
 * @see {@link NameProcessingResult} Estrutura do resultado
 */
export const processPlayerName = async (
  guess: string,
  targetPlayerName: string,
  targetPlayerId: string
): Promise<NameProcessingResult> => {
  try {
    console.log("Processando palpite:", guess, "para jogador:", targetPlayerName);
    
    // Buscar dados do jogador alvo incluindo apelidos
    const { data: playerData, error } = await supabase
      .from('players')
      .select('name, nicknames')
      .eq('id', targetPlayerId)
      .single();

    if (error) {
      console.error("Erro ao buscar dados do jogador:", error);
      return { processedName: null, confidence: 0 };
    }

    const playerName = playerData.name;
    const nicknames = playerData.nicknames || [];
    
    console.log("Dados do jogador:", { playerName, nicknames });

    // Verificar match com o nome principal
    if (isPartialMatch(guess, playerName)) {
      console.log("Match encontrado com nome principal");
      return {
        processedName: playerName,
        confidence: 0.9,
        matchType: 'name'
      };
    }

    // Verificar match com apelidos
    for (const nickname of nicknames) {
      if (isPartialMatch(guess, nickname)) {
        console.log("Match encontrado com apelido:", nickname);
        return {
          processedName: playerName,
          confidence: 0.85,
          matchType: 'nickname'
        };
      }
    }

    console.log("Nenhum match encontrado");
    return { processedName: null, confidence: 0 };

  } catch (error) {
    console.error("Erro no processamento do nome:", error);
    return { processedName: null, confidence: 0 };
  }
};
