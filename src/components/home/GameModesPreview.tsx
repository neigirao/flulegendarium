import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const useCollectionCounts = () => {
  const { data: playerCount } = useQuery({
    queryKey: ['player-count'],
    queryFn: async () => {
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 30 * 60 * 1000,
  });

  const { data: jerseyCount } = useQuery({
    queryKey: ['jersey-count'],
    queryFn: async () => {
      const { count } = await supabase.from('jerseys').select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 30 * 60 * 1000,
  });

  return { playerCount: playerCount || 0, jerseyCount: jerseyCount || 0 };
};

interface ModeCardProps {
  href: string;
  accent: 'grena' | 'verde' | 'gold';
  icon: React.ReactNode;
  pill: string;
  name: string;
  description: string;
  cta: string;
}

const accentStyles = {
  grena: {
    stripe: 'bg-primary',
    iconBg: 'bg-primary/8',
    pillBg: 'bg-primary/8 text-primary',
    cta: 'text-primary',
  },
  verde: {
    stripe: 'bg-secondary',
    iconBg: 'bg-secondary/8',
    pillBg: 'bg-secondary/8 text-secondary',
    cta: 'text-secondary',
  },
  gold: {
    stripe: 'bg-accent',
    iconBg: 'bg-accent/12',
    pillBg: 'bg-accent text-white',
    cta: 'text-accent',
  },
};

const ModeCard: React.FC<ModeCardProps> = ({ href, accent, icon, pill, name, description, cta }) => {
  const s = accentStyles[accent];
  return (
    <Link
      to={href}
      className="group bg-white border border-border rounded-[14px] px-5 py-[22px] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-200 relative overflow-hidden flex flex-col"
    >
      {/* top color stripe */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', s.stripe)} />

      <div className="flex items-center justify-between mb-3.5 mt-1">
        <div className={cn('w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-[22px]', s.iconBg)}>
          {icon}
        </div>
        <span className={cn('text-[9px] font-extrabold tracking-[0.08em] uppercase px-2 py-1 rounded-[5px]', s.pillBg)}>
          {pill}
        </span>
      </div>

      <div className="font-display text-[22px] tracking-[0.02em] text-foreground mb-1.5 leading-[1.1]">{name}</div>
      <p className="text-[13px] text-muted-foreground leading-[1.5] mb-3.5 flex-1">{description}</p>
      <div className={cn('text-[12px] font-bold flex items-center gap-1.5', s.cta)}>
        {cta} <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
      </div>
    </Link>
  );
};

export const GameModesPreview = () => {
  const { playerCount, jerseyCount } = useCollectionCounts();

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-display text-[30px] text-primary tracking-[0.03em]">ESCOLHA SEU MODO</h2>
        <Link to="/tutorial" className="text-[13px] text-secondary font-semibold hover:text-secondary/80 flex items-center gap-1 transition-colors">
          Ver tutorial →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModeCard
          href="/quiz-adaptativo"
          accent="grena"
          icon="🏆"
          pill="Adaptável"
          name="ADIVINHE O JOGADOR"
          description={`Veja a foto, digite o nome. A dificuldade aumenta conforme você acerta — de Castilho a Cano. ${playerCount > 0 ? `${playerCount}+ jogadores.` : ''}`}
          cta="Jogar agora"
        />
        <ModeCard
          href="/quiz-decada"
          accent="verde"
          icon="📅"
          pill="6 Décadas"
          name="POR DÉCADA"
          description="Escolha uma era: anos 60, 70, 80, 90, 2000 ou 2010+. Cada época tem seus ídolos."
          cta="Escolher década"
        />
        <ModeCard
          href="/quiz-camisas"
          accent="gold"
          icon="👕"
          pill="Novo!"
          name="QUIZ DAS CAMISAS"
          description={`Veja a camisa histórica e descubra de qual era ela é — entre 3 opções com contexto. ${jerseyCount > 0 ? `${jerseyCount} camisas.` : ''}`}
          cta="Jogar agora"
        />
      </div>
    </div>
  );
};

export default GameModesPreview;
