import { Trophy } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { InstagramProfile } from "@/components/ui/instagram-profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDecades, useOptimizedQuery } from "@/hooks/use-optimized-queries";
import { supabase } from "@/integrations/supabase/client";
import { SkeletonLoader } from "@/components/performance/SkeletonLoader";

interface RankingEntry {
  id: string;
  player_name: string;
  score: number;
  games_played: number;
  user_id: string | null;
  created_at: string;
}

const RankingItem = memo(({ rank, index }: { rank: RankingEntry; index: number }) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center text-warning-foreground font-bold text-lg">1</div>;
      case 1:
        return <div className="w-10 h-10 bg-neutral-400 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">2</div>;
      case 2:
        return <div className="w-10 h-10 bg-warning/80 rounded-full flex items-center justify-center text-warning-foreground font-bold text-lg">3</div>;
      default:
        return <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">{index + 1}</div>;
    }
  };

  const isGuest = !rank.user_id;

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getRankIcon(index)}
          <div>
            <div className="font-bold text-xl text-primary flex items-center gap-2">
              <InstagramProfile 
                playerName={rank.player_name}
                avatarSize="md"
                showLink={true}
                className="text-xl"
              />
              {isGuest && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  Convidado
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground font-medium">{rank.score} pontos</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-primary">{rank.score}</div>
          <div className="text-sm text-muted-foreground font-medium">pts</div>
        </div>
      </div>
    </div>
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