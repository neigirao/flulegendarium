export interface RankingEntry {
  id: string;
  player_name: string;
  score: number;
  user_id: string | null;
}

export function uniqueLeaderboard(entries: RankingEntry[]): RankingEntry[] {
  const seen = new Set<string>();
  return entries.filter(entry => {
    // Historical guest results have no user ID; keep separate names distinct.
    const key = entry.user_id ? `user:${entry.user_id}` : `guest:${entry.player_name.trim().toLocaleLowerCase('pt-BR')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
