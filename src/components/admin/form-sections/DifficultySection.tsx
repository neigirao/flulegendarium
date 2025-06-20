
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from "lucide-react";
import { DifficultyLevel } from "@/types/guess-game";

const DIFFICULTY_LEVELS = [
  { value: 'muito_facil' as DifficultyLevel, label: 'Muito Fácil', color: 'text-green-600' },
  { value: 'facil' as DifficultyLevel, label: 'Fácil', color: 'text-blue-600' },
  { value: 'medio' as DifficultyLevel, label: 'Médio', color: 'text-yellow-600' },
  { value: 'dificil' as DifficultyLevel, label: 'Difícil', color: 'text-orange-600' },
  { value: 'muito_dificil' as DifficultyLevel, label: 'Muito Difícil', color: 'text-red-600' }
];

interface DifficultySectionProps {
  difficultyLevel: DifficultyLevel;
  onDifficultyChange: (value: string) => void;
  isLoading: boolean;
  originalDifficulty?: DifficultyLevel;
  difficultyScore?: number;
  difficultyConfidence?: number;
  totalAttempts?: number;
  correctAttempts?: number;
}

export const DifficultySection = ({
  difficultyLevel,
  onDifficultyChange,
  isLoading,
  originalDifficulty,
  difficultyScore = 50,
  difficultyConfidence = 0,
  totalAttempts = 0,
  correctAttempts = 0
}: DifficultySectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 size={20} />
          Classificação de Dificuldade
        </CardTitle>
        <CardDescription>
          Configure o nível de dificuldade do jogador no modo adaptativo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Nível de Dificuldade</Label>
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
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Dificuldade atual: <span className="font-medium">{difficultyLevel}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Dificuldade original: <span className="font-medium">{originalDifficulty}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estatísticas Automáticas</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Score: {difficultyScore}/100</p>
              <p>Confiança: {difficultyConfidence.toFixed(1)}%</p>
              <p>Tentativas: {totalAttempts}</p>
              <p>Acertos: {correctAttempts}</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <p><strong>Como funciona:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li><strong>Muito Fácil:</strong> Jogadores conhecidos (1x pontos)</li>
            <li><strong>Fácil:</strong> Jogadores populares (1.2x pontos)</li>
            <li><strong>Médio:</strong> Conhecimento intermediário (1.5x pontos)</li>
            <li><strong>Difícil:</strong> Jogadores específicos (2x pontos)</li>
            <li><strong>Muito Difícil:</strong> Lendas obscuras (3x pontos)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
