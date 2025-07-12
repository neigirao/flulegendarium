import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Share2, MessageSquare, Trophy, Zap, Info } from 'lucide-react';
import { QuickShareButton } from '@/components/social/QuickShareButton';
import { QuickFeedbackButton } from '@/components/feedback/QuickFeedbackButton';
import { Achievement } from '@/types/achievements';

interface QuickActionsProps {
  score: number;
  correctGuesses: number;
  gameMode?: string;
  streak?: number;
  achievements?: Achievement[];
  playerName?: string;
  onRestart?: () => void;
  onShowTutorial?: () => void;
  className?: string;
}

export const QuickActions = ({
  score,
  correctGuesses,
  gameMode = "Clássico",
  streak = 0,
  achievements = [],
  playerName,
  onRestart,
  onShowTutorial,
  className = ""
}: QuickActionsProps) => {
  const [showAllActions, setShowAllActions] = useState(false);

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Ações Rápidas</h3>
          {achievements.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {achievements.length} conquista{achievements.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Ações principais sempre visíveis */}
          <QuickShareButton
            score={score}
            correctGuesses={correctGuesses}
            gameMode={gameMode}
            streak={streak}
            achievements={achievements}
            playerName={playerName}
            variant="outline"
            size="sm"
            className="w-full"
          />

          <QuickFeedbackButton
            gameMode={gameMode}
            playerName={playerName}
            variant="outline"
            size="sm"
            className="w-full"
          />

          {/* Ações secundárias */}
          {showAllActions && (
            <>
              {onRestart && (
                <Button
                  onClick={onRestart}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </Button>
              )}

              {onShowTutorial && (
                <Button
                  onClick={onShowTutorial}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  Tutorial
                </Button>
              )}
            </>
          )}
        </div>

        {/* Botão para mostrar mais ações */}
        {(onRestart || onShowTutorial) && (
          <Button
            onClick={() => setShowAllActions(!showAllActions)}
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs"
          >
            {showAllActions ? 'Menos opções' : 'Mais opções'}
          </Button>
        )}

        {/* Estatísticas rápidas */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground">Pontos</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{correctGuesses}</div>
              <div className="text-xs text-muted-foreground">Acertos</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{streak}</div>
              <div className="text-xs text-muted-foreground">Sequência</div>
            </div>
          </div>
        </div>

        {/* Indicador de performance */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Performance: {score > 50 ? 'Excelente' : score > 25 ? 'Boa' : 'Iniciante'}
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (score / 100) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};