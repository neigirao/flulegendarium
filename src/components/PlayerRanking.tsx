
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
        .limit(4);
      
      if (error) throw error;
      return data as RankingEntry[];
    },
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">1</div>;
      case 1:
        return <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">2</div>;
      case 2:
        return <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">3</div>;
      default:
        return <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">{index + 1}</div>;
    }
  };

  // Default ranking data if no real data is available
  const defaultRankings = [
    { id: '1', player_name: 'Braga', score: 135 },
    { id: '2', player_name: 'Fulano', score: 92 },
    { id: '3', player_name: 'Sicrano', score: 70 },
    { id: '4', player_name: 'Rodrigo Costa', score: 60 },
  ];

  const displayRankings = rankings.length > 0 ? rankings : defaultRankings;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayRankings.map((rank, index) => (
          <div key={`${rank.id}-${index}`} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getRankIcon(index)}
                <div>
                  <div className="font-bold text-lg text-flu-grena">{rank.player_name}</div>
                  <div className="text-sm text-gray-600">{rank.score} pts</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-flu-grena">{rank.score}</div>
                <div className="text-sm text-gray-500">pts</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {rankings.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Seja o primeiro no ranking tricolor!</p>
        </div>
      )}
    </div>
  );
};
