
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { memo, useMemo } from "react";

interface PlayerRecognitionStat {
  player_name: string;
  total_attempts: number;
  correct_attempts: number;
  recognition_rate: number;
  difficulty_level: string;
}

const PlayerStatRow = memo(({ stat }: { stat: PlayerRecognitionStat }) => {
  const getDifficultyColor = useMemo(() => {
    switch (stat.difficulty_level) {
      case 'Muito Difícil':
        return 'destructive';
      case 'Difícil':
        return 'secondary';
      case 'Médio':
        return 'outline';
      case 'Fácil':
        return 'default';
      default:
        return 'outline';
    }
  }, [stat.difficulty_level]);

  const getDifficultyIcon = useMemo(() => {
    return stat.difficulty_level === 'Muito Difícil' || stat.difficulty_level === 'Difícil' ? 
      <EyeOff className="h-3 w-3" /> : 
      <Eye className="h-3 w-3" />;
  }, [stat.difficulty_level]);

  const recognitionRateColor = useMemo(() => {
    if (stat.recognition_rate >= 70) return 'text-green-600';
    if (stat.recognition_rate >= 50) return 'text-yellow-600';
    if (stat.recognition_rate >= 30) return 'text-orange-600';
    return 'text-red-600';
  }, [stat.recognition_rate]);

  return (
    <TableRow>
      <TableCell className="font-medium">
        {stat.player_name}
      </TableCell>
      <TableCell className="text-center">
        {stat.total_attempts}
      </TableCell>
      <TableCell className="text-center">
        {stat.correct_attempts}
      </TableCell>
      <TableCell className="text-center">
        <span className={`font-semibold ${recognitionRateColor}`}>
          {stat.recognition_rate.toFixed(1)}%
        </span>
      </TableCell>
      <TableCell className="text-center">
        <Badge 
          variant={getDifficultyColor}
          className="flex items-center gap-1 w-fit mx-auto"
        >
          {getDifficultyIcon}
          {stat.difficulty_level}
        </Badge>
      </TableCell>
    </TableRow>
  );
});

PlayerStatRow.displayName = 'PlayerStatRow';

export const PlayerRecognitionStats = memo(() => {
  const { data: recognitionStats = [], isLoading, error } = useQuery({
    queryKey: ['player-recognition-stats'],
    queryFn: async (): Promise<PlayerRecognitionStat[]> => {
      console.log('📊 Buscando estatísticas de reconhecimento de jogadores...');
      
      const { data, error } = await supabase
        .from('game_attempts')
        .select('target_player_name, is_correct');
      
      if (error) {
        console.error('❌ Erro ao buscar tentativas:', error);
        throw error;
      }
      
      console.log('✅ Dados de tentativas carregados:', data?.length || 0);
      console.log('📊 Amostra dos dados:', data?.slice(0, 5));
      
      if (!data || data.length === 0) {
        console.log('⚠️ Nenhuma tentativa encontrada na tabela game_attempts');
        return [];
      }
      
      // Agrupar por nome do jogador e contar tentativas
      const playerStats = data.reduce((acc: Record<string, { total: number, correct: number }>, attempt) => {
        const playerName = attempt.target_player_name;
        if (playerName && typeof playerName === 'string') {
          if (!acc[playerName]) {
            acc[playerName] = { total: 0, correct: 0 };
          }
          acc[playerName].total++;
          if (attempt.is_correct === true) {
            acc[playerName].correct++;
          }
        }
        return acc;
      }, {});
      
      console.log('📈 Estatísticas calculadas por jogador:', playerStats);
      
      if (Object.keys(playerStats).length === 0) {
        console.log('⚠️ Nenhuma estatística válida encontrada');
        return [];
      }
      
      const result = Object.entries(playerStats)
        .map(([name, data]) => {
          const recognitionRate = data.total > 0 ? (data.correct / data.total) * 100 : 0;
          let difficultyLevel = 'Fácil';
          
          if (recognitionRate < 30) {
            difficultyLevel = 'Muito Difícil';
          } else if (recognitionRate < 50) {
            difficultyLevel = 'Difícil';
          } else if (recognitionRate < 70) {
            difficultyLevel = 'Médio';
          }
          
          return {
            player_name: name,
            total_attempts: data.total,
            correct_attempts: data.correct,
            recognition_rate: recognitionRate,
            difficulty_level: difficultyLevel
          };
        })
        .sort((a, b) => b.total_attempts - a.total_attempts);
      
      console.log('✅ Resultado final do relatório:', result.length, 'jogadores');
      console.log('📊 Top 3 jogadores:', result.slice(0, 3));
      return result;
    },
    staleTime: 30 * 1000, // 30 segundos - mais frequente para debug
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
    refetchOnWindowFocus: true,
  });

  const displayedStats = useMemo(() => recognitionStats.slice(0, 20), [recognitionStats]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Reconhecimento por Jogador
          </CardTitle>
          <CardDescription>Carregando estatísticas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('❌ Erro ao carregar estatísticas:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Reconhecimento por Jogador
          </CardTitle>
          <CardDescription>Erro ao carregar dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Erro ao carregar estatísticas de reconhecimento: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recognitionStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Reconhecimento por Jogador
          </CardTitle>
          <CardDescription>
            Taxa de acerto por jogador - quanto maior a taxa, mais fácil de reconhecer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhuma tentativa de jogo registrada ainda</p>
            <p className="text-sm">As estatísticas aparecerão quando os jogadores começarem a jogar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Reconhecimento por Jogador
        </CardTitle>
        <CardDescription>
          Taxa de acerto por jogador - quanto maior a taxa, mais fácil de reconhecer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jogador</TableHead>
                <TableHead className="text-center">Tentativas</TableHead>
                <TableHead className="text-center">Acertos</TableHead>
                <TableHead className="text-center">Taxa de Acerto</TableHead>
                <TableHead className="text-center">Dificuldade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedStats.map((stat) => (
                <PlayerStatRow key={stat.player_name} stat={stat} />
              ))}
            </TableBody>
          </Table>
        </div>
        
        {recognitionStats.length > 20 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Mostrando top 20 jogadores com mais tentativas (total: {recognitionStats.length})
          </p>
        )}
        
        {recognitionStats.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 text-center">
              Total de {recognitionStats.length} jogador{recognitionStats.length !== 1 ? 'es' : ''} com tentativas registradas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PlayerRecognitionStats.displayName = 'PlayerRecognitionStats';
