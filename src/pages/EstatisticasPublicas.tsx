import React from "react";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { GlobalStatsCards } from "@/components/stats/GlobalStatsCards";
import { HardestPlayers } from "@/components/stats/HardestPlayers";
import { TopPlayersExpanded } from "@/components/stats/TopPlayersExpanded";
import { DifficultyDistribution } from "@/components/stats/DifficultyDistribution";
import { Curiosidades } from "@/components/stats/Curiosidades";
import { PlayerBehaviorStats } from "@/components/stats/PlayerBehaviorStats";
import { MonthlyGrowthChart } from "@/components/stats/MonthlyGrowthChart";
import { DecadeDistribution } from "@/components/stats/DecadeDistribution";
import { ScoreDistribution } from "@/components/stats/ScoreDistribution";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const sectionVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const SectionHeader = ({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) => (
  <div className="space-y-1 mb-4">
    <h2 className="text-xl font-display font-semibold text-foreground">
      {emoji} {title}
    </h2>
    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
  </div>
);

const EstatisticasPublicas = () => {
  return (
    <>
      <DynamicSEO
        customTitle="Estatísticas | Lendas do Flu"
        customDescription="Veja as estatísticas globais do quiz Lendas do Flu: jogadores mais difíceis, rankings, distribuição de dificuldade e curiosidades."
      />
      <TopNavigation />
      <main className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-wide">
                O FLU EM NÚMEROS
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A história tricolor contada através de dados — descubra como a comunidade joga,
              quais lendas desafiam mais e onde você se encaixa nos rankings.
            </p>
          </motion.div>

          {/* 1. Hero Stats */}
          <motion.section aria-label="Números gerais" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
            <GlobalStatsCards />
          </motion.section>

          {/* 2. Curiosidades */}
          <motion.section aria-label="Curiosidades" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
            <SectionHeader emoji="🔎" title="Curiosidades" subtitle="Fatos surpreendentes escondidos nos dados do quiz" />
            <Curiosidades />
          </motion.section>

          {/* 3. Como os Tricolores Jogam */}
          <motion.section aria-label="Comportamento dos jogadores" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <SectionHeader
              emoji="🎮"
              title="Como os Tricolores Jogam"
              subtitle="A maioria prefere o modo adaptativo — e joga quando a noite cai"
            />
            <PlayerBehaviorStats />
          </motion.section>

          {/* 4. Linha do Tempo */}
          <motion.section aria-label="Evolução mensal" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
            <SectionHeader emoji="📈" title="Linha do Tempo" subtitle="A evolução da comunidade tricolor mês a mês" />
            <MonthlyGrowthChart />
          </motion.section>

          {/* 5. Lendas por Década */}
          <motion.section aria-label="Distribuição por década" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}>
            <SectionHeader emoji="📅" title="Lendas por Década" subtitle="Qual era do Fluminense tem mais representantes no acervo?" />
            <DecadeDistribution />
          </motion.section>

          {/* 6. Dificuldade */}
          <motion.section aria-label="Distribuição de dificuldade" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5}>
            <SectionHeader emoji="📊" title="Distribuição de Dificuldade" />
            <DifficultyDistribution />
          </motion.section>

          {/* 7. Conhecidas vs Difíceis */}
          <motion.section aria-label="Jogadores mais conhecidos e mais difíceis" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6}>
            <SectionHeader
              emoji="⚡"
              title="Lendas Mais Conhecidas vs Mais Difíceis"
              subtitle="Compare quem todo mundo reconhece com quem desafia até os experts"
            />
            <HardestPlayers />
          </motion.section>

          {/* 8. Hall da Fama */}
          <motion.section aria-label="Hall da fama" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={7}>
            <SectionHeader emoji="🏆" title="Hall da Fama" subtitle="Os melhores de cada modo de jogo" />
            <TopPlayersExpanded />
          </motion.section>

          {/* 9. Distribuição de Scores */}
          <motion.section aria-label="Distribuição de pontuações" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={8}>
            <SectionHeader emoji="🎯" title="Onde Você Se Encaixa?" subtitle="Veja como sua pontuação se compara com a comunidade" />
            <ScoreDistribution />
          </motion.section>
        </div>
      </main>
    </>
  );
};

export default EstatisticasPublicas;
