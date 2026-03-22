import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DecadeSelectionPage } from './DecadeSelectionPage';
import { GameContainer } from '@/components/guess-game/GameContainer';
import { BaseGameContainer } from '@/components/guess-game/BaseGameContainer';
import { GuestNameForm } from '@/components/guess-game/GuestNameForm';
import { GameOverDialog } from '@/components/guess-game/GameOverDialog';
import { GuessHistoryPanel } from '@/components/guess-game/GuessHistoryPanel';
import { SkipPlayerButton } from '@/components/guess-game/SkipPlayerButton';
import { AdaptiveProgressionNotification } from '@/components/guess-game/AdaptiveProgressionNotification';
import { DebugInfo } from '@/components/guess-game/DebugInfo';
import { SEOManager } from '@/components/seo/SEOManager';
import { KeyboardShortcutsHint } from '@/components/game/KeyboardShortcutsHint';
import { 
  useDecadePlayerSelection, 
  useSimpleGameLogic, 
  useSimpleGameCallbacks, 
  useSimpleGameMetrics,
  useDecadeGameTimer,
  useDecadeGameState,
  useSkipPlayer
} from '@/hooks/game';
import { useAuth } from '@/hooks/auth';
import { useGameKeyboardShortcuts } from '@/hooks/use-game-keyboard-shortcuts';
import { useAchievementSystem } from '@/components/achievements/AchievementSystemProvider';
import { AchievementNotification } from '@/components/achievements/AchievementNotification';
import { useAchievementNotifications } from '@/hooks/use-achievement-notifications';
import { useAnalytics } from '@/hooks/analytics';
import { useChallengeProgress } from '@/hooks/use-challenge-progress';
import { useGuessHistory } from '@/hooks/use-guess-history';
import { Decade } from '@/types/decade-game';
import { decadePlayerService } from '@/services/decadePlayerService';
import { getDecadeInfo } from '@/data/decades';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { useDevToolsDetection } from '@/hooks/use-devtools-detection';
import { useGameToasts } from '@/hooks/use-game-toasts';
import { clearAllImageCache, prepareNextBatch } from '@/utils/player-image';
import { CoachMark, useOnboarding } from '@/components/onboarding';
import { ACHIEVEMENTS } from '@/types/achievements';
import { 
  AnimatedContainer, 
  PlayerTransition, 
  StreakIndicator 
} from '@/components/animations/GameAnimations';
import type { DifficultyChangeInfo } from '@/types/guess-game';

export const DecadeGameContainer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPlayerAchievements } = useAchievementSystem();
  const { currentNotification, queueNotification, dismissNotification } = useAchievementNotifications();
  const gameToasts = useGameToasts();
  const analytics = useAnalytics();
  const { isOnboardingActive, goToStep, nextStep, isStepActive } = useOnboarding();
  const { onCorrectGuess, onStreakAchieved, onGameCompleted } = useChallengeProgress();
  const { history, addEntry, clearHistory, getStats } = useGuessHistory();
  
  // Tracking refs
  const hasTrackedFirstGuess = useRef(false);
  const hasTrackedGameStart = useRef(false);
  const prevGameOverRef = useRef(false);
  const prevStreakRef = useRef(0);
  const previousAchievementsRef = useRef<string[]>([]);
  
  const [selectedDecade, setSelectedDecade] = useState<Decade | null>(null);
  const [guestName, setGuestName] = useState<string>("");
  const [showGuestNameForm, setShowGuestNameForm] = useState(false);
  const [canStartTimer, setCanStartTimer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [difficultyChangeInfo, setDifficultyChangeInfo] = useState<DifficultyChangeInfo | null>(null);
  const [playerCounts, setPlayerCounts] = useState<Record<Decade, number>>({
    '1970s': 0,
    '1980s': 0,
    '1990s': 0,
    '2000s': 0,
    '2010s': 0,
    '2020s': 0
  });
  const [gameKey, setGameKey] = useState(0);

  // Hooks do jogo
  const { 
    availablePlayers, 
    currentPlayer, 
    isLoading: playersLoading,
    selectRandomPlayer,
    handlePlayerImageFixed,
    playerChangeCount
  } = useDecadePlayerSelection(selectedDecade);

  const {
    score,
    addScore,
    gameOver,
    endGame,
    resetGame,
    attempts,
    incrementAttempts,
    MAX_ATTEMPTS,
    currentStreak,
    maxStreak,
    resetStreak,
    gamesPlayed,
    currentDifficulty,
    difficultyProgress,
    adjustDifficulty
  } = useDecadeGameState();

  const {
    timeRemaining,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer
  } = useDecadeGameTimer({
    initialTime: 60,
    onTimeUp: () => {
      endGame();
      resetStreak();
    }
  });

  const {
    startMetricsTracking,
    incrementCorrectGuesses,
    saveGameData,
    saveToRanking,
    resetMetrics
  } = useSimpleGameMetrics();

  const gameCallbacks = useSimpleGameCallbacks({
    currentPlayer,
    gameActive: !gameOver,
    gameOver,
    score,
    endGame,
    resetStreak,
    saveGameData,
    setGameProgress: () => {}, // Não usado no modo década
    addScore,
    incrementCorrectGuesses,
    incrementAttempts
  });

  const { handleGuess: originalHandleGuess, isProcessingGuess } = useSimpleGameLogic({
    currentPlayer,
    onCorrectGuess: gameCallbacks.handleCorrectGuess,
    onIncorrectGuess: gameCallbacks.handleIncorrectGuess,
    onGameEnd: gameCallbacks.handleGameEnd,
    selectRandomPlayer,
    stopTimer,
    startTimer
  });

  // Skip player hook
  const {
    skipsUsed,
    maxSkips,
    canSkip,
    skipPenalty,
    handleSkip: performSkip,
    resetSkips,
  } = useSkipPlayer({
    maxSkips: 1,
    skipPenalty: 100,
    onSkip: () => {
      selectRandomPlayer();
    }
  });

  // Wrap skip handler
  const handleSkipPlayer = useCallback(() => {
    performSkip();
  }, [performSkip]);
  const lastGuessRef = useRef<string>('');

  // Wrapped handleGuess with funnel tracking and onboarding
  const handleGuess = useCallback((guess: string) => {
    if (!hasTrackedFirstGuess.current && selectedDecade) {
      funnel.trackFirstGuess(`decade_${selectedDecade}`);
      hasTrackedFirstGuess.current = true;
    }
    
    // Avançar onboarding após primeiro palpite
    if (isStepActive('first-guess')) {
      nextStep();
    }
    
    // Store guess for history tracking
    lastGuessRef.current = guess;
    
    originalHandleGuess(guess);
  }, [originalHandleGuess, funnel, selectedDecade, isStepActive, nextStep]);

  // Track game start when timer starts
  useEffect(() => {
    if (isTimerRunning && !hasTrackedGameStart.current && selectedDecade) {
      funnel.trackGameStart(`decade_${selectedDecade}`, currentDifficulty.level);
      hasTrackedGameStart.current = true;
    }
  }, [isTimerRunning, selectedDecade, funnel, currentDifficulty.level]);

  // Track game completion when gameOver changes
  useEffect(() => {
    if (gameOver && !prevGameOverRef.current && selectedDecade) {
      funnel.trackGameCompleted(score, gamesPlayed, `decade_${selectedDecade}`);
      onGameCompleted(score);
      
      // Add failed guess to history (timeout or wrong)
      if (currentPlayer && lastGuessRef.current) {
        addEntry({
          playerName: currentPlayer.name,
          playerImageUrl: currentPlayer.image_url,
          guess: lastGuessRef.current,
          isCorrect: false,
          difficulty: currentDifficulty.label,
          timeRemaining: timeRemaining,
        });
      }
    }
    prevGameOverRef.current = gameOver;
  }, [gameOver, score, gamesPlayed, selectedDecade, funnel, onGameCompleted, currentPlayer, addEntry, currentDifficulty.label, timeRemaining]);

  // Track correct guesses based on streak changes
  useEffect(() => {
    if (currentStreak > prevStreakRef.current && currentPlayer) {
      funnel.trackGuessResult(true, gamesPlayed);
      onCorrectGuess();
      onStreakAchieved(currentStreak);
      
      // Add correct guess to history
      addEntry({
        playerName: currentPlayer.name,
        playerImageUrl: currentPlayer.image_url,
        guess: lastGuessRef.current,
        isCorrect: true,
        difficulty: currentDifficulty.label,
        pointsEarned: Math.floor(5 * (currentDifficulty.multiplier || 1)),
        timeRemaining: timeRemaining,
      });
      
      // Check for newly unlocked achievements
      const currentAchievements = getPlayerAchievements();
      const currentIds = currentAchievements.map(a => a.id);
      const newlyUnlocked = currentIds.filter(id => !previousAchievementsRef.current.includes(id));
      
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(achievementId => {
          const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
          if (achievement) {
            queueNotification(achievement);
          }
        });
      }
      
      previousAchievementsRef.current = currentIds;
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak, gamesPlayed, funnel, getPlayerAchievements, queueNotification, onCorrectGuess, onStreakAchieved, currentPlayer, addEntry, currentDifficulty, timeRemaining]);

  // Track difficulty changes and trigger notification
  const prevDifficultyRef = useRef(currentDifficulty.level);
  useEffect(() => {
    if (currentDifficulty.level !== prevDifficultyRef.current && gamesPlayed > 0) {
      const isLevelUp = currentDifficulty.multiplier > 1;
      setDifficultyChangeInfo({
        oldLevel: prevDifficultyRef.current,
        newLevel: currentDifficulty.level,
        direction: currentDifficulty.level > prevDifficultyRef.current ? 'up' : 'down',
        reason: isLevelUp ? 'Sequência de acertos' : 'Ajuste automático'
      });
    }
    prevDifficultyRef.current = currentDifficulty.level;
  }, [currentDifficulty.level, currentDifficulty.multiplier, gamesPlayed]);

  // Preload next batch of players
  useEffect(() => {
    if (availablePlayers.length > 0 && currentPlayer) {
      prepareNextBatch(availablePlayers, currentPlayer, 2);
    }
  }, [availablePlayers, currentPlayer]);

  // Reset tracking refs, history, and skips when game resets
  useEffect(() => {
    if (!gameOver && gamesPlayed === 0) {
      hasTrackedFirstGuess.current = false;
      hasTrackedGameStart.current = false;
      clearHistory();
      resetSkips();
      setDifficultyChangeInfo(null);
    }
  }, [gameOver, gamesPlayed, clearHistory, resetSkips]);

  // Ativar step de primeiro palpite quando imagem carregar
  useEffect(() => {
    if (isOnboardingActive && imageLoaded && isTimerRunning && !isStepActive('first-guess') && !isStepActive('timer-explanation')) {
      goToStep('first-guess');
    }
  }, [isOnboardingActive, imageLoaded, isTimerRunning, goToStep, isStepActive]);

  // Detecção de DevTools - encerra o jogo se detectado
  const handleDevToolsDetected = useCallback(() => {
    if (!gameOver && selectedDecade) {
      gameToasts.showDevToolsDetected();
      endGame();
      resetStreak();
    }
  }, [gameOver, selectedDecade, gameToasts, endGame, resetStreak]);

  useDevToolsDetection(handleDevToolsDetected, !gameOver && !!selectedDecade);

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

  // Carregar contadores de jogadores por década
  useEffect(() => {
    const loadPlayerCounts = async () => {
      try {
        const availableDecades = await decadePlayerService.getAvailableDecades();
        const counts: Record<Decade, number> = {
          '1970s': 0,
          '1980s': 0,
          '1990s': 0,
          '2000s': 0,
          '2010s': 0,
          '2020s': 0
        };
        
        for (const decade of availableDecades) {
          const players = await decadePlayerService.getPlayersByDecade(decade);
          counts[decade] = players.length;
        }
        
        setPlayerCounts(counts);
      } catch (error) {
        logger.error('Error loading player counts for decades');
      }
    };

    loadPlayerCounts();
  }, []);

  // Verificar se precisa mostrar formulário de nome
  useEffect(() => {
    if (selectedDecade && !user && !guestName && !showGuestNameForm && availablePlayers.length > 0) {
      setShowGuestNameForm(true);
      // Ativar step de input de nome no onboarding
      if (isOnboardingActive) {
        goToStep('name-input');
      }
    }
  }, [selectedDecade, user, guestName, showGuestNameForm, availablePlayers, isOnboardingActive, goToStep]);

  // Iniciar jogo quando jogador é selecionado e usuário está pronto
  useEffect(() => {
    if (currentPlayer && !gameOver && (user || guestName)) {
      startMetricsTracking();
      // O timer só vai começar quando a imagem for carregada (handlePlayerImageFixed)
    }
  }, [currentPlayer, gameOver, user, guestName, startMetricsTracking]);

  const handleDecadeSelect = (decade: Decade) => {
    setSelectedDecade(decade);
    resetGame();
    resetMetrics();
    resetTimer();
    setGameKey(prev => prev + 1);
    // Não iniciar timer aqui, esperar o nome do convidado ou estar autenticado
  };

  const handleGuestNameSubmit = (name: string) => {
    setGuestName(name);
    setShowGuestNameForm(false);
    setCanStartTimer(true);
    
    // Avançar para próximo step do onboarding
    if (isStepActive('name-input')) {
      nextStep();
    }
  };

  const handleBackToSelection = () => {
    setSelectedDecade(null);
    resetGame();
    resetMetrics();
    resetTimer();
  };

  const handleResetGame = () => {
    resetGame();
    resetMetrics();
    resetTimer();
    setGameKey(prev => prev + 1);
  };

  const forceRefresh = () => {
    setGameKey(prev => prev + 1);
  };

  const handleImageFixed = useCallback(() => {
    setImageLoaded(true);
    handlePlayerImageFixed();
  }, [handlePlayerImageFixed]);

  // Iniciar timer somente quando nome foi salvo E imagem carregada E tutorial fechado
  const tutorialCompleted = !isOnboardingActive;
  
  useEffect(() => {
    if (canStartTimer && imageLoaded && currentPlayer && !gameOver && !isTimerRunning && tutorialCompleted) {
      startTimer();
    }
  }, [canStartTimer, imageLoaded, currentPlayer, gameOver, isTimerRunning, startTimer, tutorialCompleted]);

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

  const handleClearDifficultyNotification = useCallback(() => {
    setDifficultyChangeInfo(null);
  }, []);

  // Keyboard shortcuts (Esc to skip, R to restart)
  const { shortcuts } = useGameKeyboardShortcuts({
    onSkip: canSkip ? handleSkipPlayer : undefined,
    onRestart: handleResetGame,
    disabled: !isTimerRunning,
    gameOver,
    isProcessing: isProcessingGuess,
  });

  // Se nenhuma década foi selecionada, mostrar página de seleção
  if (!selectedDecade) {
    return (
      <DecadeSelectionPage 
        onDecadeSelect={handleDecadeSelect}
        playerCounts={playerCounts}
      />
    );
  }

  const decadeInfo = getDecadeInfo(selectedDecade);

  return (
    <>
      <SEOManager 
        title={`Quiz por Década - ${currentDifficulty.label} | Lendas do Flu`}
        description="Explore as diferentes eras do Fluminense! Quiz organizado por décadas."
        schema="Game"
      />
      
      {/* Debug Info - only in dev */}
      <DebugInfo
        show={showDebug}
        imageUrl={currentPlayer?.image_url}
      />
      
      {/* Adaptive Progression Notification */}
      {difficultyChangeInfo && (
        <AdaptiveProgressionNotification
          changeInfo={difficultyChangeInfo}
          onClose={handleClearDifficultyNotification}
        />
      )}

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
            onCancel={handleBackToSelection}
          />
        </CoachMark>
      )}
      
      <BaseGameContainer
        onBack={handleBackToSelection}
        backLabel="Décadas"
        title={decadeInfo.label}
        subtitle={decadeInfo.description}
        icon={decadeInfo.icon}
        iconColor={decadeInfo.color}
        isLoading={playersLoading}
        loadingMessage={`Carregando jogadores dos ${decadeInfo.label}...`}
        hasPlayers={availablePlayers.length > 0}
        emptyStateMessage={`Não há jogadores cadastrados para os ${decadeInfo.label}.`}
        emptyStateAction={
          <Button onClick={handleBackToSelection}>
            Escolher outra década
          </Button>
        }
        playerCount={availablePlayers.length}
        onReset={handleResetGame}
        showReset={true}
      >
        {/* Timer com CoachMark */}
        {/* Timer com CoachMark */}
        <CoachMark
          step="timer-explanation"
          title="Fique de Olho no Tempo!"
          description="Você tem 60 segundos neste modo. Acerte o máximo de jogadores que conseguir!"
          position="bottom"
        >
          <div data-testid="timer-display" className="text-center text-display-subtitle text-primary mb-4">
            ⏱️ {timeRemaining}s
          </div>
        </CoachMark>
        
        {/* Score display para testes E2E */}
        <div data-testid="score-display" className="text-center text-lg font-bold text-primary mb-4">
          Pontos: {score}
        </div>

        {/* GuessForm com CoachMark via GameContainer */}
        <CoachMark
          step="first-guess"
          title="Faça seu Palpite!"
          description="Digite o nome do jogador que você vê na imagem. Você pode digitar apelidos também!"
          position="top"
        >
          <GameContainer
            currentPlayer={currentPlayer}
            gameKey={gameKey.toString()}
            attempts={attempts}
            score={score}
            gameOver={gameOver}
            timeRemaining={timeRemaining}
            MAX_ATTEMPTS={MAX_ATTEMPTS}
            handleGuess={handleGuess}
            selectRandomPlayer={selectRandomPlayer}
            handlePlayerImageFixed={handleImageFixed}
            isProcessingGuess={isProcessingGuess}
            hasLost={gameOver}
            startGameForPlayer={() => {}}
            isTimerRunning={isTimerRunning}
            gamesPlayed={gamesPlayed}
            currentStreak={currentStreak}
            maxStreak={maxStreak}
            forceRefresh={forceRefresh}
            playerChangeCount={playerChangeCount}
            gameProgress={{ 
              currentRound: gamesPlayed + 1,
              currentStreak: currentStreak,
              allowedDifficulties: ['muito_facil', 'facil', 'medio', 'dificil', 'muito_dificil'],
              nextDifficultyThreshold: difficultyProgress
            }}
            currentDifficulty={{ 
              label: currentDifficulty.label, 
              level: currentDifficulty.level,
              color: 'bg-flu-grena',
              icon: '🎯',
              multiplier: currentDifficulty.multiplier
            }}
          />
          
          {/* Skip Player Button */}
          <div className="flex justify-center mt-4">
            <SkipPlayerButton
              onSkip={handleSkipPlayer}
              skipsUsed={skipsUsed}
              maxSkips={maxSkips}
              canSkip={canSkip}
              skipPenalty={skipPenalty}
              disabled={gameOver || isProcessingGuess || !isTimerRunning}
            />
          </div>
        </CoachMark>
        {/* Guess History Panel */}
        {history.length > 0 && (
          <GuessHistoryPanel
            history={history}
            stats={getStats()}
            compact
            className="mt-4"
          />
        )}
        
        {/* Keyboard Shortcuts Hint */}
        <KeyboardShortcutsHint 
          shortcuts={shortcuts} 
          show={!showGuestNameForm && currentPlayer !== null}
          className="mt-4"
        />
      </BaseGameContainer>
    
      <GameOverDialog
        open={gameOver}
        onClose={() => {}}
        playerName={currentPlayer?.name || ''}
        score={score}
        onResetScore={handleResetGame}
        isAuthenticated={!!user}
        onSaveToRanking={saveToRanking}
        gameMode="classic"
        difficultyLevel={currentDifficulty.label}
        unlockedAchievementIds={getPlayerAchievements().map(a => a.id)}
      />

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={currentNotification}
        onClose={dismissNotification}
      />
    </>
  );
};

export default DecadeGameContainer;
