
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Trophy, Target, Calendar, TrendingUp, Award, Clock, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserSpecialties } from '@/hooks/use-user-specialties';
import { useUserAnalytics } from '@/hooks/use-user-analytics';

export const UserProfile = () => {
  const { user, signOut } = useAuth();

  // Buscar histórico de jogos do usuário
  const { data: gameHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['user-game-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_game_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Buscar conquistas do usuário
  const { data: achievements = [], isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Buscar ranking do usuário
  const { data: userRankings = [], isLoading: isLoadingRankings } = useQuery({
    queryKey: ['user-rankings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { strengths, weaknesses } = useUserSpecialties(user?.id || '');
  const { timeSeriesData, socialComparison, insights } = useUserAnalytics();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Faça login para ver seu perfil</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular estatísticas
  const totalGames = gameHistory.length + userRankings.length;
  const totalScore = [...gameHistory, ...userRankings].reduce((sum, game) => sum + (game.score || 0), 0);
  const bestScore = Math.max(
    ...gameHistory.map(g => g.score || 0),
    ...userRankings.map(r => r.score || 0),
    0
  );
  const totalCorrectGuesses = gameHistory.reduce((sum, game) => sum + (game.correct_guesses || 0), 0);
  const totalAttempts = gameHistory.reduce((sum, game) => sum + (game.total_attempts || 0), 0);
  const accuracyRate = totalAttempts > 0 ? (totalCorrectGuesses / totalAttempts) * 100 : 0;
  const maxStreak = Math.max(...gameHistory.map(g => g.max_streak || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="bg-white">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-flu-grena rounded-full flex items-center justify-center flex-shrink-0">
                <User size={24} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-flu-grena truncate">
                  {user.user_metadata?.full_name || user.email}
                </h2>
                <p className="text-gray-600 text-sm truncate">{user.email}</p>
                <p className="text-xs text-gray-500">
                  Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 bg-white">
            {/* Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-flu-verde/10 rounded-lg border border-flu-verde/20">
                <Trophy className="w-8 h-8 text-flu-verde flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Jogos</p>
                  <p className="text-xl font-bold text-flu-grena">{totalGames}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-flu-grena/10 rounded-lg border border-flu-grena/20">
                <Target className="w-8 h-8 text-flu-grena flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Melhor Pontuação</p>
                  <p className="text-xl font-bold text-flu-grena">{bestScore}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Precisão</p>
                  <p className="text-xl font-bold text-blue-600">{accuracyRate.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Star className="w-8 h-8 text-orange-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">Maior Sequência</p>
                  <p className="text-xl font-bold text-orange-600">{maxStreak}</p>
                </div>
              </div>
            </div>

            {/* Pontos Fortes e Fracos */}
            {(strengths.length > 0 || weaknesses.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {strengths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-flu-verde">
                        <Award className="w-5 h-5" />
                        Seus Pontos Fortes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {strengths.slice(0, 5).map((player, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <span className="text-sm font-medium">{player.player_name}</span>
                            <span className="text-sm text-green-600 font-semibold">
                              {player.success_rate.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {weaknesses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <Target className="w-5 h-5" />
                        Áreas para Melhorar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {weaknesses.slice(0, 5).map((player, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                            <span className="text-sm font-medium">{player.player_name}</span>
                            <span className="text-sm text-red-600 font-semibold">
                              {player.success_rate.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Conquistas */}
            {achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-flu-grena">
                    <Award className="w-5 h-5" />
                    Conquistas ({achievements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {achievements.slice(0, 6).map((achievement, index) => (
                      <div key={index} className="p-3 bg-flu-grena/5 rounded-lg border border-flu-grena/20">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-flu-grena" />
                          <span className="text-sm font-medium">{achievement.achievement_id}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.unlocked_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico Recente */}
            {gameHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-flu-grena">
                    <Clock className="w-5 h-5" />
                    Histórico Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gameHistory.slice(0, 5).map((game, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Pontuação: {game.score}</p>
                          <p className="text-xs text-gray-500">
                            {game.correct_guesses}/{game.total_attempts} acertos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(game.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          {game.game_duration && (
                            <p className="text-xs text-gray-500">
                              {Math.floor(game.game_duration / 60)}min {game.game_duration % 60}s
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comparação Social */}
            {socialComparison && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-flu-grena">
                    <TrendingUp className="w-5 h-5" />
                    Sua Posição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-flu-verde/10 rounded-lg">
                      <p className="text-2xl font-bold text-flu-verde">#{socialComparison.rank}</p>
                      <p className="text-sm text-gray-600">Posição Geral</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{socialComparison.percentile}%</p>
                      <p className="text-sm text-gray-600">Melhor que</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{socialComparison.total_players}</p>
                      <p className="text-sm text-gray-600">Total de Jogadores</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={signOut}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
