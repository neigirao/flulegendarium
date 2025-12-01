import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationRequest {
  playerId: string;
  playerName: string;
  currentUrl: string;
}

interface MigrationResult {
  playerId: string;
  playerName: string;
  success: boolean;
  newUrl?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { playerId, playerName, currentUrl }: MigrationRequest = await req.json();

    console.log(`🔄 Iniciando migração para ${playerName} (${playerId})`);
    console.log(`   URL atual: ${currentUrl}`);

    // 1. Download da imagem externa
    console.log('📥 Fazendo download da imagem...');
    const imageResponse = await fetch(currentUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Falha ao baixar imagem: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    
    // Detectar extensão da imagem
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : 
                      contentType.includes('webp') ? 'webp' : 'jpg';
    
    console.log(`   Tamanho: ${(imageBuffer.byteLength / 1024).toFixed(2)} KB`);
    console.log(`   Tipo: ${contentType} (ext: ${extension})`);

    // 2. Upload para Supabase Storage
    const fileName = `${playerId}.${extension}`;
    console.log(`📤 Fazendo upload para storage: ${fileName}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('players')
      .upload(fileName, imageBuffer, {
        contentType,
        upsert: true, // Sobrescrever se já existir
      });

    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // 3. Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('players')
      .getPublicUrl(fileName);

    console.log(`   URL pública: ${publicUrl}`);

    // 4. Atualizar tabela players
    console.log('💾 Atualizando banco de dados...');
    const { error: updateError } = await supabase
      .from('players')
      .update({ image_url: publicUrl })
      .eq('id', playerId);

    if (updateError) {
      throw new Error(`Erro ao atualizar banco: ${updateError.message}`);
    }

    console.log(`✅ Migração concluída para ${playerName}`);

    const result: MigrationResult = {
      playerId,
      playerName,
      success: true,
      newUrl: publicUrl,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    
    const errorResult: MigrationResult = {
      playerId: '',
      playerName: '',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };

    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Retorna 200 mesmo com erro para não quebrar o batch
    });
  }
});
