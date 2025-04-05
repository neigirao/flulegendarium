
import { NameProcessingResult } from "@/types/guess-game";

// Local fallback for name matching if the edge function fails
export const isCorrectGuess = (guess: string, playerName: string): boolean => {
  if (!guess || !playerName) return false;
  
  const normalizedGuess = guess.toLowerCase().trim();
  const normalizedPlayerName = playerName.toLowerCase().trim();
  
  // Exact match check
  if (normalizedGuess === normalizedPlayerName) {
    return true;
  }
  
  // Last name check (e.g., "Cavalieri" for "Diego Cavalieri")
  const playerNameParts = normalizedPlayerName.split(' ');
  if (playerNameParts.length > 1) {
    const lastName = playerNameParts[playerNameParts.length - 1];
    if (normalizedGuess === lastName) {
      return true;
    }
  }
  
  // First name check (e.g., "Diego" for "Diego Cavalieri")
  if (playerNameParts.length > 0) {
    const firstName = playerNameParts[0];
    if (normalizedGuess === firstName) {
      return true;
    }
  }
  
  // Nickname check - if the player name contains the guess as a whole word
  // This helps with known nicknames like "Fred" for "Frederico Chaves Guedes"
  const wordBoundaryRegex = new RegExp(`\\b${normalizedGuess}\\b`);
  if (wordBoundaryRegex.test(normalizedPlayerName)) {
    return true;
  }
  
  // Special case for short inputs like "Pet" for "Petch"
  // Handle common nickname variations
  if (
    (normalizedPlayerName === "petch" && normalizedGuess === "pet") ||
    (normalizedPlayerName === "germán cano" && (normalizedGuess === "german" || normalizedGuess === "cano")) ||
    (normalizedPlayerName === "fábio" && normalizedGuess === "fabio") ||
    (normalizedPlayerName === "jhon arias" && normalizedGuess === "arias") ||
    (normalizedPlayerName === "john kennedy" && (normalizedGuess === "john" || normalizedGuess === "kennedy"))
  ) {
    return true;
  }
  
  return false;
};

// Edge function to process and validate player names
export const processPlayerName = async (guess: string): Promise<NameProcessingResult> => {
  try {
    // Call our edge function to process the player name
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-player-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ userInput: guess })
    });
    
    if (!response.ok) {
      throw new Error('Falha ao processar o nome do jogador');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao processar nome do jogador:', error);
    // Fallback to local name matching if edge function fails
    return { processedName: null, confidence: 0 };
  }
};
