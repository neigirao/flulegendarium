import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart3, HelpCircle } from "lucide-react";
import { DifficultyLevel } from "@/types/guess-game";

export const DIFFICULTY_LEVELS = [
  { value: 'muito_facil' as DifficultyLevel, label: 'Muito Fácil', color: 'text-green-600', multiplier: '1x' },
  { value: 'facil' as DifficultyLevel, label: 'Fácil', color: 'text-blue-600', multiplier: '1.2x' },
  { value: 'medio' as DifficultyLevel, label: 'Médio', color: 'text-yellow-600', multiplier: '1.5x' },
  { value: 'dificil' as DifficultyLevel, label: 'Difícil', color: 'text-orange-600', multiplier: '2x' },
  { value: 'muito_dificil' as DifficultyLevel, label: 'Muito Difícil', color: 'text-red-600', multiplier: '3x' }
] as const;

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  muito_facil: 'Muito Fácil',
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
  muito_dificil: 'Muito Difícil',
};

interface DifficultySectionProps {
  difficultyLevel: DifficultyLevel;
  onDifficultyChange: (value: string) => void;
  isLoading?: boolean;
  originalDifficulty?: DifficultyLevel;
  difficultyScore?: number;
  difficultyConfidence?: number;
  totalAttempts?: number;
  correctAttempts?: number;
  showStats?: boolean;
  title?: string;
  description?: string;
  variant?: 'full' | 'compact';
}

export const DifficultySection = ({
  difficultyLevel,
  onDifficultyChange,
  isLoading = false,
  originalDifficulty,
  difficultyScore = 50,
  difficultyConfidence = 0,
  totalAttempts = 0,
  correctAttempts = 0,
  showStats = true,
  title = "Classificação de Dificuldade",
  description = "Configure o nível de dificuldade no modo adaptativo",
  variant = 'full'
}: DifficultySectionProps) => {
  const getDifficultyInfo = (level: DifficultyLevel) => {
    return DIFFICULTY_LEVELS.find(d => d.value === level);
  };

  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="difficulty">Dificuldade</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={14} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">A dificuldade afeta o multiplicador de pontos no modo adaptativo.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select 
          value={difficultyLevel} 
          onValueChange={onDifficultyChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a dificuldade" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                <span className={level.color}>{level.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">({level.multiplier} pontos)</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          A dificuldade será recalculada automaticamente com base nas estatísticas.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 size={20} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="difficulty">Nível de Dificuldade</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={14} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">Define o multiplicador de pontos e a frequência de aparição no jogo.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={difficultyLevel} 
              onValueChange={onDifficultyChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <span className={level.color}>{level.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({level.multiplier} pontos)</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Dificuldade atual: <span className={`font-medium ${getDifficultyInfo(difficultyLevel)?.color}`}>
                {getDifficultyInfo(difficultyLevel)?.label}
              </span>
            </div>
            {originalDifficulty && originalDifficulty !== difficultyLevel && (
              <div className="text-xs text-muted-foreground">
                Dificuldade original: <span className="font-medium">{getDifficultyInfo(originalDifficulty)?.label}</span>
              </div>
            )}
          </div>

          {showStats && (
            <div className="space-y-2">
              <Label>Estatísticas Automáticas</Label>
              <div className="text-sm text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="font-medium">{difficultyScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Confiança:</span>
                  <span className="font-medium">{difficultyConfidence.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tentativas:</span>
                  <span className="font-medium">{totalAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Acertos:</span>
                  <span className="font-medium">{correctAttempts}</span>
                </div>
                {totalAttempts > 0 && (
                  <div className="flex justify-between pt-1 border-t">
                    <span>Taxa de acerto:</span>
                    <span className="font-medium">
                      {((correctAttempts / totalAttempts) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <p className="font-medium mb-1">Como funciona:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {DIFFICULTY_LEVELS.map((level) => (
              <li key={level.value}>
                <span className={level.color}>{level.label}:</span> {level.multiplier} pontos
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
