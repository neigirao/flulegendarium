function send(name: string, params: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return; // sem gtag (bloqueador/SSR): nada acontece, nunca lança
  try { gtag("event", name, params); } catch { /* telemetria nunca quebra a tela */ }
}

export type AuthProvider = "google" | "apple" | "email";
export type AuthSurface = "native" | "web";
export type AuthErrorCode = "provider_error" | "no_url" | "session_error" | "network" | "unknown";

const PENDING_KEY = "auth_pending";

/* Mapeia o motivo devolvido por entrarNoAplicativo para um código fixo.
   NUNCA envia o texto do erro: pode conter e-mail, URL ou token. */
export function authErrorCode(motivo: string): AuthErrorCode {
  const m = motivo.toLowerCase();
  if (m === "sem_url") return "no_url";
  if (m.includes("network") || m.includes("fetch") || m.includes("timeout")) return "network";
  if (m.includes("session") || m.includes("token") || m.includes("code")) return "session_error";
  if (m === "falha_inesperada") return "unknown";
  return "provider_error";
}

export function authStart(provider: AuthProvider, surface: AuthSurface): void {
  send("auth_start", { provider, surface });
  if (surface === "web") {
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ provider, t: Date.now() })); } catch { /* storage bloqueado */ }
  }
}
export function authSuccess(provider: AuthProvider, surface: AuthSurface): void {
  send("auth_success", { provider, surface });
  clearPending();
}
export function authError(provider: AuthProvider, surface: AuthSurface, code: AuthErrorCode): void {
  send("auth_error", { provider, surface, error_code: code });
  clearPending();
}
export function authAbandon(provider: AuthProvider, surface: AuthSurface, reason: "cancelled" | "returned_without_session"): void {
  send("auth_abandon", { provider, surface, reason });
  clearPending();
}

/* Fluxo web redireciona para fora: o resultado só é conhecido ao voltar.
   Chamar UMA vez na inicialização, com o resultado de getSession(). */
export function authResolvePendingOnLoad(hasSession: boolean): void {
  let raw: string | null = null;
  try { raw = sessionStorage.getItem(PENDING_KEY); } catch { return; }
  if (!raw) return;
  let provider: AuthProvider;
  try {
    const pending = JSON.parse(raw) as { provider?: unknown; t?: unknown };
    if (!['google', 'apple'].includes(String(pending.provider)) || typeof pending.t !== 'number' || Date.now() - pending.t > 30 * 60 * 1000) { clearPending(); return; }
    provider = pending.provider as AuthProvider;
  } catch { clearPending(); return; }
  if (hasSession) authSuccess(provider, "web");
  else authAbandon(provider, "web", "returned_without_session");
}

/* Envolve o login nativo: null = sucesso, "cancelado" = desistiu, outro = erro. */
export async function medirEntradaNativa(
  provider: Exclude<AuthProvider, "email">,
  run: () => Promise<null | string>,
): Promise<null | string> {
  authStart(provider, "native");
  let r: null | string;
  try { r = await run(); } catch { authError(provider, "native", "unknown"); return "falha_inesperada"; }
  if (r === null) authSuccess(provider, "native");
  else if (r === "cancelado") authAbandon(provider, "native", "cancelled");
  else authError(provider, "native", authErrorCode(r));
  return r;
}

function clearPending(): void {
  try { sessionStorage.removeItem(PENDING_KEY); } catch { /* ok */ }
}
