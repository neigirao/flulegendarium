
// List of forbidden words and team names
const FORBIDDEN_WORDS = [
  // Profanity
  "palavrão", "porra", "caralho", "merda", "fuder", "foder",
  
  // Rio teams (except Fluminense)
  "flamengo", "fla", "mengo", "mengão", "urubu",
  "vasco", "vascão", "cruzmaltino", "gigante da colina",
  "botafogo", "fogão", "glorioso", "estrela solitária"
];

export const containsForbiddenWord = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase().trim();
  
  return FORBIDDEN_WORDS.some(word => 
    normalizedText.includes(word) || 
    normalizedText === word
  );
};

export const isValidPlayerName = (name: string): boolean => {
  return !containsForbiddenWord(name) && name.trim().length >= 2;
};
