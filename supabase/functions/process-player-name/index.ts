
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to normalize text: remove accents, lowercase, and trim
function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .normalize('NFD')  // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .toLowerCase()
    .trim();
}

// Expanded nicknames database with more players and common variations
const PLAYER_NICKNAMES: Record<string, string[]> = {
  "Germán Cano": ["cano", "el matador", "german", "germán"],
  "Fred": ["frederico chaves guedes", "fredgol", "fred jogador"],
  "John Kennedy": ["jk", "kennedy", "john", "john k"],
  "Marcelo": ["m12", "filho do flu", "marcelo vieira", "marcelinho"],
  "Fábio": ["são fábio", "fabio", "muralha tricolor", "fabinho"],
  "Felipe Melo": ["pitbull", "fm30", "melo"],
  "André": ["andrezinho", "andre", "andre flu"],
  "Ganso": ["paulo henrique", "ph", "ph ganso", "paulo henrique ganso"],
  "Thiago Silva": ["monstro", "ts", "silva", "thiago"],
  "Keno": ["marcos rocha", "keninho"],
  "Nino": ["ninão", "nino cavaliere"],
  "Lima": ["limão", "john arias lima"],
  "Arias": ["john arias", "jhon arias", "aras"],
  "Petch": ["pet", "petchi", "petersson"],
  "Petković": ["pet", "petkovic", "petko"],
  "Martinelli": ["gabi martinelli", "gabriel martinelli", "martine", "martineli"],
  "Samuel Xavier": ["samuel", "xavier", "samuca"],
  "Diogo Barbosa": ["diogo", "barbosa"],
  "Nonato": ["tatinho", "nato"],
  "Manoel": ["manel", "manuel"],
  "Thiago Santos": ["thiago", "santão", "thiagão"],
  "Alexsander": ["alex", "alexandre", "alexsandro"],
  "Arthur": ["art", "arthurzinho", "artur", "arthur melo"],
  "Caio Paulista": ["caio", "paulista"],
  "Fábio Santos": ["fabinho", "santos"],
  "David Braz": ["david", "braz"],
  "Jhon Arias": ["arias", "jhon", "john arias", "columbian"],
  "Renato Augusto": ["renato", "augusto", "ra8"],
  "Lelê": ["lele", "lê", "lelezinho"]
};

// Helper function to calculate string similarity 
// using Levenshtein distance algorithm
function calculateSimilarity(s1: string, s2: string): number {
  // Normalize both strings to remove accents and make comparison consistent
  s1 = normalizeText(s1);
  s2 = normalizeText(s2);
  
  if (s1 === s2) return 1.0; // Perfect match
  
  // If one string contains the other, it's likely a match
  if (s1.includes(s2) || s2.includes(s1)) {
    // Calculate ratio based on length difference
    const longLength = Math.max(s1.length, s2.length);
    const shortLength = Math.min(s1.length, s2.length);
    return shortLength / longLength;
  }
  
  // For very short inputs, be more lenient
  if (s1.length <= 3 || s2.length <= 3) {
    // For very short strings (like 'Pet' for 'Petch'), check if it's the start
    if (s2.startsWith(s1) || s1.startsWith(s2)) {
      return 0.9; // Higher confidence for prefix matches on short strings
    }
  }
  
  // Simple Levenshtein distance calculation
  const track = Array(s2.length + 1).fill(null).map(() => 
    Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  // Get the distance
  const distance = track[s2.length][s1.length];
  
  // Convert to similarity score between 0 and 1
  // For strings of different lengths, use the longer one for normalization
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1.0 : 1.0 - distance / maxLength;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userInput } = await req.json();
    const normalizedInput = normalizeText(userInput);
    
    const threshold = 0.7; // Slightly lower threshold to be more permissive
    let bestMatch = null;
    let highestConfidence = 0;

    // First check for direct matches in our nickname database
    for (const [playerName, nicknames] of Object.entries(PLAYER_NICKNAMES)) {
      const normalizedPlayerName = normalizeText(playerName);
      
      // Perfect match with the official name
      if (normalizedPlayerName === normalizedInput) {
        return new Response(
          JSON.stringify({ 
            processedName: playerName,
            confidence: 1.0,
            matchType: "exact_name"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if it matches any of the known nicknames
      const normalizedNicknames = nicknames.map(nick => normalizeText(nick));
      const nicknameMatch = normalizedNicknames.find(nick => nick === normalizedInput);
      if (nicknameMatch) {
        return new Response(
          JSON.stringify({ 
            processedName: playerName,
            confidence: 1.0,
            matchType: "exact_nickname"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // No exact match, try fuzzy matching
      // First with the official name
      const nameConfidence = calculateSimilarity(normalizedPlayerName, normalizedInput);
      if (nameConfidence > highestConfidence) {
        highestConfidence = nameConfidence;
        bestMatch = playerName;
      }
      
      // Then with each nickname
      for (const nickname of normalizedNicknames) {
        const nicknameConfidence = calculateSimilarity(nickname, normalizedInput);
        if (nicknameConfidence > highestConfidence) {
          highestConfidence = nicknameConfidence;
          bestMatch = playerName;
        }
      }
    }
    
    // Check if input is a common shortening of a longer name
    // e.g. "Pet" for "Petković" or "Petch"
    if (!bestMatch && normalizedInput.length <= 3) {
      for (const [playerName, nicknames] of Object.entries(PLAYER_NICKNAMES)) {
        const normalizedPlayerName = normalizeText(playerName);
        
        // If the input is a prefix of the player name
        if (normalizedPlayerName.startsWith(normalizedInput)) {
          const confidence = 0.8; // Set a high confidence for short prefix matches
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = playerName;
          }
        }
        
        // Check nickname prefixes too
        for (const nickname of nicknames) {
          const normalizedNickname = normalizeText(nickname);
          if (normalizedNickname.startsWith(normalizedInput)) {
            const confidence = 0.8;
            if (confidence > highestConfidence) {
              highestConfidence = confidence;
              bestMatch = playerName;
            }
          }
        }
      }
    }
    
    // Return the best fuzzy match if it's above our threshold
    if (bestMatch && highestConfidence >= threshold) {
      return new Response(
        JSON.stringify({ 
          processedName: bestMatch,
          confidence: highestConfidence,
          matchType: "fuzzy_match"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // No good match found
    return new Response(
      JSON.stringify({ 
        processedName: null,
        confidence: highestConfidence,
        matchType: "no_match"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        processedName: null,
        confidence: 0
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
