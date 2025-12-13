import { Trophy } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { InstagramProfile } from "@/components/ui/instagram-profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDecades, useOptimizedQuery } from "@/hooks/use-optimized-queries";
import { supabase } from "@/integrations/supabase/client";
import { SkeletonLoader } from "@/components/performance/SkeletonLoader";
import { PodiumRank } from "@/components/ui/podium-rank";

interface RankingEntry {
  id: string;
  player_name: string;
  score: number;
  games_played: number;
  user_id: string | null;
  created_at: string;
}

const RankingItem = memo(({ rank, index }: { rank: RankingEntry; index: number }) => {
  return (
    <PodiumRank
      rank={index + 1}
      playerName={rank.player_name}
      score={rank.score}
      isGuest={!rank.user_id}
      avatarSlot={
        <InstagramProfile 
          playerName={rank.player_name}
          avatarSize="md"
          showLink={true}
          className={index < 3 ? "text-xl font-display" : "text-lg"}
        />
      }
    />
  );
});

RankingItem.displayName = 'RankingItem';

// Hook para buscar rankings por década - otimizado
const useRankingsByDecade = (decade?: string) => {
  return useOptimizedQuery(
    ['rankings-optimized', decade || 'all'],
    async () => {
      if (!decade || decade === 'all') {
        const { data, error } = await supabase
          .from('rankings')
          .select('*')
          .order('score', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        return data as RankingEntry[];
      }
      
      // Query otimizada: buscar rankings com join para filtrar por década
      const { data, error } = await supabase
        .from('rankings')
        .select(`
          id,
          player_name,
          score,
          games_played,
          user_id,
          created_at,
          players!inner(decades)
        `)
        .contains('players.decades', [decade])
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        player_name: item.player_name,
        score: item.score,
        games_played: item.games_played,
        user_id: item.user_id,
        created_at: item.created_at
      })) as RankingEntry[];
    },
    { 
      staleTime: 2 * 60 * 1000,
      cacheTime: 10 * 60 * 1000
    }
  );
};

// Componente para renderizar lista de rankings
const RankingList = ({ decade }: { decade?: string }) => {
  const { data: rankings = [], isLoading, error } = useRankingsByDecade(decade);

  if (isLoading) {
    return <SkeletonLoader type="ranking" rows={10} />;
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Erro ao carregar ranking</p>
        <p className="text-sm mt-2 text-muted-foreground/70">Tente novamente em alguns instantes</p>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">
          {decade && decade !== 'all' 
            ? `Nenhum ranking encontrado para a década ${decade}` 
            : 'Seja o primeiro no ranking tricolor!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rankings.map((rank, index) => (
        <RankingItem key={`${rank.id}-${index}`} rank={rank} index={index} />
      ))}
    </div>
  );
};

export const PlayerRanking = memo(() => {
  const { data: decades = [] } = useDecades();
  const [activeTab, setActiveTab] = useState('all');

  // Ordenar décadas para exibir
  const sortedDecades = useMemo(() => {
    return decades.sort((a, b) => {
      const numA = parseInt(a.replace('s', ''));
      const numB = parseInt(b.replace('s', ''));
      return numA - numB;
    });
  }, [decades]);

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-9 mb-6">
          <TabsTrigger value="all" className="text-xs">Geral</TabsTrigger>
          {sortedDecades.map((decade) => (
            <TabsTrigger key={decade} value={decade} className="text-xs">
              {decade}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <RankingList />
        </TabsContent>

        {sortedDecades.map((decade) => (
          <TabsContent key={decade} value={decade} className="mt-0">
            <RankingList decade={decade} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
});

PlayerRanking.displayName = 'PlayerRanking';