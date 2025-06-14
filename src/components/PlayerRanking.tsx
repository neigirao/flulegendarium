
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Medal } from "lucide-react";

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
        .limit(5);
      
      if (error) throw error;
      return data as RankingEntry[];
    },
  });

  return (
    <div className="bg-white/80 rounded-lg p-6 backdrop-blur-sm max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-flu-grena mb-4 text-center">Top 5 Tricolores</h3>
      <div className="space-y-3">
        {rankings.map((rank, index) => (
          <div key={`${rank.id}-${rank.player_id}-${index}`} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8">
              {index === 0 && <Medal className="text-yellow-500" size={20} />}
              {index === 1 && <Medal className="text-gray-400" size={20} />}
              {index === 2 && <Medal className="text-amber-600" size={20} />}
              {index > 2 && <span className="font-bold text-flu-grena">#{index + 1}</span>}
            </div>
            <div className="flex-1">
              <div className="font-medium text-flu-grena">{rank.player_name}</div>
              <div className="text-sm text-gray-600">{rank.score} pontos</div>
            </div>
          </div>
        ))}
      </div>
      {rankings.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Nenhum ranking ainda
        </div>
      )}
    </div>
  );
};
