import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Users, Target, Shirt, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
}

export const GlobalStatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["public-global-stats"],
    queryFn: async () => {
      const [rankings, players, jerseys, attempts, correct] = await Promise.all([
        supabase.from("rankings").select("*", { count: "exact", head: true }),
        supabase.from("players").select("*", { count: "exact", head: true }),
        supabase.from("jerseys").select("*", { count: "exact", head: true }),
        supabase.from("game_attempts").select("*", { count: "exact", head: true }),
        supabase.from("game_attempts").select("*", { count: "exact", head: true }).eq("is_correct", true),
      ]);

      // Count unique player names from rankings
      const { data: uniquePlayers } = await supabase
        .from("rankings")
        .select("player_name");
      const uniqueCount = new Set(uniquePlayers?.map((r) => r.player_name)).size;

      return {
        totalGames: rankings.count || 0,
        uniquePlayers: uniqueCount,
        totalAttempts: attempts.count || 0,
        correctAttempts: correct.count || 0,
        totalPlayers: players.count || 0,
        totalJerseys: jerseys.count || 0,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const cards: StatCard[] = [
    {
      label: "Partidas Jogadas",
      value: stats?.totalGames ?? "...",
      icon: Gamepad2,
      description: "Rankings salvos no total",
    },
    {
      label: "Jogadores Únicos",
      value: stats?.uniquePlayers ?? "...",
      icon: Users,
      description: "Tricolores que jogaram",
    },
    {
      label: "Acertos Totais",
      value: stats?.correctAttempts ?? "...",
      icon: Target,
      description: `de ${stats?.totalAttempts ?? "..."} tentativas`,
    },
    {
      label: "Lendas no Acervo",
      value: stats?.totalPlayers ?? "...",
      icon: Trophy,
      description: "Jogadores cadastrados",
    },
    {
      label: "Camisas Históricas",
      value: stats?.totalJerseys ?? "...",
      icon: Shirt,
      description: "No quiz de camisas",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="text-center border-secondary/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6 pb-4">
              <card.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-display font-bold text-primary">
                {isLoading ? (
                  <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded" />
                ) : (
                  card.value
                )}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">{card.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
