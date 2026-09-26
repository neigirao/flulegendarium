import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// Sessão de admin caseira (migration feat/admin-sessao-token): o painel manda o
// token UUID no header x-admin-session; validamos contra admin_sessions.
export async function hasValidAdminSession(req: Request): Promise<boolean> {
  const token = req.headers.get('x-admin-session');
  if (!token) return false;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase
    .from('admin_sessions')
    .select('token')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error('Erro ao validar sessão admin:', error.message);
    return false;
  }
  return !!data;
}

// Chamadas internas (pg_cron): segredo compartilhado no header x-internal-secret.
// O valor mora nos secrets do projeto (INTERNAL_FUNCTION_SECRET) e no comando do
// cron job - nunca no cliente.
export function hasInternalSecret(req: Request): boolean {
  const expected = Deno.env.get('INTERNAL_FUNCTION_SECRET');
  if (!expected) return false;
  return req.headers.get('x-internal-secret') === expected;
}

export function unauthorizedResponse(corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: 'Não autorizado' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
