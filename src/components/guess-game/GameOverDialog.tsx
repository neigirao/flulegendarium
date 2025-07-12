
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Home, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { RankingForm } from "./RankingForm";
import { SocialShare } from "@/components/social/SocialShare";
import { QuickActions } from "@/components/ux/QuickActions";
import { GameInsights } from "@/components/ux/GameInsights";
import { QuickFeedbackButton } from "@/components/feedback/QuickFeedbackButton";

interface GameOverDialogProps {
  open: boolean;
  onClose: () => void;
  playerName: string;
  score: number;
  onResetScore: () => void;
  isAuthenticated?: boolean;
  onSaveToRanking?: (playerName: string, score: number, difficultyLevel?: string) => Promise<void>;
  gameMode?: 'classic' | 'adaptive';
  difficultyLevel?: string;
}

export const GameOverDialog: React.FC<GameOverDialogProps> = ({
  open,
  onClose,
  playerName,
  score,
  onResetScore,
  isAuthenticated = false,
  onSaveToRanking,
  gameMode = 'classic',
  difficultyLevel
}) => {
  const [showRankingForm, setShowRankingForm] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleSaveToRanking = async (name: string) => {
    if (onSaveToRanking) {
      await onSaveToRanking(name, score, difficultyLevel);
    }
    setShowRankingForm(false);
    setShowShareOptions(true);
  };

  const handleNewGame = () => {
    setShowRankingForm(false);
    setShowShareOptions(false);
    onResetScore();
    onClose();
  };

  const handleSkipRanking = () => {
    setShowRankingForm(false);
    setShowShareOptions(true);
  };

  const getScoreMessage = () => {
    if (gameMode === 'adaptive') {
      return `Você conseguiu ${score} pontos no modo adaptativo${difficultyLevel ? ` (Nível: ${difficultyLevel})` : ''}!`;
    }
    return `Você conseguiu ${score} pontos!`;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Trophy className="w-6 h-6 text-flu-grena" />
            Game Over
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          {playerName && (
            <p className="text-lg">
              Era <span className="font-bold text-flu-grena">{playerName}</span>!
            </p>
          )}
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-flu-grena mb-2">{score} pontos</p>
            <p className="text-gray-600">{getScoreMessage()}</p>
            {gameMode === 'adaptive' && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Modo Adaptativo</span>
              </div>
            )}
          </div>

          {!showRankingForm && !showShareOptions && (
            <div className="space-y-4">
              {/* Game Insights */}
              <GameInsights
                score={score}
                correctGuesses={Math.floor(score / 5)}
                totalAttempts={Math.max(1, Math.floor(score / 3))}
                streak={0}
                gameMode={gameMode === 'adaptive' ? 'Adaptativo' : 'Clássico'}
                difficulty={difficultyLevel}
              />

              {/* Quick Actions */}
              <QuickActions
                score={score}
                correctGuesses={Math.floor(score / 5)}
                gameMode={gameMode === 'adaptive' ? 'Adaptativo' : 'Clássico'}
                playerName={playerName}
                onRestart={handleNewGame}
              />

              {/* Primary Actions */}
              <div className="space-y-3">
                {score > 0 && (
                  <Button
                    onClick={() => setShowRankingForm(true)}
                    className="w-full bg-flu-grena hover:bg-flu-grena/90"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Salvar no Ranking
                  </Button>
                )}
                
                <Button
                  onClick={handleNewGame}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Jogar Novamente
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full"
                  asChild
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Início
                  </Link>
                </Button>

                {/* Feedback Button */}
                <QuickFeedbackButton
                  gameMode={gameMode === 'adaptive' ? 'Adaptativo' : 'Clássico'}
                  playerName={playerName}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {showRankingForm && (
            <RankingForm
              score={score}
              onSaved={handleSaveToRanking}
              onCancel={handleSkipRanking}
              isAuthenticated={isAuthenticated}
              gameMode={gameMode}
              difficultyLevel={difficultyLevel}
            />
          )}

          {showShareOptions && (
            <div className="space-y-4">
              <SocialShare
                score={score}
                correctGuesses={Math.floor(score / 5)}
                gameMode={gameMode === 'adaptive' ? 'Adaptativo' : 'Clássico'}
                streak={0}
                achievements={[]}
              />
              
              <div className="space-y-2">
                <Button
                  onClick={handleNewGame}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Jogar Novamente
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full"
                  asChild
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Início
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
