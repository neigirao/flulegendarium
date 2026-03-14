import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Star } from "lucide-react";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export const MonthlyGrowthChart = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-monthly-growth"],
    queryFn: async () => {
      const { data: rankings } = await supabase
        .from("rankings")
        .select("created_at");

      if (!rankings) return { chartData: [], bestMonth: null };

      const monthCounts = new Map<string, number>();
      rankings.forEach((r) => {
        const d = new Date(r.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
      });

      const sortedKeys = Array.from(monthCounts.keys()).sort();
      const chartData = sortedKeys.map((key) => {
        const [year, month] = key.split("-");
        return {
          name: `${MONTH_LABELS[parseInt(month) - 1]}/${year.slice(2)}`,
          partidas: monthCounts.get(key) || 0,
          key,
        };
      });

      const bestMonth = chartData.reduce((best, cur) =>
        cur.partidas > (best?.partidas || 0) ? cur : best, chartData[0]);

      return { chartData, bestMonth };
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Linha do Tempo
            </CardTitle>
            {data?.bestMonth && (
              <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                <Star className="h-3 w-3" />
                Pico: {data.bestMonth.name} ({data.bestMonth.partidas})
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Rankings salvos por mês — acompanhe a evolução da comunidade tricolor</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorPartidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  formatter={(value: number) => [`${value} rankings`, "Partidas"]}
                />
                <Area
                  type="monotone"
                  dataKey="partidas"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorPartidas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
