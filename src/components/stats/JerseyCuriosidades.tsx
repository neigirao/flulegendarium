import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Shirt, Trophy, Flame, Factory, Target } from "lucide-react";

interface Curiosity {
  icon: React.ElementType;
  title: string;
  value: string;
  detail: string;
}

export const JerseyCuriosidades = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-jersey-curiosidades"],
    queryFn: async () => {
      const [jerseysRes, rankingsRes, streakRes] = await Promise.all([
        supabase.from("jerseys").select("years, type, manufacturer, total_attempts, correct_attempts").gt("total_attempts", 0),
        supabase.from("jersey_game_rankings").select("player_name, score, max_streak").order("score", { ascending: false }).limit(1),
        supabase.from("jersey_game_rankings").select("max_streak").order("max_streak", { ascending: false }).limit(1),
      ]);

      const jerseys = jerseysRes.data || [];
      const topRanking = rankingsRes.data?.[0];
      const maxStreak = streakRes.data?.[0]?.max_streak || 0;

      // Most attempted jersey
      const mostAttempted = [...jerseys].sort((a, b) => (b.total_attempts || 0) - (a.total_attempts || 0))[0];

      // Hardest jersey (lowest success rate, min 3 attempts)
      const withRate = jerseys
        .filter((j) => (j.total_attempts || 0) >= 3)
        .map((j) => ({
          ...j,
          rate: ((j.correct_attempts || 0) / (j.total_attempts || 1)) * 100,
        }));
      const hardest = [...withRate].sort((a, b) => a.rate - b.rate)[0];

      // Most common manufacturer
      const mfgCounts: Record<string, number> = {};
      jerseys.forEach((j) => {
        if (j.manufacturer) mfgCounts[j.manufacturer] = (mfgCounts[j.manufacturer] || 0) + 1;
      });
      // Use all jerseys for manufacturer count
      const { data: allJerseys } = await supabase.from("jerseys").select("manufacturer");
      (allJerseys || []).forEach((j) => {
        if (j.manufacturer) mfgCounts[j.manufacturer] = (mfgCounts[j.manufacturer] || 0);
      });
      // Recount from all
      const mfgAll: Record<string, number> = {};
      (allJerseys || []).forEach((j) => {
        if (j.manufacturer) mfgAll[j.manufacturer] = (mfgAll[j.manufacturer] || 0) + 1;
      });
      const topMfg = Object.entries(mfgAll).sort((a, b) => b[1] - a[1])[0];

      return {
        mostAttempted: mostAttempted ? { years: (mostAttempted.years || []).join("/"), attempts: mostAttempted.total_attempts } : null,
        hardest: hardest ? { years: (hardest.years || []).join("/"), rate: hardest.rate.toFixed(0) } : null,
        topScore: topRanking ? { name: topRanking.player_name, score: topRanking.score } : null,
        maxStreak,
        topManufacturer: topMfg ? { name: topMfg[0], count: topMfg[1] } : null,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const curiosities: Curiosity[] = [
    {
      icon: Shirt,
      title: "Camisa Mais Jogada",
      value: data?.mostAttempted?.years || "...",
      detail: `${data?.mostAttempted?.attempts || 0} tentativas`,
    },
    {
      icon: Target,
      title: "Camisa Mais Difícil",
      value: data?.hardest ? `${data.hardest.years}` : "...",
      detail: data?.hardest ? `Apenas ${data.hardest.rate}% de acerto` : "Min. 3 tentativas",
    },
    {
      icon: Trophy,
      title: "Maior Pontuação",
      value: data?.topScore ? `${data.topScore.score} pts` : "...",
      detail: data?.topScore?.name || "—",
    },
    {
      icon: Flame,
      title: "Recorde de Sequência",
      value: data?.maxStreak ? `${data.maxStreak} acertos` : "...",
      detail: "Consecutivos sem errar",
    },
    {
      icon: Factory,
      title: "Fabricante Mais Presente",
      value: data?.topManufacturer?.name || "...",
      detail: data?.topManufacturer ? `${data.topManufacturer.count} camisas no acervo` : "—",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {curiosities.map((c, i) => (
        <motion.div key={c.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }}>
          <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm h-full">
            <CardContent className="pt-5 pb-4">
              <c.icon className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.title}</p>
              <p className="text-base font-bold text-foreground mt-1 line-clamp-2">
                {isLoading ? <span className="inline-block w-24 h-5 bg-muted animate-pulse rounded" /> : c.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{c.detail}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
