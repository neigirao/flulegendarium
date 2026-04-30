import { useRef, useCallback } from "react";

const STORAGE_KEY = "flu_recent_player_ids";
const MAX_HISTORY = 30;

const loadHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const saveHistory = (ids: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage full or unavailable — silently skip
  }
};

/**
 * Mantém histórico de jogadores vistos recentemente entre sessões.
 *
 * Estratégia: deprioritiza (não bloqueia) jogadores da lista recente.
 * Quando todos os candidatos já estão no histórico, o fallback normal é usado.
 */
export const usePlayerSessionHistory = () => {
  const historyRef = useRef<string[]>(loadHistory());

  const getRecentIds = useCallback((): ReadonlySet<string> => {
    return new Set(historyRef.current);
  }, []);

  const recordPlayer = useCallback((playerId: string) => {
    const history = historyRef.current.filter(id => id !== playerId);
    history.push(playerId);
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    historyRef.current = history;
    saveHistory(history);
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }, []);

  return { getRecentIds, recordPlayer, clearHistory };
};
