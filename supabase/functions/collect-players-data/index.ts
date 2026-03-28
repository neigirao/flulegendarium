
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
          error: `Falha ao obter dados dos jogadores: ${error instanceof Error ? error.message : 'Unknown error'}` 
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
          error: `Falha ao salvar jogadores no banco: ${error instanceof Error ? error.message : 'Unknown error'}` 
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
      JSON.stringify({ error: `Erro inesperado: ${error instanceof Error ? error.message : 'Unknown error'}` }),
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

// Mapa de jogadores para imagens fixas mais confiáveis
const playerImagesMap: Record<string, string> = {
  "Germán Cano": "https://tntsports.com.br/__export/1670800795599/sites/esporteinterativo/img/2022/12/11/gettyimages-1447173498_crop1670800794814.jpg",
  "Fred": "https://s2.glbimg.com/9Lbh2qz19LDtffAJQQwP8OYx3II=/0x0:2000x1333/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2022/d/U/aqeGG8S0yAlBPYa4nK3g/agif22071013182553.jpg",
  "Felipe Melo": "https://www.ofutebolero.com.br/__export/1671836222411/sites/elfutbolero/img/2022/12/23/whatsapp_image_2022-12-23_at_18_22_44_crop1671836221785.jpeg",
  "Thiago Silva": "https://assets.goal.com/v3/assets/bltcc7a7ffd2fbf71f5/blt38eff59ed13fff34/60dac1480401cb0ebfa64d18/8aa23e84f5bbad02d6d5dcc9144ae9d8e8c4574e.jpg",
  "Marcelo": "https://pbs.twimg.com/media/Fyvk3Q2XoAIIrij.jpg",
  "Conca": "https://sportbuzz.uol.com.br/media/_versions/conca-fluminense-getty_widelg.jpg",
  "Cássio": "https://s2.glbimg.com/YmukB9uaicUWlZOGfr7n1n1w_m4=/0x0:1023x766/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2022/U/U/oCETsrRHWtEbEURByJnw/cassio-no-treino-do-fluminense.png",
  "Washington": "https://s2.glbimg.com/z-eBTaxaERxU_tWwXfYSVlwcibU=/0x0:649x433/984x0/smart/filters:strip_icc()/s.glbimg.com/es/ge/f/original/2011/05/22/washington_349.jpg",
  "Deco": "https://pbs.twimg.com/media/Fn5QoQGXgAEs8XV.jpg",
  "Romário": "https://sportbuzz.uol.com.br/media/_versions/gettyimages-1151058_widelg.jpg",
  "Cuca": "https://s2.glbimg.com/DQfQeoIHH_5QRN9lNi_fKTwpbWI=/0x0:900x630/984x0/smart/filters:strip_icc()/s.glbimg.com/es/ge/f/original/2016/11/13/20161113145842.jpg",
  "Ganso": "https://www.estadao.com.br/resizer/1WdpAwkDH08BnCXP-FMkBmIEHe8=/arc-anglerfish-arc2-prod-estadao/public/4L7AWZVKHRAJJCUXNPPX4HL35A.jpg",
  "Marcão": "https://pbs.twimg.com/media/E6MkNJPXoAQFIEL.jpg",
  "Abel Braga": "https://www.estadao.com.br/resizer/j5WoPm9j4XtWddfRvXLkkj1gtvI=/arc-anglerfish-arc2-prod-estadao/public/X2OCDG3S4JE7NLBRBVKZMZNYUU.jpg",
  "Fábio": "https://tntsports.com.br/__export/1694550747175/sites/esporteinterativo/img/2023/09/12/fabio-flu.jpg_1216690859.jpg",
  "Nino": "https://s2.glbimg.com/fy5zdRuvzwJuIcAo8v8E0cptPYk=/0x0:2048x1365/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2023/w/E/Ae5qy7QS2EGXzFIY5RQQ/img-2915.jpg",
  "Arias": "https://www.ofutebolero.com.br/__export/1675798714386/sites/elfutbolero/img/2023/02/07/jhon_arias_copy_crop1675798713637.jpg",
  "David Braz": "https://diariodonordeste.verdesmares.com.br/image/contentid/policy:1.3128826:1631912095/David-Braz.jpg",
  "Felipe Mello": "https://www.ofutebolero.com.br/__export/1671836222411/sites/elfutbolero/img/2022/12/23/whatsapp_image_2022-12-23_at_18_22_44_crop1671836221785.jpeg",
  "Thiago Neves": "https://pbs.twimg.com/media/DlA4VYQXoAAILhw.jpg",
  "Roger Machado": "https://images.futebolinterior.com.br/2018/05/5b0862ef97e4f.jpeg"
};

// Imagens de fallback para caso nenhuma correspondência seja encontrada
const fallbackImages = [
  "https://uploads.metropoles.com/wp-content/uploads/2023/10/31123243/Fluminense-campeao-Libertadores-2023-12.jpg",
  "https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/10/GettyImages-1740123177.jpg?w=876&h=484&crop=1",
  "https://ogimg.infoglobo.com.br/in/25822664-7b0-e5a/FT1086A/x93269560_Rio-de-Janeiro-RJ-27-11-2022-Campeonato-Brasileiro-A-2022-Fluminense-x-Goias-no-Maraca.jpg.pagespeed.ic.TgLJn9NYR5.jpg",
  "https://diariodorio.com/wp-content/uploads/2022/12/Fluminense-2023-1270x720.webp",
  "https://conteudo.cbf.com.br/cdn/imagens/original/2022/02/19/62110c0f6fc6e.jpeg",
  "https://www.ofutebolero.com.br/__export/1690243968826/sites/elfutbolero/img/2023/07/24/fluminense-campeon-copa-brasil-2007.jpg"
];

async function getPlayerImageUrl(playerName: string) {
  try {
    console.log(`Buscando imagem para ${playerName}...`);
    
    // Verificar se temos uma imagem específica para este jogador
    if (playerImagesMap[playerName]) {
      console.log(`Usando imagem pré-configurada para ${playerName}`);
      return playerImagesMap[playerName];
    }
    
    // Verificar se temos um match parcial
    for (const [key, url] of Object.entries(playerImagesMap)) {
      if (playerName.includes(key) || key.includes(playerName)) {
        console.log(`Usando imagem com match parcial: ${key} para ${playerName}`);
        return url;
      }
    }
    
    // Se não encontrarmos uma correspondência, usar uma imagem aleatória de fallback
    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
    console.log(`Nenhuma imagem específica encontrada para ${playerName}. Usando fallback #${randomIndex}`);
    return fallbackImages[randomIndex];
  } catch (error) {
    console.error(`Erro ao buscar imagem para ${playerName}:`, error);
    // Uso de imagem genérica de fallback em caso de erro
    return "https://uploads.metropoles.com/wp-content/uploads/2023/10/31123243/Fluminense-campeao-Libertadores-2023-12.jpg";
  }
}

async function savePlayersToDatabase(players: Array<Record<string, unknown>>, supabase: ReturnType<typeof createClient>) {
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
