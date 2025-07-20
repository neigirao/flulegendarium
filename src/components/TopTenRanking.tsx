import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RankingEntry {
  id: string;
  player_name: string;
  score: number;
  games_played: number;
  user_id: string | null;
  created_at: string;
}

const TopTenRanking = () => {
  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ['top-10-rankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as RankingEntry[];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-flu-dourado'; // Ouro para o 1º lugar
      case 1:
        return 'bg-flu-verde'; // Verde para o 2º lugar
      case 2:
        return 'bg-flu-grena'; // Grená para o 3º lugar
      default:
        return 'bg-gray-500'; // Cinza para os demais
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="text-center text-white/80 py-8">
        <p className="text-lg">Nenhum ranking disponível ainda.</p>
        <p className="text-sm mt-2">Seja o primeiro a pontuar!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {rankings.map((rank, index) => (
        <div key={rank.id} className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${getRankColor(index)} rounded-full flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">{index + 1}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{rank.player_name}</h3>
                <p className="text-gray-600">{rank.score} pontos</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{rank.score}</div>
              <div className="text-gray-600">pontos</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopTenRanking;