
import { PlayerRecognitionStats } from "./PlayerRecognitionStats";
import { PlayerPerformanceAnalysis } from "./PlayerPerformanceAnalysis";
import { GeneralStatsCards } from "./stats/GeneralStatsCards";
import { MostCorrectPlayersCard } from "./stats/MostCorrectPlayersCard";
import { MostMissedPlayersCard } from "./stats/MostMissedPlayersCard";
import { PlayerRankingCard } from "./stats/PlayerRankingCard";
import { ProgressStatsCard } from "./stats/ProgressStatsCard";
import { useAdminStats } from "@/hooks/use-admin-stats";
import { memo } from "react";

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
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <GeneralStatsCards
        totalAttempts={generalStats?.totalAttempts || 0}
        totalSessions={generalStats?.totalSessions || 0}
        totalPlayers={generalStats?.totalPlayers || 0}
        successRate={successRate}
      />

      {/* Nova Análise de Performance por Jogador */}
      <PlayerPerformanceAnalysis />

      {/* Card de Reconhecimento por Jogador (mantido para compatibilidade) */}
      <PlayerRecognitionStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MostCorrectPlayersCard players={mostCorrectPlayers} />
        <MostMissedPlayersCard players={mostMissedPlayers} />
        <PlayerRankingCard players={playerRanking} />
        <ProgressStatsCard stats={progressStats} />
      </div>
    </div>
  );
});

AdminDashboard.displayName = 'AdminDashboard';
