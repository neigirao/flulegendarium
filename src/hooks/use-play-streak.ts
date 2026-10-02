import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PlayStreak {
  streak: number;
  bestStreak: number;
  isLoading: boolean;
  recordCompletedGame: () => Promise<void>;
}

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const yesterday = () => {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
};

export const usePlayStreak = (): PlayStreak => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStreak(0);
      setBestStreak(0);
      setIsLoading(false);
      return;
    }

    const updateStreak = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("play_streak, last_play_date, best_play_streak")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setIsLoading(false);
        return;
      }

      const { play_streak, last_play_date, best_play_streak } = data as {
        play_streak: number;
        last_play_date: string | null;
        best_play_streak: number;
      };

      const todayStr = today();

      // Already updated today — just reflect current values
      if (last_play_date === todayStr) {
        setStreak(play_streak);
        setBestStreak(best_play_streak);
        setIsLoading(false);
        return;
      }

      // Opening the menu is not playing. Only completed games advance the streak.
      setStreak(last_play_date === yesterday() ? play_streak : 0);
      setBestStreak(best_play_streak);
      setIsLoading(false);
    };

    updateStreak();
  }, [user]);

  const recordCompletedGame = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from("profiles")
      .select("play_streak, last_play_date, best_play_streak").eq("id", user.id).single();
    if (error || !data) return;
    const profile = data as { play_streak: number; last_play_date: string | null; best_play_streak: number };
    if (profile.last_play_date === today()) return;
    const value = profile.last_play_date === yesterday() ? (profile.play_streak || 0) + 1 : 1;
    const best = Math.max(profile.best_play_streak || 0, value);
    const { error: writeError } = await supabase.from("profiles")
      .update({ play_streak: value, last_play_date: today(), best_play_streak: best }).eq("id", user.id);
    if (!writeError) { setStreak(value); setBestStreak(best); }
  }, [user]);

  return { streak, bestStreak, isLoading, recordCompletedGame };
};
