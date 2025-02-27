
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Medal } from "lucide-react";

interface RankingEntry {
  player_id: string;
  username: string;
  score: number;
  games_played: number;
  perfect_guesses: number;
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
    <div className="bg-white/80 rounded-lg p-4 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-flu-grena mb-4">Top 5 Jogadores</h3>
      <div className="space-y-2">
        {rankings.map((rank, index) => (
          <div key={rank.player_id} className="flex items-center gap-2">
            {index === 0 && <Medal className="text-yellow-500" size={20} />}
            {index === 1 && <Medal className="text-gray-400" size={20} />}
            {index === 2 && <Medal className="text-amber-600" size={20} />}
            <span className="font-medium">{rank.username}</span>
            <span className="ml-auto">{rank.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};
