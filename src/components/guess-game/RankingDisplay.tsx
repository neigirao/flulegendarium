import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";
import { useVirtualizedRanking } from "@/hooks/use-virtualized-ranking";
import { LoadingSkeleton, InlineError } from "@/components/ui/loading-states";

interface RankingItem {
  id: string;
  player_name: string;
  score: number;
  games_played: number;
  user_id: string | null;
  created_at: string;
}

interface VirtualizedRankingItem extends RankingItem {
  index: number;
}

export const RankingDisplay = () => {
  const { data: rankings = [], isLoading, error } = useQuery({
    queryKey: ['rankings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(100);
      return data || [];
    },
    staleTime: 30000,
  });

  // Add index to rankings for virtualization
  const rankingsWithIndex: VirtualizedRankingItem[] = rankings.map((ranking, index) => ({
    ...ranking,
    index
  }));

  const { visibleItems, totalHeight, offset } = useVirtualizedRanking(rankingsWithIndex);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoadingSkeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <InlineError 
        message="Erro ao carregar ranking"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="ranking-container relative overflow-auto" style={{ height: '400px' }}>
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offset}px)` }}>
          {visibleItems.map((ranking) => (
            <div
              key={ranking.id}
              className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 text-center font-medium text-gray-600">
                  {ranking.index + 1}
                </span>
                <span className="font-medium text-gray-800">
                  {ranking.player_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-flu-grena" />
                <span className="font-bold text-flu-grena">
                  {ranking.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
