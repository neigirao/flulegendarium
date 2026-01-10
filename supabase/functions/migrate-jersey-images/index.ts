import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Domínios externos problemáticos
const EXTERNAL_DOMAINS = [
  "mitiendanube.com",
  "fluzao.xyz",
  "tricolordegraca.com.br",
  "footballkitarchive.com",
];

function isExternalUrl(url: string): boolean {
  if (!url || url.startsWith("data:")) return false;
  try {
    const parsed = new URL(url);
    return EXTERNAL_DOMAINS.some(domain => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
}

function isBase64Url(url: string): boolean {
  return url?.startsWith("data:") || false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar todas as camisas
    const { data: allJerseys, error: fetchError } = await supabase
      .from("jerseys")
      .select("id, years, type, image_url");

    if (fetchError) {
      throw new Error(`Erro ao buscar camisas: ${fetchError.message}`);
    }

    // Filtrar camisas com URLs problemáticas (base64 ou externas)
    const jerseys = (allJerseys || []).filter(j => 
      isBase64Url(j.image_url) || isExternalUrl(j.image_url)
    );

    console.log(`Encontradas ${jerseys.length} camisas para migrar (base64 ou externas)`);

    const results: { id: string; years: number[]; status: string; newUrl?: string; error?: string; urlType?: string }[] = [];

    for (const jersey of jerseys) {
      try {
        const yearStr = jersey.years.join("-");
        let imageBytes: Uint8Array;
        let imageType: string;

        if (isBase64Url(jersey.image_url)) {
          // Processar base64
          const base64Match = jersey.image_url.match(/^data:image\/([\w+]+);base64,(.+)$/);
          
          if (!base64Match) {
            results.push({
              id: jersey.id,
              years: jersey.years,
              status: "skipped",
              error: "Formato base64 inválido",
              urlType: "base64"
            });
            continue;
          }

          imageType = base64Match[1].replace("+", "");
          const base64Data = base64Match[2];
          
          const binaryString = atob(base64Data);
          imageBytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            imageBytes[i] = binaryString.charCodeAt(i);
          }
        } else if (isExternalUrl(jersey.image_url)) {
          // Baixar imagem externa
          console.log(`Baixando imagem externa: ${jersey.image_url}`);
          
          const response = await fetch(jersey.image_url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          
          if (!response.ok) {
            results.push({
              id: jersey.id,
              years: jersey.years,
              status: "download_failed",
              error: `HTTP ${response.status}: ${response.statusText}`,
              urlType: "external"
            });
            continue;
          }

          const contentType = response.headers.get("content-type") || "image/jpeg";
          imageType = contentType.split("/")[1]?.split(";")[0] || "jpeg";
          
          const arrayBuffer = await response.arrayBuffer();
          imageBytes = new Uint8Array(arrayBuffer);
        } else {
          continue;
        }

        // Nome do arquivo
        const fileName = `jersey-${yearStr}-${jersey.type}-${jersey.id.slice(0, 8)}.${imageType === "jpeg" ? "jpg" : imageType}`;

        // Upload para o bucket 'jerseys'
        const { error: uploadError } = await supabase.storage
          .from("jerseys")
          .upload(fileName, imageBytes, {
            contentType: `image/${imageType}`,
            upsert: true
          });

        if (uploadError) {
          results.push({
            id: jersey.id,
            years: jersey.years,
            status: "upload_failed",
            error: uploadError.message,
            urlType: isBase64Url(jersey.image_url) ? "base64" : "external"
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
            error: updateError.message,
            urlType: isBase64Url(jersey.image_url) ? "base64" : "external"
          });
          continue;
        }

        results.push({
          id: jersey.id,
          years: jersey.years,
          status: "success",
          newUrl: publicUrl,
          urlType: isBase64Url(jersey.image_url) ? "base64" : "external"
        });

        console.log(`✅ Migrada camisa ${yearStr} (${jersey.type}): ${fileName}`);
      } catch (err) {
        results.push({
          id: jersey.id,
          years: jersey.years,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
          urlType: isBase64Url(jersey.image_url) ? "base64" : "external"
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
