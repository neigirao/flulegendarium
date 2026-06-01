import { useRef } from 'react';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { FloatRank } from '@/components/specials/maior-atacante/FloatRank';
import {
  HeroSection,
  FinalistasSection,
  MetodologiaSection,
  ProducaoSection,
  TitulosSection,
  CampanhasSection,
} from '@/components/specials/maior-atacante/SectionsA';
import {
  ClassicosSection,
  DecisivosSection,
  PremiacoesSection,
  LegadoSection,
  TransicaoSection,
  RevelacaoSection,
  RankingOficialSection,
  VotacaoSection,
  ComparadorSection,
  CTASection,
} from '@/components/specials/maior-atacante/SectionsB';

const KEYFRAMES = `
  @keyframes slideInRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes popCount { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes revealUp { from { transform: translateY(40px) scale(0.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
  @keyframes bounceArrow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
`;

export default function MaiorAtacante() {
  const finalistasRef = useRef<HTMLDivElement>(null);

  const scrollToFinalistas = () => {
    const el = document.getElementById('finalistas');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 10, behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#F7F5F2', color: '#1a1a2e', overflowX: 'hidden' }}>
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
        <ClassicosSection />
        <DecisivosSection />
        <PremiacoesSection />
        <LegadoSection />
        <TransicaoSection />
        <RevelacaoSection />
        <RankingOficialSection />
        <VotacaoSection />
        <ComparadorSection />
        <CTASection />
      </div>
    </div>
  );
}
