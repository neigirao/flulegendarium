
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Home, Star, Award } from "lucide-react";
import { RankingForm } from "./RankingForm";
import { SocialShare } from "@/components/social/SocialShare";
import { QuickFeedbackButton } from "@/components/feedback/QuickFeedbackButton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Achievement, ACHIEVEMENTS } from "@/types/achievements";

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
  unlockedAchievementIds?: string[];
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
  difficultyLevel,
  unlockedAchievementIds = []
}) => {
  const { user } = useAuth();
  const [showRankingForm, setShowRankingForm] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  // Get full achievement data for unlocked achievements
  const unlockedAchievements = ACHIEVEMENTS.filter(a => 
    unlockedAchievementIds.includes(a.id)
  );

  // Auto-save for logged-in users with a name
  useEffect(() => {
    const autoSaveForLoggedUser = async () => {
      if (open && score > 0 && !autoSaved && user && onSaveToRanking) {
        const userName = user.user_metadata?.full_name;
        if (userName) {
          try {
            await onSaveToRanking(userName, score, difficultyLevel);
            setAutoSaved(true);
            setShowShareOptions(true);
            toast.success('Pontuação salva automaticamente no ranking!');
          } catch (error) {
            console.error('Error auto-saving to ranking:', error);
            // Fall back to manual save
            setShowRankingForm(true);
          }
        }
      }
    };

    autoSaveForLoggedUser();
  }, [open, score, user, onSaveToRanking, difficultyLevel, autoSaved]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAutoSaved(false);
      setShowRankingForm(false);
      setShowShareOptions(false);
    }
  }, [open]);

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
    setAutoSaved(false);
    onResetScore();
    onClose();
    window.location.href = '/selecionar-modo-jogo';
  };

  const handleGoHome = () => {
    setShowRankingForm(false);
    setShowShareOptions(false);
    setAutoSaved(false);
    onClose();
    window.location.href = '/';
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

  // Determine if we should show the initial state (not auto-saved, not showing form, not showing share)
  const showInitialState = !showRankingForm && !showShareOptions && !autoSaved;

  return (
    <Dialog open={open} onOpenChange={handleGoHome}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
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

          {/* Unlocked Achievements Section */}
          {unlockedAchievements.length > 0 && (
            <div className="bg-gradient-to-r from-flu-grena/10 to-flu-verde/10 rounded-lg p-4 border border-flu-grena/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Award className="w-5 h-5 text-flu-grena" />
                <h4 className="font-semibold text-flu-grena">
                  {unlockedAchievements.length === 1 
                    ? 'Conquista Desbloqueada!' 
                    : `${unlockedAchievements.length} Conquistas Desbloqueadas!`}
                </h4>
              </div>
              <div className="space-y-2">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 bg-white/80 rounded-lg p-3 border border-flu-grena/10"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="text-left flex-1">
                      <p className="font-medium text-flu-grena text-sm">{achievement.name}</p>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                    <span className="text-xs bg-flu-grena/20 text-flu-grena px-2 py-1 rounded-full">
                      +{achievement.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showInitialState && (
            <div className="space-y-4">
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
                  onClick={handleGoHome}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
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
                  onClick={handleGoHome}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
