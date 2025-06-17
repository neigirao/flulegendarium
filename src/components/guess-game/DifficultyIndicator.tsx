
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Zap, Brain, Flame } from "lucide-react";

interface DifficultyIndicatorProps {
  currentDifficulty: 'muito_facil' | 'facil' | 'medio' | 'dificil' | 'muito_dificil';
  sessionStats: {
    accuracy: number;
    totalAttempts: number;
    correctAnswers: number;
    streak: number;
  };
  showDetails?: boolean;
}

export const DifficultyIndicator = ({ 
  currentDifficulty, 
  sessionStats, 
  showDetails = false 
}: DifficultyIndicatorProps) => {
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'muito_facil':
        return {
          label: 'Muito Fácil',
          color: 'bg-green-500',
          icon: Target,
          variant: 'default' as const,
          description: 'Jogadores icônicos e bem conhecidos'
        };
      case 'facil':
        return {
          label: 'Fácil',
          color: 'bg-blue-500',
          icon: Zap,
          variant: 'secondary' as const,
          description: 'Jogadores populares e reconhecíveis'
        };
      case 'medio':
        return {
          label: 'Médio',
          color: 'bg-yellow-500',
          icon: Brain,
          variant: 'outline' as const,
          description: 'Requer conhecimento moderado'
        };
      case 'dificil':
        return {
          label: 'Difícil',
          color: 'bg-orange-500',
          icon: TrendingUp,
          variant: 'destructive' as const,
          description: 'Para conhecedores do futebol'
        };
      case 'muito_dificil':
        return {
          label: 'Muito Difícil',
          color: 'bg-red-500',
          icon: Flame,
          variant: 'destructive' as const,
          description: 'Apenas para especialistas'
        };
      default:
        return {
          label: 'Médio',
          color: 'bg-gray-500',
          icon: Brain,
          variant: 'outline' as const,
          description: 'Nível padrão'
        };
    }
  };

  const config = getDifficultyConfig(currentDifficulty);
  const Icon = config.icon;

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <Badge variant={config.variant}>
          {config.label}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5" />
          Nível Atual: {config.label}
        </CardTitle>
        <CardDescription>
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sessionStats.correctAnswers}
            </div>
            <div className="text-sm text-muted-foreground">Acertos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sessionStats.totalAttempts}
            </div>
            <div className="text-sm text-muted-foreground">Tentativas</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Precisão da Sessão</span>
            <span className="font-medium">{sessionStats.accuracy}%</span>
          </div>
          <Progress value={sessionStats.accuracy} className="h-2" />
        </div>

        {sessionStats.streak > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Flame className="w-4 h-4" />
            <span>Sequência: {sessionStats.streak} acertos!</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          💡 O nível se ajusta automaticamente com base na sua performance
        </div>
      </CardContent>
    </Card>
  );
};
