import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PlayStreak {
  streak: number;
  bestStreak: number;
  isLoading: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const usePlayStreak = (): PlayStreak => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
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

      // Continuing streak from yesterday, or starting fresh
      const newStreak = last_play_date === yesterday() ? play_streak + 1 : 1;
      const newBest = Math.max(best_play_streak, newStreak);

      await supabase
        .from("profiles")
        .update({ play_streak: newStreak, last_play_date: todayStr, best_play_streak: newBest })
        .eq("id", user.id);

      setStreak(newStreak);
      setBestStreak(newBest);
      setIsLoading(false);
    };

    updateStreak();
  }, [user]);

  return { streak, bestStreak, isLoading };
};
