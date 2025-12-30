import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar todas as camisas com URLs base64
    const { data: jerseys, error: fetchError } = await supabase
      .from("jerseys")
      .select("id, years, type, image_url")
      .like("image_url", "data:%");

    if (fetchError) {
      throw new Error(`Erro ao buscar camisas: ${fetchError.message}`);
    }

    console.log(`Encontradas ${jerseys?.length || 0} camisas com base64`);

    const results: { id: string; years: number[]; status: string; newUrl?: string; error?: string }[] = [];

    for (const jersey of jerseys || []) {
      try {
        // Extrair dados base64
        const base64Match = jersey.image_url.match(/^data:image\/([\w+]+);base64,(.+)$/);
        
        if (!base64Match) {
          results.push({
            id: jersey.id,
            years: jersey.years,
            status: "skipped",
            error: "Formato base64 inválido"
          });
          continue;
        }

        const imageType = base64Match[1].replace("+", "");
        const base64Data = base64Match[2];
        
        // Converter base64 para Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Nome do arquivo: jersey-{ano}-{tipo}-{id}.{ext}
        const yearStr = jersey.years.join("-");
        const fileName = `jersey-${yearStr}-${jersey.type}-${jersey.id.slice(0, 8)}.${imageType === "jpeg" ? "jpg" : imageType}`;

        // Upload para o bucket 'jerseys'
        const { error: uploadError } = await supabase.storage
          .from("jerseys")
          .upload(fileName, bytes, {
            contentType: `image/${imageType}`,
            upsert: true
          });

        if (uploadError) {
          results.push({
            id: jersey.id,
            years: jersey.years,
            status: "upload_failed",
            error: uploadError.message
          });
          continue;
        }

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from("jerseys")
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // Atualizar registro no banco
        const { error: updateError } = await supabase
          .from("jerseys")
          .update({ image_url: publicUrl })
          .eq("id", jersey.id);

        if (updateError) {
          results.push({
            id: jersey.id,
            years: jersey.years,
            status: "update_failed",
            newUrl: publicUrl,
            error: updateError.message
          });
          continue;
        }

        results.push({
          id: jersey.id,
          years: jersey.years,
          status: "success",
          newUrl: publicUrl
        });

        console.log(`✅ Migrada camisa ${yearStr} (${jersey.type}): ${fileName}`);
      } catch (err) {
        results.push({
          id: jersey.id,
          years: jersey.years,
          status: "error",
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === "success").length,
      failed: results.filter(r => r.status !== "success").length,
      results
    };

    console.log(`Migração concluída: ${summary.success}/${summary.total} sucesso`);

    return new Response(JSON.stringify(summary, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Erro na migração:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
