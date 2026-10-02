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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
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
      <style>{`.stats-panel [style*="opacity"] { opacity: 1 !important; }`}</style>
      <main className="min-h-screen page-warm pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl space-y-6">
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

          <Accordion type="multiple" className="rounded-xl border border-border bg-card px-4">
            <AccordionItem value="curiosidades">
              <AccordionTrigger className="text-left text-lg font-display text-primary min-h-14">Curiosidades</AccordionTrigger>
              <AccordionContent className="stats-panel space-y-6"><Curiosidades /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="camisas">
              <AccordionTrigger className="text-left text-lg font-display text-primary min-h-14">Quiz das Camisas</AccordionTrigger>
              <AccordionContent className="stats-panel space-y-6"><JerseyStatsCards /><JerseyCuriosidades /><div className="grid md:grid-cols-2 gap-6"><JerseyDecadeDistribution /><JerseyScoreDistribution /></div><HardestJerseys /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="comportamento">
              <AccordionTrigger className="text-left text-lg font-display text-primary min-h-14">Como os Tricolores Jogam</AccordionTrigger>
              <AccordionContent className="stats-panel space-y-6"><PlayerBehaviorStats /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="tempo">
              <AccordionTrigger className="text-left text-lg font-display text-primary min-h-14">Linha do Tempo</AccordionTrigger>
              <AccordionContent className="stats-panel space-y-6"><MonthlyGrowthChart /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="decadas">
              <AccordionTrigger className="text-left text-lg font-display text-primary min-h-14">Lendas por Década</AccordionTrigger>
              <AccordionContent className="stats-panel space-y-6"><DecadeDistribution /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="dificuldade">
              <AccordionTrigger className="text-left text-lg font-display text-primary min-h-14">Distribuição de Dificuldade</AccordionTrigger>
              <AccordionContent className="stats-panel space-y-6"><DifficultyDistribution /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="lendas">
              <AccordionTrigger className="text-left text-lg font-display text-primary min-h-14">Lendas Mais Conhecidas vs Mais Difíceis</AccordionTrigger>
              <AccordionContent className="stats-panel space-y-6"><HardestPlayers /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="ranking">
              <AccordionTrigger className="text-left text-lg font-display text-primary min-h-14">Hall da Fama</AccordionTrigger>
              <AccordionContent className="stats-panel space-y-6"><TopPlayersExpanded /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="pontuacoes">
              <AccordionTrigger className="text-left text-lg font-display text-primary min-h-14">Onde Você Se Encaixa?</AccordionTrigger>
              <AccordionContent className="stats-panel space-y-6"><ScoreDistribution /></AccordionContent>
            </AccordionItem>
          </Accordion>

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
