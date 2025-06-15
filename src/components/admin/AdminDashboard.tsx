import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Users, TrendingUp } from "lucide-react";
import { PlayerRecognitionStats } from "./PlayerRecognitionStats";

interface PlayerStats {
  player_name: string;
  target_player_name: string;
  correct_count: number;
  total_attempts: number;
  success_rate: number;
}

interface PlayerProgressStats {
  step: number;
  count: number;
}

interface MostMissedPlayer {
  player_name: string;
  missed_count: number;
  total_attempts: number;
  miss_rate: string;
}

export const AdminDashboard = () => {
  // Jogadores mais acertados
  const { data: mostCorrectPlayers = [] } = useQuery({
    queryKey: ['most-correct-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_attempts')
        .select('target_player_name')
        .eq('is_correct', true);
      
      if (error) throw error;
      
      const counts = data.reduce((acc: Record<string, number>, attempt) => {
        acc[attempt.target_player_name] = (acc[attempt.target_player_name] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(counts)
        .map(([name, count]) => ({ player_name: name, correct_count: count as number }))
        .sort((a, b) => b.correct_count - a.correct_count)
        .slice(0, 10);
    },
  });

  // Jogadores mais errados
  const { data: mostMissedPlayers = [] } = useQuery({
    queryKey: ['most-missed-players'],
    queryFn: async (): Promise<MostMissedPlayer[]> => {
      const { data, error } = await supabase
        .from('game_attempts')
        .select('target_player_name, is_correct');
      
      if (error) throw error;
      
      const stats = data.reduce((acc: Record<string, { total: number, missed: number }>, attempt) => {
        if (!acc[attempt.target_player_name]) {
          acc[attempt.target_player_name] = { total: 0, missed: 0 };
        }
        acc[attempt.target_player_name].total++;
        if (!attempt.is_correct) {
          acc[attempt.target_player_name].missed++;
        }
        return acc;
      }, {});
      
      return Object.entries(stats)
        .map(([name, data]) => ({
          player_name: name,
          missed_count: data.missed,
          total_attempts: data.total,
          miss_rate: (data.missed / data.total * 100).toFixed(1)
        }))
        .sort((a, b) => b.missed_count - a.missed_count)
        .slice(0, 10);
    },
  });

  // Ranking de jogadores
  const { data: playerRanking = [] } = useQuery({
    queryKey: ['player-ranking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Estatísticas de progresso (quantas pessoas chegaram até X jogadores)
  const { data: progressStats = [] } = useQuery({
    queryKey: ['progress-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('total_correct');
      
      if (error) throw error;
      
      const stepCounts = data.reduce((acc: Record<number, number>, session) => {
        const step = session.total_correct;
        acc[step] = (acc[step] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(stepCounts)
        .map(([step, count]) => ({ step: parseInt(step), count }))
        .sort((a, b) => a.step - b.step);
    },
  });

  // Estatísticas gerais
  const { data: generalStats } = useQuery({
    queryKey: ['general-stats'],
    queryFn: async () => {
      const [attemptsResult, sessionsResult, playersResult] = await Promise.all([
        supabase.from('game_attempts').select('*', { count: 'exact' }),
        supabase.from('game_sessions').select('*', { count: 'exact' }),
        supabase.from('players').select('*', { count: 'exact' })
      ]);
      
      return {
        totalAttempts: attemptsResult.count || 0,
        totalSessions: sessionsResult.count || 0,
        totalPlayers: playersResult.count || 0,
        correctAttempts: attemptsResult.data?.filter(a => a.is_correct).length || 0
      };
    },
  });

  const successRate = generalStats?.totalAttempts 
    ? ((generalStats.correctAttempts / generalStats.totalAttempts) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Jogadas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats?.totalAttempts || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões de Jogo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats?.totalSessions || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Jogadores</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats?.totalPlayers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Novo Card de Reconhecimento por Jogador */}
      <PlayerRecognitionStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Jogadores Mais Acertados</CardTitle>
            <CardDescription>Top 10 jogadores com mais acertos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mostCorrectPlayers.map((player, index) => (
                <div key={player.player_name} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">#{index + 1} {player.player_name}</span>
                  <span className="text-green-600 font-bold">{player.correct_count} acertos</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jogadores Mais Difíceis</CardTitle>
            <CardDescription>Top 10 jogadores com mais erros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mostMissedPlayers.map((player, index) => (
                <div key={player.player_name} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">#{index + 1} {player.player_name}</span>
                  <span className="text-red-600 font-bold">{player.missed_count} erros ({player.miss_rate}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking de Jogadores</CardTitle>
            <CardDescription>Top 10 melhores pontuações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {playerRanking.map((player, index) => (
                <div key={player.id} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">#{index + 1} {player.player_name}</span>
                  <span className="text-flu-grena font-bold">{player.score} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresso dos Jogadores</CardTitle>
            <CardDescription>Quantas pessoas chegaram até X jogadores corretos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {progressStats.map((stat) => (
                <div key={stat.step} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{stat.step} jogador(es) correto(s)</span>
                  <span className="text-blue-600 font-bold">{stat.count} pessoa(s)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
