import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { DECADES_INFO } from "@/data/decades";

const DECADE_COLORS: Record<string, string> = {
  "1970s": "hsl(45, 93%, 47%)",
  "1980s": "hsl(25, 95%, 53%)",
  "1990s": "hsl(0, 84%, 60%)",
  "2000s": "hsl(217, 91%, 60%)",
  "2010s": "hsl(142, 76%, 36%)",
  "2020s": "hsl(271, 91%, 65%)",
};

export const DecadeDistribution = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-decade-distribution"],
    queryFn: async () => {
      const { data: players } = await supabase
        .from("players")
        .select("decades");

      if (!players) return { chartData: [], bestDecade: null };

      const counts: Record<string, number> = {};
      players.forEach((p) => {
        const decades = p.decades || [];
        decades.forEach((d: string) => {
          counts[d] = (counts[d] || 0) + 1;
        });
      });

      const chartData = Object.keys(DECADES_INFO)
        .map((key) => ({
          key,
          name: DECADES_INFO[key as keyof typeof DECADES_INFO].label,
          count: counts[key] || 0,
          color: DECADE_COLORS[key] || "hsl(var(--primary))",
          icon: DECADES_INFO[key as keyof typeof DECADES_INFO].icon,
        }))
        .filter((d) => d.count > 0);

      const bestDecade = chartData.reduce((best, cur) =>
        cur.count > (best?.count || 0) ? cur : best, chartData[0]);

      return { chartData, bestDecade };
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Lendas por Década
          </CardTitle>
          {data?.bestDecade && (
            <p className="text-sm text-muted-foreground">
              A era dourada é a dos <span className="font-semibold text-foreground">{data.bestDecade.name}</span> com{" "}
              <span className="font-semibold text-primary">{data.bestDecade.count}</span> lendas cadastradas
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [`${value} jogadores`, "Lendas"]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {data?.chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
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
