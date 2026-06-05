import { lazy, Suspense, useRef } from 'react';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { FloatRank } from '@/components/specials/maior-atacante/FloatRank';
import { SEOManager } from '@/components/seo/SEOManager';
import {
  HeroSection,
  FinalistasSection,
  MetodologiaSection,
  ProducaoSection,
  TitulosSection,
  CampanhasSection,
  LongevidadeSection,
} from '@/components/specials/maior-atacante/SectionsA';
import { useInView } from '@/hooks/use-in-view';

const LazySectionsB = lazy(async () => {
  const mod = await import('@/components/specials/maior-atacante/SectionsB');
  const Bundle = () => (
    <>
      <mod.ClassicosSection />
      <mod.DecisivosSection />
      <mod.PremiacoesSection />
      <mod.LegadoSection />
      <mod.TransicaoSection />
      <mod.RevelacaoSection />
      <mod.RankingOficialSection />
      <mod.VotacaoSection />
      <mod.ComparadorSection />
      <mod.CTASection />
    </>
  );
  return { default: Bundle };
});

const KEYFRAMES = `
  @keyframes slideInRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes popCount { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes revealUp { from { transform: translateY(40px) scale(0.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
  @keyframes bounceArrow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
  @media (max-width: 640px) {
    [data-mc="stack"] { grid-template-columns: 1fr !important; }
    [data-mc="vote"]  { grid-template-columns: 1fr !important; }
    [data-mc="minfix"] { grid-template-columns: 1fr !important; }
  }
`;

export default function MaiorAtacante() {
  const finalistasRef = useRef<HTMLDivElement>(null);
  const [sentinelRef, shouldLoadB] = useInView(0, '800px');

  const scrollToFinalistas = () => {
    const el = document.getElementById('finalistas');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 10, behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#F7F5F2', color: '#1a1a2e', overflowX: 'hidden' }}>
      <SEOManager
        title="Maior Atacante da História do Fluminense | Índice Lendas do Flu"
        description="Quem é o maior atacante da história do Fluminense? Analisamos 15 lendas tricolores — Waldo, Fred, Cano e mais — com 8 critérios em um estudo exclusivo. Descubra o vencedor."
        keywords="maior atacante fluminense, waldo fluminense, fred fluminense, germán cano, história fluminense, lendas fluminense, índice lendas do flu"
        type="article"
        schema="Article"
      />
      <style>{KEYFRAMES}</style>
      <TopNavigation />
      <FloatRank />
      <div ref={finalistasRef}>
        <HeroSection onStart={scrollToFinalistas} />
        <FinalistasSection />
        <MetodologiaSection />
        <ProducaoSection />
        <TitulosSection />
        <CampanhasSection />
        <LongevidadeSection />
        <div ref={sentinelRef} style={{ height: 1 }} />
        <Suspense fallback={<div style={{ minHeight: 400 }} />}>
          {shouldLoadB && <LazySectionsB />}
        </Suspense>
      </div>
    </div>
  );
}
