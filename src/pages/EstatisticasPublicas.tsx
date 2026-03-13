import React from "react";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { GlobalStatsCards } from "@/components/stats/GlobalStatsCards";
import { HardestPlayers } from "@/components/stats/HardestPlayers";
import { TopPlayersExpanded } from "@/components/stats/TopPlayersExpanded";
import { DifficultyDistribution } from "@/components/stats/DifficultyDistribution";
import { Curiosidades } from "@/components/stats/Curiosidades";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const EstatisticasPublicas = () => {
  return (
    <>
      <DynamicSEO
        title="Estatísticas | Lendas do Flu"
        description="Veja as estatísticas globais do quiz Lendas do Flu: jogadores mais difíceis, rankings, distribuição de dificuldade e curiosidades."
        path="/estatisticas"
      />
      <TopNavigation />
      <main className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl space-y-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-wide">
                ESTATÍSTICAS
              </h1>
            </div>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Números globais, curiosidades e rankings do quiz Lendas do Flu — atualizado em tempo real.
            </p>
          </motion.div>

          {/* Section 1 — Global Stats */}
          <section aria-label="Números gerais">
            <GlobalStatsCards />
          </section>

          {/* Section 5 — Curiosidades */}
          <section aria-label="Curiosidades">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              🔎 Curiosidades
            </h2>
            <Curiosidades />
          </section>

          {/* Section 2 — Hardest/Easiest */}
          <section aria-label="Jogadores mais conhecidos e mais difíceis">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              ⚡ Lendas Mais Conhecidas vs Mais Difíceis
            </h2>
            <HardestPlayers />
          </section>

          {/* Section 3 — Hall of Fame */}
          <section aria-label="Hall da fama">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              🏆 Hall da Fama
            </h2>
            <TopPlayersExpanded />
          </section>

          {/* Section 4 — Difficulty Distribution */}
          <section aria-label="Distribuição de dificuldade">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              📊 Distribuição de Dificuldade
            </h2>
            <DifficultyDistribution />
          </section>
        </div>
      </main>
    </>
  );
};

export default EstatisticasPublicas;
