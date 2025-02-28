
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Iniciando coleta de dados de jogadores do Fluminense...");

    // 1. Usar a OpenAI para gerar uma lista de jogadores
    const playersData = await getPlayersData(openAIApiKey);
    
    // 2. Para cada jogador, buscar uma imagem e salvar no banco
    const savedPlayers = await savePlayersToDatabase(playersData, supabase);

    console.log(`Jogadores salvos com sucesso: ${savedPlayers.length}`);

    // Retorna os dados dos jogadores
    return new Response(
      JSON.stringify({ success: true, players: savedPlayers }),
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

async function getPlayersData(apiKey: string) {
  console.log("Chamando OpenAI para obter dados de jogadores...");
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em história do Fluminense Football Club.
          Liste 15 jogadores importantes que jogaram no Fluminense desde 1995.
          Para cada jogador, forneça:
          - nome completo
          - apelido (se tiver)
          - posição principal
          - ano de destaque no clube
          - um fato interessante
          - suas principais conquistas no clube (array)
          - estatísticas aproximadas (gols e jogos, se for atacante ou meio-campista)
          
          Alguns exemplos de jogadores importantes:
          - Conca
          - Fred
          - Thiago Silva
          - Cano
          - Washington
          - Deco
          - Romário
          - Marcelo
          
          Responda em formato JSON array com os campos: 
          name, position, year_highlight, fun_fact, achievements (array),
          statistics (objeto com gols e jogos)`
        },
        {
          role: 'user',
          content: 'Liste jogadores importantes do Fluminense desde 1995 com todos os detalhes solicitados.'
        }
      ]
    })
  });

  const data = await response.json();
  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('Resposta inesperada da OpenAI');
  }

  try {
    // Tenta fazer parse do conteúdo como JSON
    const players = JSON.parse(data.choices[0].message.content);
    return players;
  } catch (error) {
    console.error("Erro ao parsear JSON da resposta da OpenAI:", error);
    console.log("Conteúdo recebido:", data.choices[0].message.content);
    throw new Error('Erro ao processar dados de jogadores');
  }
}

async function getPlayerImageUrl(playerName: string) {
  try {
    console.log(`Buscando imagem para ${playerName}...`);
    
    // Buscar imagem do jogador no Unsplash
    const encodedName = encodeURIComponent(`${playerName} Fluminense jogador`);
    const response = await fetch(`https://source.unsplash.com/featured/?${encodedName}`);
    
    if (!response.ok) {
      console.warn(`Não foi possível obter imagem para ${playerName}. Usando imagem genérica.`);
      return 'https://images.unsplash.com/photo-1624526267942-75d8025fc9fe?q=80&w=1000';
    }
    
    // Retorna a URL da imagem
    return response.url;
  } catch (error) {
    console.error(`Erro ao buscar imagem para ${playerName}:`, error);
    // Retorna uma imagem genérica de futebol em caso de erro
    return 'https://images.unsplash.com/photo-1624526267942-75d8025fc9fe?q=80&w=1000';
  }
}

async function savePlayersToDatabase(players, supabase) {
  console.log(`Salvando ${players.length} jogadores no banco de dados...`);
  
  const savedPlayers = [];
  
  for (const player of players) {
    try {
      // Verificar se o jogador já existe no banco
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('name', player.name);
      
      if (existingPlayers && existingPlayers.length > 0) {
        console.log(`Jogador ${player.name} já existe no banco.`);
        savedPlayers.push(existingPlayers[0]);
        continue;
      }
      
      // Buscar imagem para o jogador
      const imageUrl = await getPlayerImageUrl(player.name);
      
      // Preparar dados para inserção
      const playerData = {
        name: player.name,
        position: player.position || 'Não informada',
        image_url: imageUrl,
        year_highlight: player.year_highlight || '',
        fun_fact: player.fun_fact || '',
        achievements: player.achievements || [],
        statistics: player.statistics || { gols: 0, jogos: 0 }
      };
      
      // Inserir jogador no banco
      const { data, error } = await supabase
        .from('players')
        .insert(playerData)
        .select();
      
      if (error) {
        console.error(`Erro ao salvar jogador ${player.name}:`, error);
        continue;
      }
      
      console.log(`Jogador ${player.name} salvo com sucesso!`);
      savedPlayers.push(data[0]);
    } catch (error) {
      console.error(`Erro ao processar jogador ${player.name}:`, error);
    }
  }
  
  return savedPlayers;
}
