
import { supabase } from "@/lib/supabase";

export interface NameProcessingResult {
  processedName: string | null;
  confidence: number;
  matchType?: string;
}

// Função para normalizar nomes (remover acentos, converter para minúsculo, etc.)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
};

// Função para verificar se uma string está contida em outra (parcialmente)
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
