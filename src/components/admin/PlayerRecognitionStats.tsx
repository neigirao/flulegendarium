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
  const { data: recognitionStats = [], isLoading } = useQuery({
    queryKey: ['player-recognition-stats'],
    queryFn: async (): Promise<PlayerRecognitionStat[]> => {
      const { data, error } = await supabase
        .from('game_attempts')
        .select('target_player_name, is_correct');
      
      if (error) throw error;
      
      const stats = data.reduce((acc: Record<string, { total: number, correct: number }>, attempt) => {
        if (!acc[attempt.target_player_name]) {
          acc[attempt.target_player_name] = { total: 0, correct: 0 };
        }
        acc[attempt.target_player_name].total++;
        if (attempt.is_correct) {
          acc[attempt.target_player_name].correct++;
        }
        return acc;
      }, {});
      
      return Object.entries(stats)
        .map(([name, data]) => {
          const recognitionRate = (data.correct / data.total) * 100;
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
    },
  });

  const displayedStats = useMemo(() => recognitionStats.slice(0, 15), [recognitionStats]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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
  };

  const getDifficultyIcon = (difficulty: string) => {
    return difficulty === 'Muito Difícil' || difficulty === 'Difícil' ? 
      <EyeOff className="h-3 w-3" /> : 
      <Eye className="h-3 w-3" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reconhecimento por Jogador</CardTitle>
          <CardDescription>Carregando estatísticas...</CardDescription>
        </CardHeader>
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
        
        {recognitionStats.length > 15 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Mostrando top 15 jogadores com mais tentativas
          </p>
        )}
      </CardContent>
    </Card>
  );
});

PlayerRecognitionStats.displayName = 'PlayerRecognitionStats';
