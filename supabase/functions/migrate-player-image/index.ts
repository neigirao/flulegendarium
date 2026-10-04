import { hasValidAdminSession, unauthorizedResponse } from '../_shared/authGuard.ts';
import { downloadImage } from './safe-image.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-session',
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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Método não permitido' }), { status: 405, headers: { ...corsHeaders, Allow: 'POST, OPTIONS', 'Content-Type': 'application/json' } });
  }

  try {
    if (!(await hasValidAdminSession(req))) return unauthorizedResponse(corsHeaders);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { playerId, playerName, currentUrl }: MigrationRequest = await req.json();

    if (typeof playerId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(playerId)) {
      throw new Error('Jogador inválido');
    }
    const { data: player, error: playerError } = await supabase.from('players').select('id').eq('id', playerId).maybeSingle();
    if (playerError || !player) throw new Error('Jogador não encontrado');

    console.log(`🔄 Iniciando migração para ${playerName} (${playerId})`);
    console.log(`   URL atual: ${currentUrl}`);

    // 1. Download da imagem externa
    console.log('📥 Fazendo download da imagem...');
    const { bytes: imageBuffer, contentType, extension } = await downloadImage(currentUrl);

    console.log(`   Tamanho: ${(imageBuffer.byteLength / 1024).toFixed(2)} KB`);
    console.log(`   Tipo: ${contentType} (ext: ${extension})`);

    // 2. Upload para Supabase Storage
    const fileName = `${playerId}.${extension}`;
    console.log(`📤 Fazendo upload para storage: ${fileName}`);
    
    const { error: uploadError } = await supabase.storage
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
