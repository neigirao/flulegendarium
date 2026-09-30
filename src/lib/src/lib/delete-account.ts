import { supabase } from '@/integrations/supabase/client';

/** The RPC is atomic. Never clear the session or local data if it fails. */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error('Não foi possível apagar sua conta. Seus dados foram mantidos. Tente novamente.');
  // Local sign-out works even after auth.users and its sessions have been deleted.
  await supabase.auth.signOut({ scope: 'local' });
  try {
    localStorage.removeItem('game-store');
    sessionStorage.removeItem('last_game_result');
  } catch { /* Restricted browser storage must not hide a successful deletion. */ }
}
