import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Gamepad2, Shirt, Target } from "lucide-react";
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton";

interface RankingEntry {
  id: string;
  player_name: string;
  score: number;
}

const RankingList = ({ rankings, isLoading }: { rankings: RankingEntry[] | undefined; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <ShimmerSkeleton key={index} variant="card" />
        ))}
      </div>
    );
  }

  if (!rankings?.length) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Nenhum ranking disponível ainda. Seja o primeiro!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {rankings.map((ranking, index) => (
        <Card key={ranking.id} className="bg-card border border-border shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-warning text-warning-foreground' : 
                  index === 1 ? 'bg-neutral-300 text-foreground' : 
                  index === 2 ? 'bg-warning/60 text-warning-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-sm truncate max-w-[120px]">
                    {ranking.player_name}
                  </h3>
                  <p className="text-muted-foreground text-xs">{ranking.score} pts</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{ranking.score}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const GameTypeRankings = () => {
  const { data: classicRankings, isLoading: classicLoading } = useQuery({
    queryKey: ['rankings', 'classic'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('id, player_name, score')
        .eq('game_mode', 'classic')
        .order('score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as RankingEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: adaptiveRankings, isLoading: adaptiveLoading } = useQuery({
    queryKey: ['rankings', 'adaptive'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('id, player_name, score')
        .eq('game_mode', 'adaptive')
        .order('score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as RankingEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: jerseyRankings, isLoading: jerseyLoading } = useQuery({
    queryKey: ['rankings', 'jersey'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jersey_game_rankings')
        .select('id, player_name, score')
        .order('score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as RankingEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="mb-16">
      <div className="flex items-center justify-center mb-8">
        <Trophy className="w-8 h-8 text-warning mr-3" />
        <h2 className="text-display-title text-primary">Hall da Fama Tricolor</h2>
      </div>
      <p className="text-muted-foreground mb-8 font-body text-center">
        Os maiores conhecedores do Fluminense
      </p>

      <Tabs defaultValue="adaptive" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border shadow-sm mb-6">
          <TabsTrigger 
            value="adaptive" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground gap-2"
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Adaptivo</span>
          </TabsTrigger>
          <TabsTrigger 
            value="classic" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clássico</span>
          </TabsTrigger>
          <TabsTrigger 
            value="jersey" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground gap-2"
          >
            <Shirt className="w-4 h-4" />
            <span className="hidden sm:inline">Camisas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adaptive">
          <RankingList rankings={adaptiveRankings} isLoading={adaptiveLoading} />
        </TabsContent>

        <TabsContent value="classic">
          <RankingList rankings={classicRankings} isLoading={classicLoading} />
        </TabsContent>

        <TabsContent value="jersey">
          <RankingList rankings={jerseyRankings} isLoading={jerseyLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
