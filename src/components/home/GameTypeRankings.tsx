import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Shirt, Target } from "lucide-react";
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton";
import { cn } from "@/lib/utils";

interface RankingEntry {
  id: string;
  player_name: string;
  score: number;
}


const Podium = ({ rankings }: { rankings: RankingEntry[] }) => {
  const second = rankings[1];
  const first = rankings[0];
  const third = rankings[2];

  return (
    <div className="grid grid-cols-3 gap-3 items-end max-w-[680px] mx-auto mb-5">
      {/* 2nd */}
      <div className="bg-white border-[1.5px] border-border rounded-[14px] px-3.5 py-4 text-center">
        <div className="w-[42px] h-[42px] rounded-full mx-auto mb-2 flex items-center justify-center font-display text-[18px] text-white bg-[#A8B0BB]">2</div>
        <div className="text-[13px] font-bold text-foreground truncate">{second?.player_name ?? '—'}</div>
        <div className="font-display text-[22px] text-primary">{second?.score?.toLocaleString('pt-BR') ?? '—'}</div>
      </div>

      {/* 1st — elevated */}
      <div className="bg-gradient-to-b from-[rgba(196,148,74,0.06)] to-white border-[1.5px] border-[#C4944A] rounded-[14px] px-3.5 py-4 text-center -translate-y-3 shadow-[0_12px_32px_rgba(196,148,74,0.18)]">
        <div className="w-[42px] h-[42px] rounded-full mx-auto mb-2 flex items-center justify-center font-display text-[18px] text-white bg-[#C4944A]">1</div>
        <div className="text-[13px] font-bold text-foreground truncate">{first?.player_name ?? '—'}</div>
        <div className="font-display text-[28px] text-[#C4944A]">{first?.score?.toLocaleString('pt-BR') ?? '—'}</div>
      </div>

      {/* 3rd */}
      <div className="bg-white border-[1.5px] border-border rounded-[14px] px-3.5 py-4 text-center">
        <div className="w-[42px] h-[42px] rounded-full mx-auto mb-2 flex items-center justify-center font-display text-[18px] text-white bg-[#B8754A]">3</div>
        <div className="text-[13px] font-bold text-foreground truncate">{third?.player_name ?? '—'}</div>
        <div className="font-display text-[22px] text-primary">{third?.score?.toLocaleString('pt-BR') ?? '—'}</div>
      </div>
    </div>
  );
};

const RankingList = ({ rankings, isLoading }: { rankings: RankingEntry[] | undefined; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-2 max-w-[680px] mx-auto">
        {Array.from({ length: 5 }, (_, i) => <ShimmerSkeleton key={i} variant="card" />)}
      </div>
    );
  }

  if (!rankings?.length) {
    return <p className="text-muted-foreground text-center py-8">Nenhum ranking disponível ainda. Seja o primeiro!</p>;
  }

  const podiumEntries = rankings.slice(0, 3);
  const listEntries = rankings.slice(3);

  return (
    <>
      <Podium rankings={podiumEntries} />

      {listEntries.length > 0 && (
        <div className="max-w-[680px] mx-auto bg-white border border-border rounded-[12px] overflow-hidden">
          {listEntries.map((entry, i) => (
            <div
              key={entry.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors',
                i < listEntries.length - 1 && 'border-b border-border'
              )}
            >
              <div className="font-display text-[16px] text-muted-foreground w-7 text-center">{i + 4}</div>
              <div className="flex-1 text-[13px] font-semibold text-foreground truncate">{entry.player_name}</div>
              <div className="font-display text-[16px] text-primary">{entry.score.toLocaleString('pt-BR')}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const useRankingQuery = (table: string, gameMode?: string) =>
  useQuery({
    queryKey: ['rankings', table, gameMode],
    queryFn: async () => {
      let query = supabase.from(table as 'rankings' | 'jersey_game_rankings').select('id, player_name, score').order('score', { ascending: false }).limit(10);
      if (gameMode) query = query.eq('game_mode', gameMode);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as RankingEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

export const GameTypeRankings = () => {
  const { data: adaptiveRankings, isLoading: adaptiveLoading } = useRankingQuery('rankings', 'adaptive');
  const { data: classicRankings, isLoading: classicLoading } = useRankingQuery('rankings', 'classic');
  const { data: jerseyRankings, isLoading: jerseyLoading } = useRankingQuery('jersey_game_rankings');

  return (
    <div>
      <div className="text-center mb-2">
        <h2 className="font-display text-[30px] text-primary tracking-[0.03em]">🏆 HALL DA FAMA</h2>
        <p className="text-[13px] text-muted-foreground mt-1">Os maiores conhecedores do Fluminense</p>
      </div>

      <Tabs defaultValue="adaptive" className="mt-6">
        <TabsList className="grid w-full max-w-[400px] mx-auto grid-cols-3 bg-card border border-border shadow-sm mb-6">
          <TabsTrigger value="adaptive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Adaptivo</span>
          </TabsTrigger>
          <TabsTrigger value="classic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clássico</span>
          </TabsTrigger>
          <TabsTrigger value="jersey" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground gap-1.5">
            <Shirt className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Camisas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adaptive">
          <RankingList rankings={adaptiveRankings} isLoading={adaptiveLoading} />
        </TabsContent>
        <TabsContent value="classic">
          <RankingList rankings={classicRankings} isLoading={classicLoading} />
        </TabsContent>
        <TabsContent value="jersey">
          <RankingList rankings={jerseyRankings} isLoading={jerseyLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
