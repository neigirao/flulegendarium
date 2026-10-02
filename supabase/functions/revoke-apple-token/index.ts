// Revoga na Apple o acesso do app à conta de quem está excluindo a conta
// (App Store 5.1.1). O Supabase não guarda o token da Apple, então o app o envia
// no momento da exclusão, depois de uma nova autenticação com a Apple.
//
// Secrets desta função (Supabase > Edge Functions > Secrets):
//   APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_SERVICES_ID, APPLE_P8 (texto PEM da chave .p8)
// verify_jwt fica ligado (padrão): só usuário logado chama.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function clientSecret(): Promise<string> {
  const teamId = Deno.env.get("APPLE_TEAM_ID");
  const keyId = Deno.env.get("APPLE_KEY_ID");
  const servicesId = Deno.env.get("APPLE_SERVICES_ID");
  const p8 = Deno.env.get("APPLE_P8");
  if (!teamId || !keyId || !servicesId || !p8) throw new Error("secrets da Apple ausentes");
  const chave = await importPKCS8(p8.replace(/\\n/g, "\n"), "ES256");
  return await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setSubject(servicesId)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(chave);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "método inválido" }, 405);

  try {
    // Confirma o usuário pelo JWT enviado (não confia só no verify_jwt).
    const authorization = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authorization } } },
    );
    const { data: u, error: eu } = await supabase.auth.getUser();
    if (eu || !u.user) return json({ ok: false, error: "não autorizado" }, 401);

    const { token, token_type_hint } = await req.json();
    if (typeof token !== "string" || token.length < 10) return json({ ok: false, error: "token inválido" }, 400);
    const hint = token_type_hint === "access_token" ? "access_token" : "refresh_token";

    const corpo = new URLSearchParams({
      client_id: Deno.env.get("APPLE_SERVICES_ID") ?? "",
      client_secret: await clientSecret(),
      token,
      token_type_hint: hint,
    });
    const r = await fetch("https://appleid.apple.com/auth/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: corpo,
    });
    if (!r.ok) {
      // Não registra o token nem o corpo inteiro.
      console.error("Apple revoke falhou:", r.status);
      return json({ ok: false, error: "a Apple recusou a revogação" }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    console.error("revoke-apple-token:", e instanceof Error ? e.message : "erro");
    return json({ ok: false, error: "erro interno" }, 500);
  }
});
