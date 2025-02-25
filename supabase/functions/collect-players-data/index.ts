
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    // Primeiro, vamos usar a OpenAI para gerar uma lista de jogadores
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em história do Fluminense Football Club.
            Liste 10 jogadores importantes que jogaram no Fluminense desde 1995.
            Para cada jogador, forneça: nome, posição, um fato interessante e suas principais conquistas.
            Responda em formato JSON array com os campos: name, position, funFact, achievements (array).`
          },
          {
            role: 'user',
            content: 'Liste os jogadores do Fluminense desde 1995.'
          }
        ]
      })
    });

    const data = await response.json();
    const players = JSON.parse(data.choices[0].message.content);

    // Retorna os dados dos jogadores
    return new Response(
      JSON.stringify({ success: true, players }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
