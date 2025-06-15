
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";
import { memo, useMemo } from "react";

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
              {rank.player_name}
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

export const PlayerRanking = memo(() => {
  const { data: rankings = [], isLoading, error } = useQuery({
    queryKey: ['rankings-home'],
    queryFn: async () => {
      console.log('🏆 Buscando ranking para a home...');
      
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('❌ Erro ao buscar rankings:', error);
        throw error;
      }
      
      console.log('✅ Rankings carregados:', data?.length || 0);
      return data as RankingEntry[];
    },
    staleTime: 30 * 1000, // 30 seconds - mais frequente para atualizações rápidas
    refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
    refetchOnWindowFocus: true,
  });

  // Default ranking data if no real data is available
  const defaultRankings: RankingEntry[] = useMemo(() => [
    { id: '1', player_name: 'Braga', score: 135, games_played: 1, user_id: null, created_at: '' },
    { id: '2', player_name: 'Fulano', score: 92, games_played: 1, user_id: null, created_at: '' },
    { id: '3', player_name: 'Sicrano', score: 70, games_played: 1, user_id: null, created_at: '' },
    { id: '4', player_name: 'Rodrigo Costa', score: 60, games_played: 1, user_id: null, created_at: '' },
    { id: '5', player_name: 'João Silva', score: 55, games_played: 1, user_id: null, created_at: '' },
    { id: '6', player_name: 'Pedro Santos', score: 50, games_played: 1, user_id: null, created_at: '' },
    { id: '7', player_name: 'Carlos Lima', score: 45, games_played: 1, user_id: null, created_at: '' },
    { id: '8', player_name: 'Fernando Dias', score: 40, games_played: 1, user_id: null, created_at: '' },
    { id: '9', player_name: 'Rafael Costa', score: 35, games_played: 1, user_id: null, created_at: '' },
    { id: '10', player_name: 'Lucas Alves', score: 30, games_played: 1, user_id: null, created_at: '' },
  ], []);

  const displayRankings = useMemo(() => 
    rankings.length > 0 ? rankings : defaultRankings,
    [rankings, defaultRankings]
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl p-6 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Erro no ranking:', error);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayRankings.map((rank, index) => (
          <RankingItem key={`${rank.id}-${index}`} rank={rank} index={index} />
        ))}
      </div>
      
      {rankings.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Seja o primeiro no ranking tricolor!</p>
        </div>
      )}
    </div>
  );
});

PlayerRanking.displayName = 'PlayerRanking';
