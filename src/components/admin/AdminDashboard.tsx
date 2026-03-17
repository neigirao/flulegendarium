import { PlayerPerformanceAnalysis } from "./PlayerPerformanceAnalysis";
import { GeneralStatsCards } from "./stats/GeneralStatsCards";
import { PlayerRankingCard } from "./stats/PlayerRankingCard";
import { ProgressStatsCard } from "./stats/ProgressStatsCard";
import { NewsManagement } from "./news/NewsManagement";
import { useAdminStats } from "@/hooks/use-admin-stats";
import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Newspaper, Shirt } from "lucide-react";
import { JerseyStatsOverview } from "./stats/JerseyStatsOverview";

export const AdminDashboard = memo(() => {
  const {
    playerRanking,
    progressStats,
    generalStats,
    successRate,
    isLoading
  } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="stats" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 max-w-lg">
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 size={16} />
          Estatísticas
        </TabsTrigger>
        <TabsTrigger value="jerseys" className="flex items-center gap-2">
          <Shirt size={16} />
          Camisas
        </TabsTrigger>
        <TabsTrigger value="news" className="flex items-center gap-2">
          <Newspaper size={16} />
          Notícias
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stats" className="space-y-6">
        {/* Estatísticas Gerais */}
        <GeneralStatsCards
          totalAttempts={generalStats?.totalAttempts || 0}
          totalSessions={generalStats?.totalSessions || 0}
          totalPlayers={generalStats?.totalPlayers || 0}
          successRate={successRate}
        />

        {/* Análise de Performance por Jogador - Componente principal consolidado */}
        <PlayerPerformanceAnalysis />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlayerRankingCard players={playerRanking} />
          <ProgressStatsCard stats={progressStats} />
        </div>
      </TabsContent>

      <TabsContent value="news">
        <NewsManagement />
      </TabsContent>
    </Tabs>
  );
});

AdminDashboard.displayName = 'AdminDashboard';
