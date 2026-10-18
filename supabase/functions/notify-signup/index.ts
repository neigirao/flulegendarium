/**
 * notify-signup — aviso de novo cadastro por email (Resend).
 *
 * Chamada pelo trigger `on_auth_user_created_notify` em auth.users (pg_net),
 * nao pelo app. O gateway nao valida JWT (verify_jwt = false): a funcao exige
 * o header x-signup-webhook-secret igual ao secret SIGNUP_WEBHOOK_SECRET e
 * responde 401 sem ele. Envia 1 email para o dono (RESEND_NOTIFY_TO) pela API
 * do Resend (remetente onboarding@resend.dev, plano free) e devolve 200.
 * Falhas no Resend retornam 502 e ficam no log da function.
 */

const APP_NAME = "Lendas do Flu";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  const expected = Deno.env.get("SIGNUP_WEBHOOK_SECRET") ?? "";
  const got = req.headers.get("x-signup-webhook-secret") ?? "";
  if (!expected || got !== expected) return json({ error: "Nao autorizado" }, 401);

  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const notifyTo = Deno.env.get("RESEND_NOTIFY_TO") ?? "";
  if (!apiKey || !notifyTo) return json({ error: "Secrets ausentes" }, 500);

  let payload: { email?: string; id?: string; created_at?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "JSON invalido" }, 400);
  }
  const email = (payload.email ?? "").slice(0, 254);
  if (!email) return json({ error: "Sem email" }, 400);

  const when = payload.created_at ?? new Date().toISOString();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: [notifyTo],
      subject: `[${APP_NAME}] Novo cadastro: ${email}`,
      text: `Novo usuario no ${APP_NAME}.\n\nEmail: ${email}\nID: ${payload.id ?? "?"}\nQuando: ${when}\n`,
    }),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    console.error("Resend falhou", res.status, detail);
    return json({ error: "Resend falhou", status: res.status }, 502);
  }
  return json({ ok: true });
});
