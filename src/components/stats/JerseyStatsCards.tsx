import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, Gamepad2, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export const JerseyStatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["public-jersey-stats-cards"],
    queryFn: async () => {
      const [jerseysRes, rankingsRes, statsCorrect, statsTotal, topScore] = await Promise.all([
        supabase.from("jerseys").select("*", { count: "exact", head: true }),
        supabase.from("jersey_game_rankings").select("*", { count: "exact", head: true }),
        supabase.from("jersey_difficulty_stats").select("*", { count: "exact", head: true }).eq("is_correct", true),
        supabase.from("jersey_difficulty_stats").select("*", { count: "exact", head: true }),
        supabase.from("jersey_game_rankings").select("score").order("score", { ascending: false }).limit(1),
      ]);

      const total = statsTotal.count || 0;
      const correct = statsCorrect.count || 0;
      const rate = total > 0 ? ((correct / total) * 100).toFixed(1) : "0";

      return {
        totalJerseys: jerseysRes.count || 0,
        totalGames: rankingsRes.count || 0,
        hitRate: rate,
        topScore: topScore.data?.[0]?.score || 0,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const cards = [
    { label: "Camisas no Acervo", value: stats?.totalJerseys ?? "...", icon: Shirt, desc: "Camisas históricas cadastradas" },
    { label: "Partidas Jogadas", value: stats?.totalGames ?? "...", icon: Gamepad2, desc: "Rankings salvos do quiz" },
    { label: "Taxa de Acerto", value: stats ? `${stats.hitRate}%` : "...", icon: Target, desc: "Acertos globais" },
    { label: "Maior Pontuação", value: stats ? `${stats.topScore}` : "...", icon: Trophy, desc: "Recorde histórico" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="text-center border-secondary/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6 pb-4">
              <card.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-display font-bold text-primary">
                {isLoading ? <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded" /> : card.value}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">{card.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
