import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface LoggedUser {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  total_games: number;
  best_score: number;
  last_played: string;
  total_attempts: number;
  correct_guesses: number;
  accuracy_rate: number;
}

interface UserActivityAccumulator {
  rankingCount: number;
  historyCount: number;
  rankingBestScore: number;
  historyBestScore: number;
  rankingLastPlayed: string | null;
  historyLastPlayed: string | null;
  totalAttempts: number;
  correctGuesses: number;
}

const getLatestDateISO = (...dates: Array<string | null>): string | null => {
  const validDates = dates.filter((date): date is string => Boolean(date));
  if (validDates.length === 0) {
    return null;
  }

  const latestTimestamp = Math.max(...validDates.map((date) => new Date(date).getTime()));
  return new Date(latestTimestamp).toISOString();
};

export const useLoggedUsers = () => {
  const { data: loggedUsers = [], isLoading } = useQuery({
    queryKey: ["logged-users"],
    queryFn: async (): Promise<LoggedUser[]> => {
      try {
        logger.info("Iniciando busca de usuários logados", "LOGGED_USERS");

        const [profilesResult, rankingsResult, gameHistoryResult] = await Promise.all([
          supabase.from("profiles").select("id, full_name, email, avatar_url, created_at"),
          supabase
            .from("rankings")
            .select("user_id, score, created_at")
            .not("user_id", "is", null),
          supabase
            .from("user_game_history")
            .select("user_id, score, total_attempts, correct_guesses, created_at"),
        ]);

        if (profilesResult.error) {
          logger.error("Erro ao buscar perfis", "LOGGED_USERS", profilesResult.error);
          throw profilesResult.error;
        }

        if (rankingsResult.error) {
          logger.error("Erro ao buscar rankings", "LOGGED_USERS", rankingsResult.error);
          throw rankingsResult.error;
        }

        if (gameHistoryResult.error) {
          logger.error("Erro ao buscar histórico de jogos", "LOGGED_USERS", gameHistoryResult.error);
          throw gameHistoryResult.error;
        }

        const profiles = profilesResult.data ?? [];
        const rankings = rankingsResult.data ?? [];
        const gameHistory = gameHistoryResult.data ?? [];

        logger.info(`Total de perfis encontrados: ${profiles.length}`, "LOGGED_USERS");
        logger.info(`Rankings de usuários logados encontrados: ${rankings.length}`, "LOGGED_USERS");
        logger.info(`Histórico de jogos encontrado: ${gameHistory.length}`, "LOGGED_USERS");

        if (profiles.length === 0) {
          logger.warn("Nenhum perfil encontrado na tabela profiles", "LOGGED_USERS");
          return [];
        }

        const activityByUser = new Map<string, UserActivityAccumulator>();

        const ensureAccumulator = (userId: string): UserActivityAccumulator => {
          const existing = activityByUser.get(userId);
          if (existing) {
            return existing;
          }

          const created: UserActivityAccumulator = {
            rankingCount: 0,
            historyCount: 0,
            rankingBestScore: 0,
            historyBestScore: 0,
            rankingLastPlayed: null,
            historyLastPlayed: null,
            totalAttempts: 0,
            correctGuesses: 0,
          };

          activityByUser.set(userId, created);
          return created;
        };

        for (const ranking of rankings) {
          if (!ranking.user_id) {
            continue;
          }

          const accumulator = ensureAccumulator(ranking.user_id);
          accumulator.rankingCount += 1;
          accumulator.rankingBestScore = Math.max(accumulator.rankingBestScore, ranking.score ?? 0);
          accumulator.rankingLastPlayed = getLatestDateISO(accumulator.rankingLastPlayed, ranking.created_at);
        }

        for (const game of gameHistory) {
          const accumulator = ensureAccumulator(game.user_id);
          accumulator.historyCount += 1;
          accumulator.historyBestScore = Math.max(accumulator.historyBestScore, game.score ?? 0);
          accumulator.totalAttempts += game.total_attempts ?? 0;
          accumulator.correctGuesses += game.correct_guesses ?? 0;
          accumulator.historyLastPlayed = getLatestDateISO(accumulator.historyLastPlayed, game.created_at);
        }

        const loggedUsersData = profiles
          .map((profile): LoggedUser | null => {
            const activity = activityByUser.get(profile.id);
            if (!activity) {
              return null;
            }

            const bestScore = Math.max(activity.rankingBestScore, activity.historyBestScore);

            // O ranking normalmente é derivado das partidas. Para evitar inflar o total,
            // consideramos histórico como fonte primária e usamos ranking apenas em fallback.
            const totalGames = activity.historyCount > 0 ? activity.historyCount : activity.rankingCount;

            const lastPlayed =
              getLatestDateISO(activity.historyLastPlayed, activity.rankingLastPlayed) ?? profile.created_at;

            const accuracyRate =
              activity.totalAttempts > 0
                ? Math.round((activity.correctGuesses / activity.totalAttempts) * 10000) / 100
                : 0;

            return {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url,
              created_at: profile.created_at,
              total_games: totalGames,
              best_score: bestScore,
              last_played: lastPlayed,
              total_attempts: activity.totalAttempts,
              correct_guesses: activity.correctGuesses,
              accuracy_rate: accuracyRate,
            };
          })
          .filter((user): user is LoggedUser => user !== null)
          .sort((a, b) => new Date(b.last_played).getTime() - new Date(a.last_played).getTime());

        logger.info(
          `Total de usuários logados ativos processados: ${loggedUsersData.length}`,
          "LOGGED_USERS",
        );

        return loggedUsersData;
      } catch (error) {
        logger.error("Erro geral na consulta de usuários logados", "LOGGED_USERS", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { loggedUsers, isLoading };
};
