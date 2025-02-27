
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAYER_NICKNAMES: Record<string, string[]> = {
  "Germán Cano": ["cano", "el matador"],
  "Fred": ["frederico chaves guedes", "fredgol", "fred jogador"],
  "John Kennedy": ["jk", "kennedy", "john"],
  "Marcelo": ["m12", "filho do flu"],
  "Fábio": ["são fábio", "muralha tricolor"],
  "Felipe Melo": ["pitbull", "fm30"],
  "André": ["andrezinho", "andre flu"],
  "Ganso": ["paulo henrique", "ph", "ph ganso"],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userInput } = await req.json();
    const normalizedInput = userInput.toLowerCase().trim();

    // Procura por correspondências diretas ou apelidos
    for (const [playerName, nicknames] of Object.entries(PLAYER_NICKNAMES)) {
      if (playerName.toLowerCase() === normalizedInput || 
          nicknames.some(nick => nick === normalizedInput)) {
        return new Response(
          JSON.stringify({ 
            processedName: playerName,
            confidence: 1.0 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Não precisamos usar IA para o primeiro MVP
    // Se não encontrou correspondência exata, retorna null
    return new Response(
      JSON.stringify({ 
        processedName: null,
        confidence: 0.0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
