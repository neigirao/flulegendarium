import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Zap, Flame, Clock } from "lucide-react";

const MODE_COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"];

const PERIOD_LABELS: Record<string, string> = {
  madrugada: "🌙 Madrugada",
  manha: "☀️ Manhã",
  tarde: "🌤️ Tarde",
  noite: "🌜 Noite",
};

export const PlayerBehaviorStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-player-behavior"],
    queryFn: async () => {
      const [startsRes, sessionsRes] = await Promise.all([
        supabase.from("game_starts").select("game_mode, started_at"),
        supabase.from("game_sessions").select("total_correct, max_streak"),
      ]);

      const starts = startsRes.data || [];
      const sessions = sessionsRes.data || [];

      // Game mode distribution
      const modeCounts: Record<string, number> = {};
      starts.forEach((s) => {
        const mode = s.game_mode || "classic";
        modeCounts[mode] = (modeCounts[mode] || 0) + 1;
      });
      const total = starts.length || 1;
      const modeData = [
        { name: "Adaptativo", value: modeCounts["adaptive"] || 0, pct: Math.round(((modeCounts["adaptive"] || 0) / total) * 100) },
        { name: "Clássico", value: (modeCounts["classic"] || 0) + (modeCounts["decade"] || 0), pct: Math.round((((modeCounts["classic"] || 0) + (modeCounts["decade"] || 0)) / total) * 100) },
      ];

      // Peak hours grouped by period
      const periods: Record<string, number> = { madrugada: 0, manha: 0, tarde: 0, noite: 0 };
      starts.forEach((s) => {
        const hour = new Date(s.started_at).getUTCHours();
        // Convert UTC to BRT (-3)
        const brtHour = (hour - 3 + 24) % 24;
        if (brtHour >= 0 && brtHour < 6) periods.madrugada++;
        else if (brtHour >= 6 && brtHour < 12) periods.manha++;
        else if (brtHour >= 12 && brtHour < 18) periods.tarde++;
        else periods.noite++;
      });
      const peakPeriod = Object.entries(periods).sort((a, b) => b[1] - a[1])[0];
      const periodData = Object.entries(PERIOD_LABELS).map(([key, label]) => ({
        name: label,
        count: periods[key],
      }));

      // Session stats
      const avgCorrect = sessions.length > 0
        ? (sessions.reduce((sum, s) => sum + s.total_correct, 0) / sessions.length).toFixed(1)
        : "0";
      const maxStreak = sessions.length > 0
        ? Math.max(...sessions.map((s) => s.max_streak))
        : 0;

      return { modeData, periodData, peakPeriod: peakPeriod?.[0] || "noite", avgCorrect, maxStreak, totalStarts: starts.length };
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-secondary/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6"><div className="h-48 bg-muted animate-pulse rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Donut: Game Modes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              Modo Preferido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data?.modeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  dataKey="value"
                  stroke="none"
                >
                  {data?.modeData.map((_, i) => (
                    <Cell key={i} fill={MODE_COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs mt-1">
              {data?.modeData.map((m, i) => (
                <div key={m.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODE_COLORS[i] }} />
                  <span className="text-muted-foreground">{m.name}</span>
                  <span className="font-bold text-foreground">{m.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bar: Peak Hours */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Horário Nobre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data?.periodData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`${value} partidas`, "Total"]}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Os tricolores preferem jogar à <span className="font-semibold text-foreground">{PERIOD_LABELS[data?.peakPeriod || "noite"]?.split(" ")[1]?.toLowerCase()}</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats: Streak + Avg */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-primary" />
              Desempenho Global
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-4xl font-display font-bold text-primary">{data?.maxStreak}</p>
              <p className="text-xs text-muted-foreground mt-1">🔥 Recorde de sequência</p>
              <p className="text-xs text-muted-foreground">acertos consecutivos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-3xl font-display font-bold text-primary">{data?.avgCorrect}</p>
              <p className="text-xs text-muted-foreground mt-1">Média de acertos por sessão</p>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Baseado em {data?.totalStarts?.toLocaleString()} partidas iniciadas
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
