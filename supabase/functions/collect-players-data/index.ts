
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
    console.log("Edge Function iniciada: collect-players-data");
    
    // Verificar chave API do OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error("Erro: OpenAI API key não encontrada");
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key não configurada. Configure nas definições de secrets da Edge Function.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Erro: Credenciais do Supabase não encontradas");
      return new Response(
        JSON.stringify({ 
          error: 'Credenciais do Supabase não configuradas' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("Credenciais verificadas com sucesso");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar se já temos jogadores no banco
    const { data: existingPlayers, error: queryError } = await supabase
      .from('players')
      .select('id')
      .limit(1);
    
    if (queryError) {
      console.error("Erro ao verificar jogadores existentes:", queryError);
      return new Response(
        JSON.stringify({ 
          error: `Erro ao acessar o banco de dados: ${queryError.message}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("Iniciando coleta de dados de jogadores do Fluminense...");

    // Usar a OpenAI para gerar uma lista de jogadores
    let playersData;
    try {
      playersData = await getPlayersData(openAIApiKey);
      console.log(`Obtidos dados de ${playersData.length} jogadores da OpenAI`);
    } catch (error) {
      console.error("Erro ao obter dados dos jogadores:", error);
      return new Response(
        JSON.stringify({ 
          error: `Falha ao obter dados dos jogadores: ${error.message}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Para cada jogador, buscar uma imagem e salvar no banco
    let savedPlayers;
    try {
      savedPlayers = await savePlayersToDatabase(playersData, supabase);
      console.log(`Jogadores salvos com sucesso: ${savedPlayers.length}`);
    } catch (error) {
      console.error("Erro ao salvar jogadores no banco:", error);
      return new Response(
        JSON.stringify({ 
          error: `Falha ao salvar jogadores no banco: ${error.message}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ error: `Erro inesperado: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getPlayersData(apiKey: string) {
  console.log("Chamando OpenAI para obter dados de jogadores...");
  
  try {
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
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta da OpenAI:", response.status, errorText);
      throw new Error(`OpenAI API retornou status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Resposta da OpenAI recebida com sucesso");
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Formato de resposta da OpenAI inesperado:", data);
      throw new Error('Resposta da OpenAI em formato inesperado');
    }

    try {
      // Tenta fazer parse do conteúdo como JSON
      const content = data.choices[0].message.content.trim();
      console.log("Conteúdo recebido da OpenAI:", content.substring(0, 200) + "...");
      
      // Tentativa de extrair apenas o JSON se estiver dentro de um bloco de código
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1].trim();
        console.log("JSON extraído de bloco de código");
      }
      
      const players = JSON.parse(jsonContent);
      console.log(`Parse de JSON bem-sucedido, ${players.length} jogadores encontrados`);
      return players;
    } catch (error) {
      console.error("Erro ao parsear JSON da resposta da OpenAI:", error);
      console.log("Conteúdo completo recebido:", data.choices[0].message.content);
      throw new Error('Erro ao processar dados de jogadores. Formato JSON inválido.');
    }
  } catch (error) {
    console.error("Erro ao chamar a API da OpenAI:", error);
    throw error;
  }
}

async function getPlayerImageUrl(playerName: string) {
  try {
    console.log(`Buscando imagem para ${playerName}...`);
    
    // Buscar imagem do jogador no Pexels (serviço mais confiável que Unsplash para este uso)
    // Fallback para Unsplash e depois para uma imagem genérica
    try {
      // Tentativa com imagem genérica de futebol
      const encodedName = encodeURIComponent(`${playerName} Fluminense jogador futebol`);
      const response = await fetch(`https://source.unsplash.com/featured/?${encodedName}`);
      
      if (response.ok) {
        console.log(`Imagem encontrada para ${playerName} via Unsplash`);
        return response.url;
      }
    } catch (unsplashError) {
      console.warn(`Erro ao buscar no Unsplash para ${playerName}:`, unsplashError);
    }
    
    // Fallback para imagem genérica
    console.warn(`Não foi possível obter imagem específica para ${playerName}. Usando imagem genérica.`);
    return 'https://images.unsplash.com/photo-1624526267942-75d8025fc9fe?q=80&w=1000';
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
      if (!player.name) {
        console.warn("Jogador sem nome detectado, pulando...", player);
        continue;
      }
      
      console.log(`Processando jogador: ${player.name}`);
      
      // Verificar se o jogador já existe no banco
      const { data: existingPlayers, error: queryError } = await supabase
        .from('players')
        .select('*')
        .ilike('name', player.name);
      
      if (queryError) {
        console.error(`Erro ao verificar se jogador ${player.name} existe:`, queryError);
        continue;
      }
      
      if (existingPlayers && existingPlayers.length > 0) {
        console.log(`Jogador ${player.name} já existe no banco.`);
        savedPlayers.push(existingPlayers[0]);
        continue;
      }
      
      // Buscar imagem para o jogador
      const imageUrl = await getPlayerImageUrl(player.name);
      
      // Certificar que temos um objeto de estatísticas válido
      let statistics = { gols: 0, jogos: 0 };
      if (player.statistics) {
        statistics = {
          gols: typeof player.statistics.gols === 'number' ? player.statistics.gols : 0,
          jogos: typeof player.statistics.jogos === 'number' ? player.statistics.jogos : 0
        };
      }
      
      // Certificar que achievements é um array válido
      let achievements = [];
      if (Array.isArray(player.achievements)) {
        achievements = player.achievements;
      } else if (typeof player.achievements === 'string') {
        achievements = [player.achievements];
      }
      
      // Preparar dados para inserção
      const playerData = {
        name: player.name,
        position: player.position || 'Não informada',
        image_url: imageUrl,
        year_highlight: player.year_highlight || '',
        fun_fact: player.fun_fact || '',
        achievements: achievements,
        statistics: statistics
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
      console.error(`Erro ao processar jogador ${player.name || 'sem nome'}:`, error);
    }
  }
  
  return savedPlayers;
}
