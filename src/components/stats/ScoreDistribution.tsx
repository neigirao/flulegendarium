import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

const RANGES = [
  { min: 0, max: 100, label: "0-100" },
  { min: 101, max: 250, label: "101-250" },
  { min: 251, max: 500, label: "251-500" },
  { min: 501, max: 1000, label: "501-1K" },
  { min: 1001, max: 2000, label: "1K-2K" },
  { min: 2001, max: Infinity, label: "2K+" },
];

export const ScoreDistribution = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-score-distribution"],
    queryFn: async () => {
      const { data: rankings } = await supabase
        .from("rankings")
        .select("score");

      if (!rankings || rankings.length === 0) return { chartData: [], narrative: "" };

      const counts = RANGES.map((r) => ({
        ...r,
        count: rankings.filter((rank) => rank.score >= r.min && rank.score <= r.max).length,
      }));

      const total = rankings.length;
      const under500 = counts.slice(0, 3).reduce((sum, c) => sum + c.count, 0);
      const pct = Math.round((under500 / total) * 100);

      return {
        chartData: counts.map((c) => ({
          name: c.label,
          count: c.count,
          pct: Math.round((c.count / total) * 100),
        })),
        narrative: `${pct}% dos jogadores marcam até 500 pontos — poucos chegam ao topo!`,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Distribuição de Pontuações
          </CardTitle>
          {data?.narrative && (
            <p className="text-sm text-muted-foreground">{data.narrative}</p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.chartData} margin={{ top: 15, right: 20, bottom: 5, left: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
                  formatter={(value: number, _: string, props: any) => [
                    `${value} jogadores (${props.payload.pct}%)`,
                    "Quantidade",
                  ]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} label={{ position: "top", fontSize: 10, fill: "hsl(var(--muted-foreground))", formatter: (v: number) => v > 0 ? v : "" }}>
                  {data?.chartData.map((entry, i) => (
                    <Cell key={i} fill={i < 3 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
