import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Sparkles, ArrowRight, Trophy } from 'lucide-react';
import { SEOManager } from '@/components/seo/SEOManager';

interface SpecialCard {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: string;
  color: string;
}

const SPECIALS: SpecialCard[] = [
  {
    slug: 'maior-atacante',
    title: 'Maior Atacante da História do Fluminense',
    subtitle: 'Melhor Atacante do Flu',
    description: 'Analisamos 15 lendas tricolores com uma metodologia exclusiva — 8 critérios, 100+ anos de história — para descobrir quem foi o atacante mais importante de todos os tempos.',
    badge: 'Estudo Especial',
    icon: '⚽',
    color: '#7A0213',
  },
  {
    slug: 'maior-treinador',
    title: 'Maior Treinador da História do Fluminense',
    subtitle: 'Melhor Técnico do Flu',
    description: 'Analisamos 20 técnicos tricolores com metodologia exclusiva — 4 critérios, 100+ anos de história — para descobrir quem foi o treinador mais importante de todos os tempos.',
    badge: 'Estudo Especial',
    icon: '📋',
    color: '#006140',
  },
];

export default function Especiais() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <SEOManager
        title="Especiais | Estudos sobre a História do Fluminense FC"
        description="Estudos editoriais em profundidade sobre a história e os ídolos do Fluminense FC. Análises exclusivas com metodologia própria — quem foi o maior atacante, goleiro e muito mais."
        keywords="especiais fluminense, história fluminense, ídolos fluminense, estudo fluminense, editorial fluminense"
        schema="WebPage"
      />
      <TopNavigation />
      <main className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5" style={{ color: '#C4944A' }} />
              <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#C4944A' }}>Conteúdo Especial</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-[#7A0213] leading-none tracking-wide mb-3">
              ESPECIAIS
            </h1>
            <p className="text-[#64748B] text-base max-w-lg">
              Estudos editoriais em profundidade sobre a história e os ídolos do Fluminense FC.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {SPECIALS.map(card => (
              <button
                key={card.slug}
                onClick={() => navigate(`/especiais/${card.slug}`)}
                className="text-left group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Top accent */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${card.color}, #C4944A)` }} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span style={{ background: 'rgba(196,148,74,0.12)', color: '#C4944A', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6 }}>
                      {card.badge}
                    </span>
                    <span className="text-3xl">{card.icon}</span>
                  </div>

                  <h2 className="font-display text-2xl leading-tight tracking-wide mb-1" style={{ color: card.color }}>
                    {card.title.toUpperCase()}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-3">
                    {card.subtitle}
                  </p>
                  <p className="text-sm text-[#64748B] leading-relaxed mb-5">
                    {card.description}
                  </p>

                  <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: card.color }}>
                    <Trophy className="h-4 w-4" />
                    Ler o estudo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
