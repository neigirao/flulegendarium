import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Sparkles, Target, Trophy, Zap, Flame, Moon } from "lucide-react";

interface Curiosity {
  icon: React.ElementType;
  title: string;
  value: string;
  detail: string;
}

export const Curiosidades = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-curiosidades-v2"],
    queryFn: async () => {
      const [attemptsRes, rankingsRes, playersRes, sessionsRes, startsRes] = await Promise.all([
        supabase.from("game_attempts").select("target_player_name, is_correct"),
        supabase.from("rankings").select("player_name, score").order("score", { ascending: false }).limit(1),
        supabase.from("players").select("name, total_attempts, correct_attempts").gt("total_attempts", 0),
        supabase.from("game_sessions").select("max_streak").order("max_streak", { ascending: false }).limit(1),
        supabase.from("game_starts").select("started_at"),
      ]);

      const attempts = attemptsRes.data || [];
      const topRanking = rankingsRes.data?.[0];
      const maxStreak = sessionsRes.data?.[0]?.max_streak || 0;

      // Most guessed player
      const playerCounts = new Map<string, number>();
      attempts.forEach((a) => {
        playerCounts.set(a.target_player_name, (playerCounts.get(a.target_player_name) || 0) + 1);
      });
      let mostGuessed = { name: "—", count: 0 };
      playerCounts.forEach((count, name) => {
        if (count > mostGuessed.count) mostGuessed = { name, count };
      });

      // Perfect players (100% success rate with 3+ attempts)
      const perfectPlayers = (playersRes.data || [])
        .filter((p) => p.total_attempts && p.total_attempts >= 3 && p.correct_attempts === p.total_attempts)
        .map((p) => p.name);

      // Global success rate
      const correctCount = attempts.filter((a) => a.is_correct).length;
      const globalRate = attempts.length > 0 ? ((correctCount / attempts.length) * 100).toFixed(1) : "0";

      // Peak hour (BRT)
      const hourCounts: Record<number, number> = {};
      (startsRes.data || []).forEach((s) => {
        const brtHour = (new Date(s.started_at).getUTCHours() - 3 + 24) % 24;
        hourCounts[brtHour] = (hourCounts[brtHour] || 0) + 1;
      });
      const peakHour = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
      const peakHourLabel = peakHour ? `${peakHour[0]}h` : "—";

      return {
        mostGuessed,
        perfectPlayers,
        topScore: topRanking ? { name: topRanking.player_name, score: topRanking.score } : null,
        globalRate,
        maxStreak,
        peakHourLabel,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const curiosities: Curiosity[] = [
    {
      icon: Target,
      title: "Lenda Mais Adivinhada",
      value: data?.mostGuessed.name || "...",
      detail: `${data?.mostGuessed.count || 0} tentativas no total`,
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
      icon: Sparkles,
      title: "100% de Acerto",
      value: data?.perfectPlayers?.length ? data.perfectPlayers.slice(0, 3).join(", ") : "Nenhum ainda",
      detail: data?.perfectPlayers?.length
        ? `${data.perfectPlayers.length} jogadores com taxa perfeita`
        : "Mínimo 3 tentativas",
    },
    {
      icon: Zap,
      title: "Taxa Global de Acerto",
      value: `${data?.globalRate || "0"}%`,
      detail: "De todas as tentativas já feitas",
    },
    {
      icon: Moon,
      title: "Horário Nobre",
      value: data?.peakHourLabel || "...",
      detail: "Hora com mais partidas (BRT)",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {curiosities.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.08 }}
        >
          <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm h-full">
            <CardContent className="pt-5 pb-4">
              <c.icon className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.title}</p>
              <p className="text-base font-bold text-foreground mt-1 line-clamp-2">
                {isLoading ? (
                  <span className="inline-block w-24 h-5 bg-muted animate-pulse rounded" />
                ) : (
                  c.value
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{c.detail}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
