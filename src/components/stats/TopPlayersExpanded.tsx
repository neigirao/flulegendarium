import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Crown, Gamepad2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RankingEntry {
  player_name: string;
  best_score: number;
  total_games: number;
  avg_score: number;
}

export const TopPlayersExpanded = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-expanded-rankings"],
    queryFn: async () => {
      const [classicRes, jerseyRes] = await Promise.all([
        supabase.from("rankings").select("player_name, score, games_played"),
        supabase.from("jersey_game_rankings").select("player_name, score, total_attempts"),
      ]);

      const aggregate = (rows: { player_name: string; score: number; games?: number }[]) => {
        const map = new Map<string, { scores: number[]; games: number }>();
        rows.forEach((r) => {
          const entry = map.get(r.player_name) || { scores: [], games: 0 };
          entry.scores.push(r.score);
          entry.games += 1;
          map.set(r.player_name, entry);
        });

        return Array.from(map.entries())
          .map(([name, data]) => ({
            player_name: name,
            best_score: Math.max(...data.scores),
            total_games: data.games,
            avg_score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
          }))
          .sort((a, b) => b.best_score - a.best_score)
          .slice(0, 15);
      };

      return {
        classic: aggregate(
          (classicRes.data || []).map((r) => ({ player_name: r.player_name, score: r.score }))
        ),
        jersey: aggregate(
          (jerseyRes.data || []).map((r) => ({ player_name: r.player_name, score: r.score }))
        ),
        dedicated: aggregate(
          (classicRes.data || []).map((r) => ({ player_name: r.player_name, score: r.score }))
        ).sort((a, b) => b.total_games - a.total_games),
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const renderRanking = (entries: RankingEntry[]) => (
    <div className="space-y-1">
      <div className="grid grid-cols-[1.5rem_1fr_4.5rem_3.5rem_4rem] gap-2 text-xs font-semibold text-muted-foreground pb-1 border-b border-secondary/10">
        <span>#</span>
        <span>Jogador</span>
        <span className="text-right">Melhor</span>
        <span className="text-right">Média</span>
        <span className="text-right">Jogos</span>
      </div>
      {isLoading
        ? [...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
          ))
        : entries.map((e, i) => (
            <motion.div
              key={e.player_name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1.5rem_1fr_4.5rem_3.5rem_4rem] gap-2 items-center py-1.5 text-sm"
            >
              <span className="text-muted-foreground font-mono">
                {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
              </span>
              <span className="font-medium text-foreground truncate">{e.player_name}</span>
              <span className="text-right font-bold text-primary">{e.best_score}</span>
              <span className="text-right text-muted-foreground">{e.avg_score}</span>
              <span className="text-right text-muted-foreground">{e.total_games}</span>
            </motion.div>
          ))}
    </div>
  );

  return (
    <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-warning" />
          Hall da Fama Expandido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="classic">
          <TabsList className="mb-4">
            <TabsTrigger value="classic">Quiz Clássico</TabsTrigger>
            <TabsTrigger value="jersey">Quiz Camisas</TabsTrigger>
            <TabsTrigger value="dedicated">Mais Dedicados</TabsTrigger>
          </TabsList>
          <TabsContent value="classic">{renderRanking(data?.classic || [])}</TabsContent>
          <TabsContent value="jersey">{renderRanking(data?.jersey || [])}</TabsContent>
          <TabsContent value="dedicated">{renderRanking(data?.dedicated || [])}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
