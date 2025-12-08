import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAdaptiveGuessGame } from "@/hooks/game";
import { usePlayersData } from "@/hooks/data";
import { useAuth } from "@/hooks/auth";
import { BaseGameContainer } from "./BaseGameContainer";
import { GameHeader } from "./GameHeader";
import { AdaptiveDifficultyIndicator } from "./AdaptiveDifficultyIndicator";
import { AdaptivePlayerImage } from "./AdaptivePlayerImage";
import { GuessForm } from "./GuessForm";
import { GameOverDialog } from "./GameOverDialog";
import { GuestNameForm } from "./GuestNameForm";
import { AdaptiveProgressionNotification } from "./AdaptiveProgressionNotification";
import { DebugInfo } from "./DebugInfo";
import { ErrorDisplay } from "./ErrorDisplay";
import { useAchievementSystem } from "@/components/achievements/AchievementSystemProvider";
import { useEnhancedAnalytics } from "@/hooks/analytics";
import { useFunnelAnalytics } from "@/hooks/use-funnel-analytics";
import { useChallengeProgress } from "@/hooks/use-challenge-progress";
import { DynamicSEO } from "@/components/seo/DynamicSEO";
import { useMobileOptimization } from "@/hooks/mobile";
import { useUX } from "@/components/ux/UXProvider";
import { useDevToolsDetection } from "@/hooks/use-devtools-detection";
import { useToast } from "@/hooks/use-toast";
import { clearAllImageCache } from "@/utils/player-image/cache";
import { preloadNextPlayer, prepareNextBatch } from "@/utils/player-image/preloadUtils";
import { CoachMark, useOnboarding } from "@/components/onboarding";

const AdaptiveGameContainer = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [guestName, setGuestName] = useState<string>("");
  const [showGuestNameForm, setShowGuestNameForm] = useState(false);
  const [canStartTimer, setCanStartTimer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();
  
  // Tracking state
  const hasTrackedFirstGuess = useRef(false);
  const hasTrackedGameStart = useRef(false);
  const prevGameOverRef = useRef(false);
  
  const { user } = useAuth();
  const { players, isLoading, playersError } = usePlayersData();
  
  // Achievement hooks
  const { checkProgressAchievements, getPlayerAchievements } = useAchievementSystem();
  const analytics = useEnhancedAnalytics();
  const funnel = useFunnelAnalytics();
  const { viewportInfo, getTouchTargetSize } = useMobileOptimization();
  const { showContextualFeedback } = useUX();
  const { isOnboardingActive, goToStep, nextStep, isStepActive } = useOnboarding();
  const { onCorrectGuess, onStreakAchieved, onGameCompleted } = useChallengeProgress();
  const {
    currentPlayer,
    gameKey,
    currentDifficulty,
    difficultyProgress,
    attempts,
    score,
    gameOver,
    timeRemaining,
    handleGuess: originalHandleGuess,
    selectRandomPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    isProcessingGuess,
    hasLost,
    startGameForPlayer: originalStartGame,
    isTimerRunning,
    resetScore,
    gamesPlayed,
    currentStreak,
    maxStreak,
    difficultyChangeInfo,
    clearDifficultyChange,
    saveToRanking
  } = useAdaptiveGuessGame(players);

  // Wrapped startGameForPlayer with funnel tracking
  const startGameForPlayer = useCallback(() => {
    if (!hasTrackedGameStart.current) {
      funnel.trackGameStart('adaptive', currentDifficulty.level);
      hasTrackedGameStart.current = true;
    }
    originalStartGame();
  }, [originalStartGame, funnel, currentDifficulty.level]);

  // Wrapped handleGuess with funnel tracking and onboarding
  const handleGuess = useCallback((guess: string) => {
    // Track first guess
    if (!hasTrackedFirstGuess.current) {
      funnel.trackFirstGuess('adaptive');
      hasTrackedFirstGuess.current = true;
    }
    
    // Avançar onboarding após primeiro palpite
    if (isStepActive('first-guess')) {
      nextStep();
    }
    
    // Track guess (result will be determined by game state change)
    originalHandleGuess(guess);
  }, [originalHandleGuess, funnel, isStepActive, nextStep]);

  // Track game completion when gameOver changes
  useEffect(() => {
    if (gameOver && !prevGameOverRef.current) {
      funnel.trackGameCompleted(score, gamesPlayed, 'adaptive');
      // Update daily challenge progress
      onGameCompleted(score);
    }
    prevGameOverRef.current = gameOver;
  }, [gameOver, score, gamesPlayed, funnel, onGameCompleted]);

  // Track correct/incorrect guesses based on streak changes
  const prevStreakRef = useRef(currentStreak);
  useEffect(() => {
    if (currentStreak > prevStreakRef.current) {
      funnel.trackGuessResult(true, gamesPlayed);
      // Update daily challenge progress for correct guess
      onCorrectGuess();
      // Update streak challenges
      onStreakAchieved(currentStreak);
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak, gamesPlayed, funnel, onCorrectGuess, onStreakAchieved]);

  // Reset tracking refs when game resets
  useEffect(() => {
    if (!gameOver && gamesPlayed === 0) {
      hasTrackedFirstGuess.current = false;
      hasTrackedGameStart.current = false;
    }
  }, [gameOver, gamesPlayed]);

  // Ativar step de primeiro palpite quando imagem carregar
  useEffect(() => {
    if (isOnboardingActive && imageLoaded && isTimerRunning && !isStepActive('first-guess') && !isStepActive('timer-explanation')) {
      goToStep('first-guess');
    }
  }, [isOnboardingActive, imageLoaded, isTimerRunning, goToStep, isStepActive]);

  // Detecção de DevTools - encerra o jogo se detectado
  const handleDevToolsDetected = useCallback(() => {
    if (!gameOver) {
      toast({
        variant: "destructive",
        title: "Jogo Encerrado",
        description: "Uso de ferramentas de inspeção detectado. O jogo foi finalizado.",
      });
      // O jogo será encerrado através do resetScore que força gameOver
      resetScore();
    }
  }, [gameOver, toast, resetScore]);

  useDevToolsDetection(handleDevToolsDetected, !gameOver);

  // Reset completo de estados ao montar o componente
  useEffect(() => {
    setImageLoaded(false);
    setCanStartTimer(false);
    clearAllImageCache();
    
    return () => {
      setImageLoaded(false);
      setCanStartTimer(false);
    };
  }, []);

  useEffect(() => {
    // Se não estiver autenticado e não tiver nome de convidado, mostrar formulário
    if (!user && !guestName && !showGuestNameForm && players && players.length > 0) {
      setShowGuestNameForm(true);
      // Ativar step de input de nome no onboarding
      if (isOnboardingActive) {
        goToStep('name-input');
      }
    }
    
    // Track page view
    analytics.trackPageView('/quiz-adaptativo');
    analytics.trackUserEngagement('page_view', 'adaptive_game');
  }, [analytics, user, guestName, showGuestNameForm, players, isOnboardingActive, goToStep]);

  const handleGuestNameSubmit = (name: string) => {
    setGuestName(name);
    setShowGuestNameForm(false);
    setCanStartTimer(true);
    
    // Avançar para próximo step do onboarding
    if (isStepActive('name-input')) {
      nextStep();
    }
  };

  const handleImageLoaded = useCallback(() => {
    setImageLoaded(true);
    handlePlayerImageFixed();
    
    // Pré-carregar próximo lote de jogadores em background
    if (players && currentPlayer) {
      prepareNextBatch(players, currentPlayer, 2);
    }
  }, [handlePlayerImageFixed, players, currentPlayer]);

  // Iniciar timer somente quando nome foi salvo E imagem carregada E tutorial fechado
  const tutorialCompleted = !isOnboardingActive;
  
  useEffect(() => {
    if (canStartTimer && imageLoaded && currentPlayer && !gameOver && !isTimerRunning && tutorialCompleted) {
      startGameForPlayer();
    }
  }, [canStartTimer, imageLoaded, currentPlayer, gameOver, isTimerRunning, startGameForPlayer, tutorialCompleted]);

  // Resetar imageLoaded quando trocar de jogador
  useEffect(() => {
    setImageLoaded(false);
  }, [currentPlayer]);

  // Setar canStartTimer para usuários autenticados
  useEffect(() => {
    if (user) {
      setCanStartTimer(true);
    }
  }, [user]);

  if (playersError) {
    return <ErrorDisplay error={playersError} />;
  }

  const debugContent = showDebug ? (
    <DebugInfo
      show={true}
      imageUrl={currentPlayer?.image_url}
    />
  ) : null;

  return (
    <>
      <DynamicSEO 
        gameMode="adaptive"
        difficulty={currentDifficulty.label}
        player={currentPlayer}
      />
      
      <BaseGameContainer
        title="Quiz Adaptativo"
        subtitle="Dificuldade automática baseada no seu desempenho"
        icon="🎯"
        isLoading={isLoading}
        loadingMessage="Carregando jogadores..."
        hasPlayers={!!(players && players.length > 0)}
        emptyStateMessage="Nenhum jogador encontrado para o quiz"
        playerCount={players?.length}
        showDebug={showDebug}
        debugContent={debugContent}
      >
        {/* Timer com CoachMark */}
        <CoachMark
          step="timer-explanation"
          title="Fique de Olho no Tempo!"
          description="Você tem 15 segundos para adivinhar. Respostas rápidas valem mais pontos!"
          position="bottom"
        >
          <GameHeader 
            score={score} 
            onDebugClick={() => setShowDebug(!showDebug)}
            isAdaptiveMode={true}
            timeRemaining={timeRemaining}
            gameActive={!gameOver && isTimerRunning}
          />
        </CoachMark>
        
        <div className="mt-6 space-y-6">
          <AdaptiveDifficultyIndicator 
            currentDifficulty={currentDifficulty.level as any}
            progress={difficultyProgress}
          />

          {currentPlayer && (
            <div className="relative">
              <AdaptivePlayerImage
                key={`${gameKey}-${currentPlayer.id}`}
                player={currentPlayer}
                onImageFixed={handleImageLoaded}
                difficulty={currentDifficulty.level as any}
              />
              
              {/* GuessForm com CoachMark */}
              <CoachMark
                step="first-guess"
                title="Faça seu Palpite!"
                description="Digite o nome do jogador que você vê na imagem. Você pode digitar apelidos também!"
                position="top"
              >
                <GuessForm
                  onSubmitGuess={handleGuess}
                  disabled={gameOver || isProcessingGuess}
                  isProcessing={isProcessingGuess}
                />
              </CoachMark>
            </div>
          )}
        </div>
      </BaseGameContainer>

      <GameOverDialog
        open={gameOver}
        onClose={() => {}}
        playerName={currentPlayer?.name || ''}
        score={score}
        onResetScore={resetScore}
        isAuthenticated={!!user}
        onSaveToRanking={saveToRanking}
        gameMode="adaptive"
        difficultyLevel={currentDifficulty.label}
        unlockedAchievementIds={getPlayerAchievements().map(a => a.id)}
      />

      {/* GuestNameForm com CoachMark */}
      {showGuestNameForm && (
        <CoachMark
          step="name-input"
          title="Qual seu Nome?"
          description="Informe seu nome para começar. Ele aparecerá no ranking se você pontuar!"
          position="bottom"
        >
          <GuestNameForm
            onNameSubmitted={handleGuestNameSubmit}
            onCancel={() => window.history.back()}
          />
        </CoachMark>
      )}

      {difficultyChangeInfo && (
        <AdaptiveProgressionNotification
          changeInfo={{
            direction: 'up',
            newLevel: difficultyChangeInfo.newLevel as any,
            oldLevel: difficultyChangeInfo.oldLevel as any,
            reason: difficultyChangeInfo.reason
          }}
          onClose={clearDifficultyChange}
        />
      )}
    </>
  );
};

export default AdaptiveGameContainer;
