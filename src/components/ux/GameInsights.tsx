import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, TrendingUp, TrendingDown, Target, Clock, Brain } from 'lucide-react';

interface GameInsightsProps {
  score: number;
  correctGuesses: number;
  totalAttempts: number;
  averageTime?: number;
  streak: number;
  gameMode: string;
  difficulty?: string;
  className?: string;
}

export const GameInsights = ({
  score,
  correctGuesses,
  totalAttempts,
  averageTime = 0,
  streak,
  gameMode,
  difficulty,
  className = ""
}: GameInsightsProps) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    const calculatedAccuracy = totalAttempts > 0 ? (correctGuesses / totalAttempts) * 100 : 0;
    setAccuracy(calculatedAccuracy);

    // Gerar insights baseados na performance
    const newInsights: string[] = [];

    if (calculatedAccuracy >= 80) {
      newInsights.push("🎯 Excelente precisão! Você tem ótimo conhecimento dos jogadores.");
    } else if (calculatedAccuracy >= 60) {
      newInsights.push("📈 Boa performance! Continue praticando para melhorar ainda mais.");
    } else if (calculatedAccuracy >= 40) {
      newInsights.push("🎮 Você está aprendendo! Observe mais detalhes dos jogadores.");
    } else {
      newInsights.push("💡 Dica: Foque nas características físicas marcantes dos jogadores.");
    }

    if (streak >= 5) {
      newInsights.push("🔥 Sequência impressionante! Você está em grande forma!");
    } else if (streak >= 3) {
      newInsights.push("⚡ Boa sequência! Continue assim!");
    }

    if (averageTime > 0) {
      if (averageTime < 3) {
        newInsights.push("⚡ Você é muito rápido! Cuidado para não errar por pressa.");
      } else if (averageTime > 10) {
        newInsights.push("🤔 Tente confiar mais no seu primeiro instinto.");
      }
    }

    if (gameMode === "adaptive" && difficulty) {
      newInsights.push(`🎚️ Nível ${difficulty}: O jogo está se adaptando ao seu desempenho.`);
    }

    setInsights(newInsights);
  }, [score, correctGuesses, totalAttempts, averageTime, streak, gameMode, difficulty]);

  const getPerformanceLevel = () => {
    if (accuracy >= 80) return { level: 'Mestre', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (accuracy >= 60) return { level: 'Avançado', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (accuracy >= 40) return { level: 'Intermediário', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    return { level: 'Iniciante', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const performance = getPerformanceLevel();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Insights de Performance
        </CardTitle>
        <CardDescription>
          Análise do seu desempenho atual
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Nível de Performance */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Nível Atual</span>
          <Badge className={`${performance.bgColor} ${performance.color} border-0`}>
            {performance.level}
          </Badge>
        </div>

        {/* Precisão */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Precisão</span>
            </div>
            <span className="text-sm font-bold">{accuracy.toFixed(0)}%</span>
          </div>
          <Progress value={accuracy} className="h-2" />
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{correctGuesses}</div>
            <div className="text-xs text-muted-foreground">Acertos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{streak}</div>
            <div className="text-xs text-muted-foreground">Sequência</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{score}</div>
            <div className="text-xs text-muted-foreground">Pontos</div>
          </div>
        </div>

        {/* Tempo médio */}
        {averageTime > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tempo médio</span>
            </div>
            <span className="text-sm">{averageTime.toFixed(1)}s</span>
          </div>
        )}

        {/* Insights */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Insights
          </div>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                {insight}
              </div>
            ))}
          </div>
        </div>

        {/* Tendência */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2">
            {accuracy >= 70 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {accuracy >= 70 ? 'Performance crescente' : 'Foque na melhoria'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};