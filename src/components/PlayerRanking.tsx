
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Medal, Trophy } from "lucide-react";

interface RankingEntry {
  id: string;
  player_id: string;
  username: string;
  score: number;
  games_played: number;
  perfect_guesses: number;
  player_name: string;
}

export const PlayerRanking = () => {
  const { data: rankings = [] } = useQuery({
    queryKey: ['rankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as RankingEntry[];
    },
  });

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

  // Default ranking data if no real data is available
  const defaultRankings = [
    { id: '1', player_name: 'Braga', score: 135 },
    { id: '2', player_name: 'Fulano', score: 92 },
    { id: '3', player_name: 'Sicrano', score: 70 },
    { id: '4', player_name: 'Rodrigo Costa', score: 60 },
    { id: '5', player_name: 'João Silva', score: 55 },
    { id: '6', player_name: 'Pedro Santos', score: 50 },
    { id: '7', player_name: 'Carlos Lima', score: 45 },
    { id: '8', player_name: 'Fernando Dias', score: 40 },
    { id: '9', player_name: 'Rafael Costa', score: 35 },
    { id: '10', player_name: 'Lucas Alves', score: 30 },
  ];

  const displayRankings = rankings.length > 0 ? rankings : defaultRankings;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayRankings.map((rank, index) => (
          <div key={`${rank.id}-${index}`} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getRankIcon(index)}
                <div>
                  <div className="font-bold text-xl text-flu-grena">{rank.player_name}</div>
                  <div className="text-sm text-gray-600 font-medium">{rank.score} pontos</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-flu-grena">{rank.score}</div>
                <div className="text-sm text-gray-500 font-medium">pts</div>
              </div>
            </div>
          </div>
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
};
