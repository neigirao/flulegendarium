import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Home, Star, Award } from "lucide-react";
import { SocialShare } from "@/components/social/SocialShare";
import { ChallengeResult } from "@/components/social/ChallengeResult";

import { PersonalRecordConfetti } from "@/components/rewards/PersonalRecordConfetti";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Achievement, ACHIEVEMENTS } from "@/types/achievements";
import { clearAllImageCache } from "@/utils/player-image/cache";
import { challengeService } from "@/services/challengeService";

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
  rankingPlayerName?: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

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
  unlockedAchievementIds = [],
  rankingPlayerName = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showChallengeResult, setShowChallengeResult] = useState(false);
  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);
  const [isPersonalRecord, setIsPersonalRecord] = useState(false);
  const [previousRecord, setPreviousRecord] = useState(0);
  const autoSaveInFlightRef = useRef(false);

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

  // Check for active challenge and complete it
  useEffect(() => {
    const completeActiveChallenge = async () => {
      if (open && score >= 0) {
        const activeChallenge = sessionStorage.getItem('active_challenge');
        if (activeChallenge) {
          setHasActiveChallenge(true);
          setShowChallengeResult(true);
          
          try {
            const challengeData = JSON.parse(activeChallenge);
            const challengeLink = challengeData.challengeLink;
            
            // Complete challenge in database
            if (challengeLink) {
              await challengeService.completeChallenge({
                challengeLink,
                challengedId: user?.id,
                challengedName: user?.user_metadata?.full_name || 'Tricolor Anônimo',
                challengedScore: score,
              });
            }
          } catch (error) {
            // Failed to complete challenge, but still show result
            console.error('Error completing challenge:', error);
          }
        }
      }
    };

    completeActiveChallenge();
  }, [open, score, user]);

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

  const resolvedRankingName = rankingPlayerName.trim()
    || user?.user_metadata?.full_name?.trim()
    || user?.user_metadata?.name?.trim()
    || user?.email?.split('@')[0]?.trim()
    || 'Tricolor Anônimo';

  // Auto-save for all players
  useEffect(() => {
    const autoSaveToRanking = async () => {
      if (
        open &&
        score > 0 &&
        !autoSaved &&
        !autoSaveInFlightRef.current &&
        onSaveToRanking &&
        resolvedRankingName
      ) {
        autoSaveInFlightRef.current = true;
        setIsAutoSaving(true);
        try {
          await onSaveToRanking(resolvedRankingName, score, difficultyLevel);
          setAutoSaved(true);
          setShowShareOptions(true);
          toast.success('Pontuação salva automaticamente no ranking!');
        } catch (error) {
          console.error('Error auto-saving to ranking:', error);
          setShowRankingForm(true);
        } finally {
          setIsAutoSaving(false);
          autoSaveInFlightRef.current = false;
        }
      }
    };

    autoSaveToRanking();
  }, [open, score, onSaveToRanking, difficultyLevel, autoSaved, resolvedRankingName]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAutoSaved(false);
      setIsAutoSaving(false);
      setShowRankingForm(false);
      setShowShareOptions(false);
      setShowChallengeResult(false);
      setHasActiveChallenge(false);
      setIsPersonalRecord(false);
      setPreviousRecord(0);
      autoSaveInFlightRef.current = false;
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
  const showInitialState = !showRankingForm && !showShareOptions && !autoSaved && !isAutoSaving;

  return (
    <>
      {/* Confetti para recorde pessoal */}
      <PersonalRecordConfetti
        show={isPersonalRecord && open}
        previousRecord={previousRecord}
        newRecord={score}
      />
      
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent data-testid="game-over-dialog" className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
            >
              <DialogTitle className="flex items-center gap-2 text-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
                {isPersonalRecord ? '🎉 Novo Recorde!' : 'Game Over'}
              </DialogTitle>
            </motion.div>
          </DialogHeader>

          <div className="text-center space-y-4">
            {playerName && (
              <motion.p 
                className="text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Era <span className="font-bold text-primary">{playerName}</span>!
              </motion.p>
            )}
            
            <motion.div 
              className="bg-muted rounded-lg p-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-2xl font-bold text-primary mb-2">{score} pontos</p>
              <p className="text-muted-foreground">{getScoreMessage()}</p>
              {gameMode === 'adaptive' && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Modo Adaptativo</span>
                </div>
              )}
            </motion.div>

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
            <AnimatePresence>
              {unlockedAchievements.length > 0 && (
                <motion.div 
                  className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-primary">
                      {unlockedAchievements.length === 1 
                        ? 'Conquista Desbloqueada!' 
                        : `${unlockedAchievements.length} Conquistas Desbloqueadas!`}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {unlockedAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        className="flex items-center gap-3 bg-background/80 rounded-lg p-3 border border-primary/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="text-left flex-1">
                          <p className="font-medium text-primary text-sm">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          +{achievement.points} pts
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isAutoSaving && (
                <motion.div
                  key="autosaving"
                  className="space-y-3 py-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm text-muted-foreground">
                    Salvando sua pontuação automaticamente no ranking...
                  </p>
                </motion.div>
              )}

              {showInitialState && (
                <motion.div 
                  key="initial"
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Primary Actions */}
                  <motion.div className="space-y-3" variants={itemVariants}>
                    {score > 0 && (
                      <motion.div
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button
                          onClick={() => setShowRankingForm(true)}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Salvar no Ranking
                        </Button>
                      </motion.div>
                    )}
                    
                    <motion.div
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        onClick={handleNewGame}
                        variant="outline"
                        className="w-full"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Jogar Novamente
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={handleGoHome}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Voltar ao Início
                      </Button>
                    </motion.div>

                  </motion.div>
                </motion.div>
              )}

              {showRankingForm && (
                <motion.div
                  key="ranking"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RankingForm
                    score={score}
                    onSaved={handleSaveToRanking}
                    onCancel={handleSkipRanking}
                    isAuthenticated={isAuthenticated}
                    gameMode={gameMode}
                    difficultyLevel={difficultyLevel}
                  />
                </motion.div>
              )}

              {showShareOptions && (
                <motion.div 
                  key="share"
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SocialShare
                    score={score}
                    correctGuesses={Math.floor(score / 5)}
                    gameMode={gameMode === 'adaptive' ? 'Adaptativo' : 'Clássico'}
                    streak={0}
                    achievements={[]}
                  />
                  
                  <div className="space-y-2">
                    <motion.div
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        onClick={handleNewGame}
                        variant="outline"
                        className="w-full"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Jogar Novamente
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={handleGoHome}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Voltar ao Início
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
