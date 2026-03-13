import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

const DIFFICULTY_COLORS: Record<string, string> = {
  muito_facil: "hsl(142, 76%, 36%)",
  facil: "hsl(142, 60%, 50%)",
  medio: "hsl(48, 96%, 53%)",
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

export const DifficultyDistribution = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-difficulty-distribution"],
    queryFn: async () => {
      const { data: players } = await supabase
        .from("players")
        .select("difficulty_level");

      if (!players) return [];

      const counts: Record<string, number> = {};
      players.forEach((p) => {
        const level = p.difficulty_level || "medio";
        counts[level] = (counts[level] || 0) + 1;
      });

      return Object.entries(DIFFICULTY_LABELS).map(([key, label]) => ({
        name: label,
        key,
        count: counts[key] || 0,
        color: DIFFICULTY_COLORS[key],
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Distribuição de Dificuldade dos Jogadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 bg-muted animate-pulse rounded" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [`${value} jogadores`, "Quantidade"]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data?.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
