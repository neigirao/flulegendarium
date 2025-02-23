
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import FirecrawlApp from '@mendable/firecrawl-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

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
            Liste 20 jogadores importantes que jogaram no Fluminense desde 1995.
            Para cada jogador, forneça: nome completo, posição, um fato interessante,
            principais conquistas e estatísticas aproximadas (gols e jogos).
            Responda em formato JSON.`
          },
          {
            role: 'user',
            content: 'Liste os jogadores do Fluminense desde 1995.'
          }
        ]
      })
    });

    const playersData = await response.json();
    const players = JSON.parse(playersData.choices[0].message.content);

    // Agora vamos buscar imagens para cada jogador
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });
    const enrichedPlayers = [];

    for (const player of players) {
      const searchQuery = `${player.name} jogador Fluminense`;
      const crawlResponse = await firecrawl.crawlUrl(
        `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`,
        {
          limit: 1,
          scrapeOptions: {
            formats: ['images'],
          }
        }
      );

      if (crawlResponse.success && crawlResponse.data?.images?.length > 0) {
        enrichedPlayers.push({
          ...player,
          image_url: crawlResponse.data.images[0].url
        });
      }
    }

    // Insere os jogadores no banco de dados
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      for (const player of enrichedPlayers) {
        await supabase.from('players').insert([
          {
            name: player.name,
            position: player.position,
            image_url: player.image_url,
            fun_fact: player.funFact,
            year_highlight: player.yearHighlight || '2000',
            achievements: player.achievements,
            statistics: {
              gols: player.statistics.goals || 0,
              jogos: player.statistics.matches || 0
            }
          }
        ]);
      }
    }

    return new Response(
      JSON.stringify({ success: true, players: enrichedPlayers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
