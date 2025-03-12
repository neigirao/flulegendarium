
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const name = formData.get('name') as string
    const position = formData.get('position') as string

    if (!image || !name) {
      throw new Error('Imagem e nome são obrigatórios')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload da imagem
    const fileExt = image.name.split('.').pop()
    const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('players')
      .upload(fileName, image)

    if (uploadError) throw uploadError

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('players')
      .getPublicUrl(fileName)

    // Inserir jogador no banco
    const { data: player, error: insertError } = await supabase
      .from('players')
      .insert({
        name,
        position: position || 'Não informada',
        image_url: publicUrl,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Return success without exposing the full URL details in logs
    const sanitizedPlayer = {
      ...player,
      image_url: player.image_url ? `[SECURE_IMAGE_URL]` : null
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        player: sanitizedPlayer 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
