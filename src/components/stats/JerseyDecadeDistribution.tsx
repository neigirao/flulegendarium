import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { Shirt } from "lucide-react";
import { DECADES_INFO } from "@/data/decades";

const DECADE_COLORS: Record<string, string> = {
  "1970s": "hsl(45, 93%, 47%)",
  "1980s": "hsl(25, 95%, 53%)",
  "1990s": "hsl(0, 84%, 60%)",
  "2000s": "hsl(217, 91%, 60%)",
  "2010s": "hsl(142, 76%, 36%)",
  "2020s": "hsl(271, 91%, 65%)",
};

const normalizeDecade = (value: string): string | null => {
  const cleaned = value.trim();
  const normalized = cleaned.toLowerCase();
  const yearMatch = normalized.match(/\d{4}/);

  if (yearMatch) {
    const decade = Math.floor(Number(yearMatch[0]) / 10) * 10;
    return `${decade}s`;
  }

  const decadeMatch = normalized.match(/\d{3}0s?/);
  if (decadeMatch) {
    return `${decadeMatch[0].replace("s", "")}s`;
  }

  const decadeLabelMatch = normalized.match(/anos\s*(\d{2})/);
  if (decadeLabelMatch) {
    return `19${decadeLabelMatch[1]}s`;
  }

  return null;
};

export const JerseyDecadeDistribution = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-jersey-decade-distribution"],
    queryFn: async () => {
      const { data: jerseys } = await supabase.from("jerseys").select("decades");

      if (!jerseys) return { chartData: [], bestDecade: null };

      const counts: Record<string, number> = {};
      jerseys.forEach((j) => {
        (j.decades || []).forEach((d: string) => {
          const normalizedDecade = normalizeDecade(d);
          if (!normalizedDecade || !(normalizedDecade in DECADES_INFO)) return;

          counts[normalizedDecade] = (counts[normalizedDecade] || 0) + 1;
        });
      });

      const chartData = Object.keys(DECADES_INFO)
        .map((key) => ({
          key,
          name: DECADES_INFO[key as keyof typeof DECADES_INFO].label,
          count: counts[key] || 0,
          color: DECADE_COLORS[key] || "hsl(var(--primary))",
        }))
        .filter((d) => d.count > 0);

      const bestDecade = chartData.reduce(
        (best, cur) => (cur.count > (best?.count || 0) ? cur : best),
        chartData[0]
      );

      return { chartData, bestDecade };
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shirt className="h-5 w-5 text-primary" />
            Camisas por Década
          </CardTitle>
          {data?.bestDecade && (
            <p className="text-sm text-muted-foreground">
              A década com mais camisas é a de{" "}
              <span className="font-semibold text-foreground">{data.bestDecade.name}</span> com{" "}
              <span className="font-semibold text-primary">{data.bestDecade.count}</span> camisas
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`${value} camisas`, "Quantidade"]}
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
