// Sessão de admin caseira: token emitido pela RPC verify_admin_credentials e
// guardado em localStorage. Edge functions protegidas leem o header
// x-admin-session (ver supabase/functions/_shared/authGuard.ts).
const ADMIN_SESSION_KEY = 'admin_session';

export const getAdminSessionToken = (): string | null => {
  try {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return typeof parsed?.token === 'string' ? parsed.token : null;
  } catch {
    return null;
  }
};

// Headers para supabase.functions.invoke em funções que exigem sessão admin.
export const adminSessionHeaders = (): Record<string, string> => {
  const token = getAdminSessionToken();
  return token ? { 'x-admin-session': token } : {};
};
