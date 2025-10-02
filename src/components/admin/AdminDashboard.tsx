
import { PlayerPerformanceAnalysis } from "./PlayerPerformanceAnalysis";
import { GeneralStatsCards } from "./stats/GeneralStatsCards";
import { MostCorrectPlayersCard } from "./stats/MostCorrectPlayersCard";
import { MostMissedPlayersCard } from "./stats/MostMissedPlayersCard";
import { PlayerRankingCard } from "./stats/PlayerRankingCard";
import { ProgressStatsCard } from "./stats/ProgressStatsCard";
import { NewsManagement } from "./news/NewsManagement";
import { useAdminStats } from "@/hooks/use-admin-stats";
import { memo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Newspaper } from "lucide-react";

export const AdminDashboard = memo(() => {
  const {
    mostCorrectPlayers,
    mostMissedPlayers,
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="stats" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 size={16} />
          Estatísticas
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

        {/* Análise de Performance por Jogador - Componente principal */}
        <PlayerPerformanceAnalysis />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MostCorrectPlayersCard players={mostCorrectPlayers} />
          <MostMissedPlayersCard players={mostMissedPlayers} />
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
