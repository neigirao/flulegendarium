import { lazy, Suspense, useRef } from 'react';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { SEOManager } from '@/components/seo/SEOManager';
import {
  HeroSection,
  MetodologiaSection,
  FinalistasSection,
  AproveitamentoSection,
  TitulosSection,
  CampanhasSection,
} from '@/components/specials/maior-treinador/SectionsA';
import { useInView } from '@/hooks/use-in-view';

const LazySectionsB = lazy(async () => {
  const mod = await import('@/components/specials/maior-treinador/SectionsB');
  const Bundle = () => (
    <>
      <mod.LongevidadeSection />
      <mod.TransicaoSection />
      <mod.RevelacaoSection />
      <mod.RankingOficialSection />
      <mod.ComparadorSection />
      <mod.VotacaoSection />
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

  nav { background: rgba(8,21,16,0.96) !important; border-bottom-color: rgba(255,255,255,0.08) !important; box-shadow: none !important; }
  nav h1, nav span, nav a, nav button { color: rgba(255,255,255,0.9) !important; }
  nav svg { color: rgba(255,255,255,0.7) !important; }

  @media (max-width: 640px) {
    [data-mt="stack"]  { grid-template-columns: 1fr !important; }
    [data-mt="vote"]   { grid-template-columns: 1fr !important; }
    [data-mt="cols5"]  { grid-template-columns: repeat(3, 1fr) !important; }
    [data-mt="cols5"] span { font-size: 8px !important; }
  }
`;

export default function MaiorTreinador() {
  const finalistasRef = useRef<HTMLDivElement>(null);
  const [sentinelRef, shouldLoadB] = useInView(0, '800px');

  const scrollToFinalistas = () => {
    const el = document.getElementById('finalistas-t');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 10, behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#F7F5F2', color: '#1a1a2e', overflowX: 'hidden' }}>
      <SEOManager
        title="Maior Treinador da História do Fluminense | Índice Lendas do Flu"
        description="Quem é o maior treinador da história do Fluminense? Analisamos 20 técnicos — Diniz, Abel Braga, Renato Gaúcho, Zezé Moreira e mais — com 4 critérios. Descubra o vencedor."
        keywords="maior treinador fluminense, melhor técnico fluminense, fernando diniz fluminense, abel braga fluminense, renato gaucho fluminense, zeze moreira fluminense, índice lendas do flu, história do fluminense, técnicos fluminense"
        type="article"
        schema="Article"
      />
      <style>{KEYFRAMES}</style>
      <TopNavigation />
      <div ref={finalistasRef}>
        <HeroSection onStart={scrollToFinalistas} />
        <MetodologiaSection />
        <FinalistasSection />
        <AproveitamentoSection />
        <TitulosSection />
        <CampanhasSection />
        <div ref={sentinelRef} style={{ height: 1 }} />
        <Suspense fallback={<div style={{ minHeight: 400 }} />}>
          {shouldLoadB && <LazySectionsB />}
        </Suspense>
      </div>
    </div>
  );
}
