import React from "react";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { SEOManager } from "@/components/seo/SEOManager";
import { GlobalStatsCards } from "@/components/stats/GlobalStatsCards";
import { HardestPlayers } from "@/components/stats/HardestPlayers";
import { TopPlayersExpanded } from "@/components/stats/TopPlayersExpanded";
import { DifficultyDistribution } from "@/components/stats/DifficultyDistribution";
import { Curiosidades } from "@/components/stats/Curiosidades";
import { PlayerBehaviorStats } from "@/components/stats/PlayerBehaviorStats";
import { MonthlyGrowthChart } from "@/components/stats/MonthlyGrowthChart";
import { DecadeDistribution } from "@/components/stats/DecadeDistribution";
import { ScoreDistribution } from "@/components/stats/ScoreDistribution";
import { JerseyStatsCards } from "@/components/stats/JerseyStatsCards";
import { HardestJerseys } from "@/components/stats/HardestJerseys";
import { JerseyDecadeDistribution } from "@/components/stats/JerseyDecadeDistribution";
import { JerseyScoreDistribution } from "@/components/stats/JerseyScoreDistribution";
import { JerseyCuriosidades } from "@/components/stats/JerseyCuriosidades";
import { motion } from "framer-motion";
import { BarChart3, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { useEffect } from "react";

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
  const navigate = useNavigate();

  // Inject BreadcrumbList JSON-LD
  useEffect(() => {
    const breadcrumbLD = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://lendasdoflu.com/" },
        { "@type": "ListItem", "position": 2, "name": "Estatísticas", "item": "https://lendasdoflu.com/estatisticas" }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.textContent = JSON.stringify(breadcrumbLD);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return (
    <>
      <SEOManager
        title="O Flu em Números: Estatísticas, Rankings e Curiosidades do Quiz | Lendas do Flu"
        description="📊 Descubra como a comunidade tricolor joga: rankings, jogadores mais difíceis, distribuição por década, curiosidades e muito mais."
      />
      <TopNavigation />
      <main className="min-h-screen bg-background pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl space-y-12">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Início</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Estatísticas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

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

          {/* Jersey Quiz Stats */}
          <motion.section aria-label="Quiz das Camisas" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <SectionHeader emoji="👕" title="Quiz das Camisas" subtitle="Números e curiosidades do quiz de camisas históricas" />
            <div className="space-y-8">
              <JerseyStatsCards />
              <JerseyCuriosidades />
              <div className="grid md:grid-cols-2 gap-6">
                <JerseyDecadeDistribution />
                <JerseyScoreDistribution />
              </div>
              <HardestJerseys />
            </div>
          </motion.section>

          {/* 3-9: Below fold — lazy render */}
          <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
            <motion.div aria-label="Comportamento dos jogadores" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
              <SectionHeader
                emoji="🎮"
                title="Como os Tricolores Jogam"
                subtitle="Preferência de modo de jogo e horários de pico da comunidade"
              />
              <PlayerBehaviorStats />
            </motion.div>
          </section>

          <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 350px' }}>
            <motion.div aria-label="Evolução mensal" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
              <SectionHeader emoji="📈" title="Linha do Tempo" subtitle="A evolução da comunidade tricolor mês a mês" />
              <MonthlyGrowthChart />
            </motion.div>
          </section>

          <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 350px' }}>
            <motion.div aria-label="Distribuição por década" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}>
              <SectionHeader emoji="📅" title="Lendas por Década" subtitle="Qual era do Fluminense tem mais representantes no acervo?" />
              <DecadeDistribution />
            </motion.div>
          </section>

          <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 300px' }}>
            <motion.div aria-label="Distribuição de dificuldade" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5}>
              <SectionHeader emoji="📊" title="Distribuição de Dificuldade" />
              <DifficultyDistribution />
            </motion.div>
          </section>

          <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
            <motion.div aria-label="Jogadores mais conhecidos e mais difíceis" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6}>
              <SectionHeader
                emoji="⚡"
                title="Lendas Mais Conhecidas vs Mais Difíceis"
                subtitle="Compare quem todo mundo reconhece com quem desafia até os experts"
              />
              <HardestPlayers />
            </motion.div>
          </section>

          <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
            <motion.div aria-label="Hall da fama" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={7}>
              <SectionHeader emoji="🏆" title="Hall da Fama" subtitle="Os melhores de cada modo de jogo" />
              <TopPlayersExpanded />
            </motion.div>
          </section>

          <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 350px' }}>
            <motion.div aria-label="Distribuição de pontuações" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={8}>
              <SectionHeader emoji="🎯" title="Onde Você Se Encaixa?" subtitle="Veja como sua pontuação se compara com a comunidade" />
              <ScoreDistribution />
            </motion.div>
          </section>

          {/* CTA to play */}
          <motion.div
            variants={sectionVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={9}
            className="text-center py-8"
          >
            <p className="text-muted-foreground mb-4 font-body">
              Gostou dos números? Agora é sua vez de fazer história!
            </p>
            <Button
              onClick={() => navigate('/selecionar-modo-jogo')}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wide hover:scale-105 transition-transform"
            >
              <Rocket className="w-5 h-5 mr-2" />
              JOGAR AGORA
            </Button>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default EstatisticasPublicas;
