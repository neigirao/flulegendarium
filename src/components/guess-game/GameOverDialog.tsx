import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { ChallengeResult } from "@/components/social/ChallengeResult";
import { QuickFeedbackButton } from "@/components/feedback/QuickFeedbackButton";
import { PersonalRecordConfetti } from "@/components/rewards/PersonalRecordConfetti";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Achievement, ACHIEVEMENTS } from "@/types/achievements";
import { clearAllImageCache } from "@/utils/player-image/cache";

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
  const navigate = useNavigate();
  const [showRankingForm, setShowRankingForm] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showChallengeResult, setShowChallengeResult] = useState(false);
  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);
  const [isPersonalRecord, setIsPersonalRecord] = useState(false);
  const [previousRecord, setPreviousRecord] = useState(0);

  // Check for personal record
  useEffect(() => {
    if (open && score > 0) {
      const storageKey = `personal_record_${gameMode}_${difficultyLevel || 'default'}`;
      const storedRecord = localStorage.getItem(storageKey);
      const previousBest = storedRecord ? parseInt(storedRecord, 10) : 0;
      
      if (score > previousBest) {
        setPreviousRecord(previousBest);
        setIsPersonalRecord(true);
        localStorage.setItem(storageKey, score.toString());
      } else {
        setIsPersonalRecord(false);
      }
    }
  }, [open, score, gameMode, difficultyLevel]);

  // Check for active challenge
  useEffect(() => {
    if (open) {
      const activeChallenge = sessionStorage.getItem('active_challenge');
      if (activeChallenge) {
        setHasActiveChallenge(true);
        setShowChallengeResult(true);
      }
    }
  }, [open]);

  // Get full achievement data for unlocked achievements
  const unlockedAchievements = ACHIEVEMENTS.filter(a => 
    unlockedAchievementIds.includes(a.id)
  );

  // Save game result for challenge system
  useEffect(() => {
    if (open && score > 0) {
      sessionStorage.setItem('last_game_result', JSON.stringify({
        score,
        gameMode: gameMode === 'adaptive' ? 'adaptive' : 'decade',
        difficulty: difficultyLevel,
        timestamp: Date.now(),
      }));
    }
  }, [open, score, gameMode, difficultyLevel]);

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
      setShowChallengeResult(false);
      setHasActiveChallenge(false);
      setIsPersonalRecord(false);
      setPreviousRecord(0);
    }
  }, [open]);

  const handleDismissChallengeResult = () => {
    setShowChallengeResult(false);
    sessionStorage.removeItem('active_challenge');
  };

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
    clearAllImageCache();
    onResetScore();
    onClose();
    navigate('/selecionar-modo-jogo', { replace: true });
  };

  const handleGoHome = () => {
    setShowRankingForm(false);
    setShowShareOptions(false);
    setAutoSaved(false);
    clearAllImageCache();
    onClose();
    navigate('/', { replace: true });
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
    <>
      {/* Confetti para recorde pessoal */}
      <PersonalRecordConfetti
        show={isPersonalRecord && open}
        previousRecord={previousRecord}
        newRecord={score}
      />
      
      <Dialog open={open} onOpenChange={handleGoHome}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
              {isPersonalRecord ? '🎉 Novo Recorde!' : 'Game Over'}
            </DialogTitle>
          </DialogHeader>

        <div className="text-center space-y-4">
          {playerName && (
            <p className="text-lg">
              Era <span className="font-bold text-flu-grena">{playerName}</span>!
            </p>
          )}
          
          <div className="bg-muted rounded-lg p-4">
            <p className="text-2xl font-bold text-primary mb-2">{score} pontos</p>
            <p className="text-muted-foreground">{getScoreMessage()}</p>
            {gameMode === 'adaptive' && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-4 h-4 text-warning" />
                <span className="text-sm text-muted-foreground">Modo Adaptativo</span>
              </div>
            )}
          </div>

          {/* Challenge Result */}
          {showChallengeResult && hasActiveChallenge && (
            <ChallengeResult
              yourScore={score}
              gameMode={gameMode === 'adaptive' ? 'adaptive' : 'decade'}
              difficulty={difficultyLevel}
              onDismiss={handleDismissChallengeResult}
            />
          )}

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
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
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
    </>
  );
};
