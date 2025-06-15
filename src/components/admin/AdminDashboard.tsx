
import { PlayerRecognitionStats } from "./PlayerRecognitionStats";
import { GeneralStatsCards } from "./stats/GeneralStatsCards";
import { MostCorrectPlayersCard } from "./stats/MostCorrectPlayersCard";
import { MostMissedPlayersCard } from "./stats/MostMissedPlayersCard";
import { PlayerRankingCard } from "./stats/PlayerRankingCard";
import { ProgressStatsCard } from "./stats/ProgressStatsCard";
import { useAdminStats } from "@/hooks/use-admin-stats";

export const AdminDashboard = () => {
  const {
    mostCorrectPlayers,
    mostMissedPlayers,
    playerRanking,
    progressStats,
    generalStats,
    successRate
  } = useAdminStats();

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <GeneralStatsCards
        totalAttempts={generalStats?.totalAttempts || 0}
        totalSessions={generalStats?.totalSessions || 0}
        totalPlayers={generalStats?.totalPlayers || 0}
        successRate={successRate}
      />

      {/* Novo Card de Reconhecimento por Jogador */}
      <PlayerRecognitionStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MostCorrectPlayersCard players={mostCorrectPlayers} />
        <MostMissedPlayersCard players={mostMissedPlayers} />
        <PlayerRankingCard players={playerRanking} />
        <ProgressStatsCard stats={progressStats} />
      </div>
    </div>
  );
};
