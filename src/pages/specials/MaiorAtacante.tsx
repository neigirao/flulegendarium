import { useRef } from 'react';
import { TopNavigation } from '@/components/navigation/TopNavigation';
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
import {
  ClassicosSection,
  DecisivosSection,
  PremiacoesSection,
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

  /* nav dark mode: blends into the hero while on this page */
  nav { background: rgba(8,21,16,0.96) !important; border-bottom-color: rgba(255,255,255,0.08) !important; box-shadow: none !important; }
  nav h1, nav span, nav a, nav button { color: rgba(255,255,255,0.9) !important; }
  nav svg { color: rgba(255,255,255,0.7) !important; }

  @media (max-width: 640px) {
    [data-mc="stack"]    { grid-template-columns: 1fr !important; }
    [data-mc="vote"]     { grid-template-columns: 1fr !important; }
    [data-mc="minfix"]   { grid-template-columns: 1fr !important; }
    [data-mc="cols5"]    { grid-template-columns: repeat(3, 1fr) !important; }
    [data-mc="cols5"] span { font-size: 8px !important; }
  }
  @media (max-width: 400px) {
    [data-mc="cols5"] { grid-template-columns: repeat(3, 1fr) !important; }
  }
`;

export default function MaiorAtacante() {
  const finalistasRef = useRef<HTMLDivElement>(null);

  const scrollToFinalistas = () => {
    const el = document.getElementById('finalistas');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 10, behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#F7F5F2', color: '#1a1a2e', overflowX: 'hidden' }}>
      <SEOManager
        title="Maior Atacante da História do Fluminense | Índice Lendas do Flu"
        description="Quem é o maior atacante da história do Fluminense? Analisamos 15 lendas tricolores — Waldo, Fred, Cano e mais — com 8 critérios em um estudo exclusivo. Descubra o vencedor."
        keywords="maior atacante fluminense, maior artilheiro fluminense, waldo fluminense, fred fluminense, germán cano fluminense, história do fluminense, lendas fluminense, índice lendas do flu, fred vs waldo, análise atacantes flu, artilheiro histórico fluminense"
        type="article"
        schema="Article"
        articleBody="O Índice Lendas do Flu (ILF) é um estudo que determina o maior atacante da história do Fluminense FC com base em 8 critérios ponderados: Produção Ofensiva (25%), Títulos Conquistados (15%), Campanhas Históricas (15%), Gols em Clássicos (10%), Jogos Decisivos (10%), Premiações Individuais (10%), Longevidade (5%) e Legado Histórico (10%). Os 15 candidatos avaliados são: Waldo (319 gols, 1954–1961), Fred (199 gols, 2009–2022), Germán Cano (111+ gols, 2022–hoje), Orlando (184 gols, 1945–1954), Hércules (165 gols, 1935–1942), Telê Santana (162 gols, 1951–1960), Henry Welfare (161 gols, 1913–1924), Russo (155 gols, 1933–1944), Preguinho (128 gols, 1925–1938), Washington (121 gols, 1983–1989), Magno Alves (124 gols, 1998–2002), Ézio (118 gols, 1991–1995), Escurinho (111 gols, 1950–1958), Jair Francisco (107 gols, 1949–1959) e Zezé (106 gols, 1944–1952). Waldo lidera a produção histórica com 319 gols. Fred é o maior ídolo moderno com três Copas do Brasil e vice-campeonato mundial. Cano conquistou Libertadores 2023 e artilharia recordes no Brasil."
        mentions={[
          { name: 'Waldo' },
          { name: 'Fred' },
          { name: 'Germán Cano' },
          { name: 'Orlando' },
          { name: 'Hércules' },
          { name: 'Telê Santana' },
          { name: 'Henry Welfare' },
          { name: 'Russo' },
          { name: 'Preguinho' },
          { name: 'Washington' },
          { name: 'Magno Alves' },
          { name: 'Ézio' },
          { name: 'Escurinho' },
          { name: 'Jair Francisco' },
          { name: 'Zezé' },
          { name: 'Fluminense FC', url: 'https://www.fluminense.com.br' },
        ]}
        breadcrumbs={[
          { name: 'Lendas do Flu', url: '/' },
          { name: 'Especiais', url: '/especiais' },
          { name: 'Maior Atacante da História', url: '/especiais/maior-atacante' },
        ]}
      />
      <style>{KEYFRAMES}</style>
      <TopNavigation />
      <div ref={finalistasRef}>
        <HeroSection onStart={scrollToFinalistas} />
        <MetodologiaSection />
        <FinalistasSection />
        <ProducaoSection />
        <ClassicosSection />
        <DecisivosSection />
        <TitulosSection />
        <CampanhasSection />
        <LongevidadeSection />
        <PremiacoesSection />
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
