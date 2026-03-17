import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, Gamepad2, Target, Users, TrendingDown, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DIFFICULTY_COLORS: Record<string, string> = {
  muito_facil: "hsl(142, 76%, 36%)",
  facil: "hsl(142, 50%, 50%)",
  medio: "hsl(45, 93%, 47%)",
  dificil: "hsl(25, 95%, 53%)",
  muito_dificil: "hsl(0, 84%, 60%)",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  muito_facil: "Muito Fácil",
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
  muito_dificil: "Muito Difícil",
};

const TYPE_LABELS: Record<string, string> = {
  home: "Principal",
  away: "Visitante",
  third: "Terceira",
  special: "Especial",
};

export const JerseyStatsOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-jersey-stats-overview"],
    queryFn: async () => {
      const [jerseysRes, rankingsRes, statsRes, uniquePlayersRes] = await Promise.all([
        supabase.from("jerseys").select("years, type, manufacturer, difficulty_level, total_attempts, correct_attempts, average_guess_time"),
        supabase.from("jersey_game_rankings").select("*", { count: "exact", head: true }),
        supabase.from("jersey_difficulty_stats").select("is_correct", { count: "exact", head: true }),
        supabase.from("jersey_game_rankings").select("player_name"),
      ]);

      const [correctRes] = await Promise.all([
        supabase.from("jersey_difficulty_stats").select("*", { count: "exact", head: true }).eq("is_correct", true),
      ]);

      const jerseys = jerseysRes.data || [];
      const totalStats = statsRes.count || 0;
      const correctStats = correctRes.count || 0;
      const hitRate = totalStats > 0 ? ((correctStats / totalStats) * 100).toFixed(1) : "0";
      const uniquePlayers = new Set((uniquePlayersRes.data || []).map((r) => r.player_name)).size;

      // Difficulty distribution
      const diffCounts: Record<string, number> = {};
      jerseys.forEach((j) => {
        const level = j.difficulty_level || "medio";
        diffCounts[level] = (diffCounts[level] || 0) + 1;
      });
      const diffChart = ["muito_facil", "facil", "medio", "dificil", "muito_dificil"].map((key) => ({
        name: DIFFICULTY_LABELS[key],
        count: diffCounts[key] || 0,
        color: DIFFICULTY_COLORS[key],
      }));

      // Top 10 hardest & easiest
      const withRate = jerseys
        .filter((j) => (j.total_attempts || 0) >= 2)
        .map((j) => ({
          years: (j.years || []).join("/"),
          type: TYPE_LABELS[j.type] || j.type,
          total: j.total_attempts || 0,
          rate: j.total_attempts ? ((j.correct_attempts || 0) / j.total_attempts) * 100 : 0,
          avgTime: j.average_guess_time ? (j.average_guess_time / 1000).toFixed(1) : "—",
        }));

      const sorted = [...withRate].sort((a, b) => a.rate - b.rate);

      return {
        totalJerseys: jerseys.length,
        totalGames: rankingsRes.count || 0,
        hitRate,
        uniquePlayers,
        diffChart,
        hardest: sorted.slice(0, 10),
        easiest: [...sorted].reverse().slice(0, 10),
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-lg" />)}
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  const statCards = [
    { label: "Camisas", value: data?.totalJerseys || 0, icon: Shirt },
    { label: "Partidas", value: data?.totalGames || 0, icon: Gamepad2 },
    { label: "Taxa de Acerto", value: `${data?.hitRate || 0}%`, icon: Target },
    { label: "Jogadores Únicos", value: data?.uniquePlayers || 0, icon: Users },
  ];

  const renderTable = (
    items: typeof data.hardest,
    title: string,
    icon: React.ElementType,
    colorClass: string
  ) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {React.createElement(icon, { className: `h-4 w-4 ${colorClass}` })}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-[1.5rem_1fr_3.5rem_3.5rem_3.5rem] gap-2 text-xs font-semibold text-muted-foreground pb-1 border-b">
            <span>#</span>
            <span>Camisa</span>
            <span className="text-right">Taxa</span>
            <span className="text-right">Tent.</span>
            <span className="text-right">Tempo</span>
          </div>
          {items.map((j, i) => (
            <div key={`${j.years}-${i}`} className="grid grid-cols-[1.5rem_1fr_3.5rem_3.5rem_3.5rem] gap-2 items-center py-1 text-sm">
              <span className="text-muted-foreground font-mono text-xs">{i + 1}</span>
              <span className="font-medium truncate">{j.years} <span className="text-xs text-muted-foreground">({j.type})</span></span>
              <span className={`text-right font-semibold text-xs ${colorClass}`}>{j.rate.toFixed(0)}%</span>
              <span className="text-right text-muted-foreground text-xs">{j.total}</span>
              <span className="text-right text-muted-foreground text-xs">{j.avgTime}s</span>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Dados insuficientes</p>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className="text-center">
            <CardContent className="pt-6 pb-4">
              <c.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribuição de dificuldade */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Distribuição de Dificuldade</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.diffChart} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                formatter={(v: number) => [`${v} camisas`, "Quantidade"]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data?.diffChart.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderTable(data?.hardest || [], "Top 10 Mais Difíceis", TrendingDown, "text-destructive")}
        {renderTable(data?.easiest || [], "Top 10 Mais Fáceis", TrendingUp, "text-success")}
      </div>
    </div>
  );
};
