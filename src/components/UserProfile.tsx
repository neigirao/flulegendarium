
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getUserStats, getUserGameHistory } from "@/services/gameHistoryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";

export const UserProfile = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => getUserStats(user!.id),
    enabled: !!user,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['user-history', user?.id],
    queryFn: () => getUserGameHistory(user!.id, 5),
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-flu-grena mb-2">
          Meu Perfil
        </h1>
        <p className="text-gray-600">
          {user.user_metadata?.full_name || user.email}
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-flu-grena mx-auto mb-2" />
              <p className="text-2xl font-bold text-flu-grena">{stats.bestScore}</p>
              <p className="text-sm text-gray-600">Melhor Pontuação</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-flu-verde mx-auto mb-2" />
              <p className="text-2xl font-bold text-flu-verde">{stats.accuracyRate}%</p>
              <p className="text-sm text-gray-600">Taxa de Acerto</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{stats.totalGames}</p>
              <p className="text-sm text-gray-600">Jogos Jogados</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{stats.averageScore}</p>
              <p className="text-sm text-gray-600">Média de Pontos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-flu-grena">Histórico Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((game, index) => (
                <div key={game.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Jogo #{index + 1}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(game.created_at!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-flu-grena">{game.score} pontos</p>
                    <p className="text-sm text-gray-600">
                      {game.correct_guesses}/{game.total_attempts} acertos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
