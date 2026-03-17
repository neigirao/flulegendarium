import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  home: "Principal",
  away: "Visitante",
  third: "Terceira",
  special: "Especial",
};

interface JerseyDifficulty {
  years: string;
  type: string;
  total_attempts: number;
  success_rate: number;
}

export const HardestJerseys = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-jersey-difficulty"],
    queryFn: async () => {
      const { data: jerseys } = await supabase
        .from("jerseys")
        .select("years, type, total_attempts, correct_attempts")
        .gt("total_attempts", 2);

      if (!jerseys) return { easiest: [], hardest: [] };

      const withRate: JerseyDifficulty[] = jerseys.map((j) => ({
        years: (j.years || []).join("/"),
        type: TYPE_LABELS[j.type] || j.type,
        total_attempts: j.total_attempts || 0,
        success_rate:
          j.total_attempts && j.total_attempts > 0
            ? ((j.correct_attempts || 0) / j.total_attempts) * 100
            : 0,
      }));

      const sorted = [...withRate].sort((a, b) => b.success_rate - a.success_rate);
      return {
        easiest: sorted.slice(0, 10),
        hardest: sorted.filter((j) => j.success_rate < 100).reverse().slice(0, 10),
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const renderTable = (
    items: JerseyDifficulty[],
    title: string,
    icon: React.ElementType,
    colorClass: string
  ) => (
    <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {React.createElement(icon, { className: `h-5 w-5 ${colorClass}` })}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[1.5rem_1fr_3.5rem_4rem_4rem] gap-2 text-xs font-semibold text-muted-foreground pb-1 border-b border-secondary/10">
              <span>#</span>
              <span>Camisa</span>
              <span>Tipo</span>
              <span className="text-right">Taxa</span>
              <span className="text-right">Tent.</span>
            </div>
            {items.map((j, i) => (
              <motion.div
                key={`${j.years}-${j.type}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[1.5rem_1fr_3.5rem_4rem_4rem] gap-2 items-center py-1.5 text-sm"
              >
                <span className="text-muted-foreground font-mono">{i + 1}</span>
                <span className="font-medium text-foreground truncate">{j.years}</span>
                <span className="text-xs text-muted-foreground truncate">{j.type}</span>
                <span className={`text-right font-semibold ${colorClass}`}>
                  {j.success_rate.toFixed(0)}%
                </span>
                <span className="text-right text-muted-foreground">{j.total_attempts}</span>
              </motion.div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Dados insuficientes</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {renderTable(data?.easiest || [], "Camisas Mais Reconhecidas", TrendingUp, "text-success")}
      {renderTable(data?.hardest || [], "Camisas Mais Difíceis", TrendingDown, "text-destructive")}
    </div>
  );
};
