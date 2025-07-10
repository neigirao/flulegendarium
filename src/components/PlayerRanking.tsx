
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { InstagramProfile } from "@/components/ui/instagram-profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        return <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>;
      case 1:
        return <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>;
      case 2:
        return <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>;
      default:
        return <div className="w-10 h-10 bg-flu-grena rounded-full flex items-center justify-center text-white font-bold">{index + 1}</div>;
    }
  };

  const isGuest = !rank.user_id;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getRankIcon(index)}
          <div>
            <div className="font-bold text-xl text-flu-grena flex items-center gap-2">
              <InstagramProfile 
                playerName={rank.player_name}
                avatarSize="md"
                showLink={true}
                className="text-xl"
              />
              {isGuest && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Convidado
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 font-medium">{rank.score} pontos</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-flu-grena">{rank.score}</div>
          <div className="text-sm text-gray-500 font-medium">pts</div>
        </div>
      </div>
    </div>
  );
});

RankingItem.displayName = 'RankingItem';

// Hook para buscar as décadas disponíveis
const useDecades = () => {
  return useQuery({
    queryKey: ['decades'],
    queryFn: async () => {
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('decades')
        .not('decades', 'is', null);
      
      if (playersError) throw playersError;
      
      const decades = new Set<string>();
      playersData?.forEach(player => {
        if (player.decades && Array.isArray(player.decades)) {
          player.decades.forEach((decade: string) => decades.add(decade));
        }
      });
      
      return Array.from(decades).sort();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar rankings por década
const useRankingsByDecade = (decade?: string) => {
  return useQuery({
    queryKey: ['rankings', decade],
    queryFn: async () => {
      console.log('🏆 Buscando ranking para a década:', decade || 'todas');
      
      if (!decade || decade === 'all') {
        // Buscar todos os rankings
        const { data, error } = await supabase
          .from('rankings')
          .select('*')
          .order('score', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        return data as RankingEntry[];
      }
      
      // Buscar rankings filtrados por década
      // Primeiro, buscar jogadores da década específica
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('name')
        .contains('decades', [decade]);
      
      if (playersError) throw playersError;
      
      const playerNames = playersData.map(p => p.name);
      
      if (playerNames.length === 0) {
        return [];
      }
      
      // Agora buscar rankings desses jogadores
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .in('player_name', playerNames)
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      console.log('✅ Rankings carregados para', decade, ':', data?.length || 0);
      return data as RankingEntry[];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

// Componente para renderizar lista de rankings
const RankingList = ({ decade }: { decade?: string }) => {
  const { data: rankings = [], isLoading, error } = useRankingsByDecade(decade);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl p-6 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Erro no ranking:', error);
    return (
      <div className="text-center text-gray-500 py-8">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Erro ao carregar ranking</p>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
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
