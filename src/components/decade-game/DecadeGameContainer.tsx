import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DecadeSelectionPage } from './DecadeSelectionPage';
import { GameContainer } from '@/components/guess-game/GameContainer';
import { BaseGameContainer } from '@/components/guess-game/BaseGameContainer';
import { GuestNameForm } from '@/components/guess-game/GuestNameForm';
import { GameOverDialog } from '@/components/guess-game/GameOverDialog';
import { 
  useDecadePlayerSelection, 
  useSimpleGameLogic, 
  useSimpleGameCallbacks, 
  useSimpleGameMetrics,
  useDecadeGameTimer,
  useDecadeGameState 
} from '@/hooks/game';
import { useAuth } from '@/hooks/auth';
import { useAchievementSystem } from '@/components/achievements/AchievementSystemProvider';
import { useFunnelAnalytics } from '@/hooks/use-funnel-analytics';
import { useChallengeProgress } from '@/hooks/use-challenge-progress';
import { Decade } from '@/types/decade-game';
import { decadePlayerService } from '@/services/decadePlayerService';
import { getDecadeInfo } from '@/data/decades';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { useDevToolsDetection } from '@/hooks/use-devtools-detection';
import { useToast } from '@/hooks/use-toast';
import { clearAllImageCache } from '@/utils/player-image/cache';
import { CoachMark, useOnboarding } from '@/components/onboarding';

export const DecadeGameContainer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPlayerAchievements } = useAchievementSystem();
  const { toast } = useToast();
  const funnel = useFunnelAnalytics();
  const { isOnboardingActive, goToStep, nextStep, isStepActive } = useOnboarding();
  const { onCorrectGuess, onStreakAchieved, onGameCompleted } = useChallengeProgress();
  
  // Tracking refs
  const hasTrackedFirstGuess = useRef(false);
  const hasTrackedGameStart = useRef(false);
  const prevGameOverRef = useRef(false);
  const prevStreakRef = useRef(0);
  
  const [selectedDecade, setSelectedDecade] = useState<Decade | null>(null);
  const [guestName, setGuestName] = useState<string>("");
  const [showGuestNameForm, setShowGuestNameForm] = useState(false);
  const [canStartTimer, setCanStartTimer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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
    }
    prevGameOverRef.current = gameOver;
  }, [gameOver, score, gamesPlayed, selectedDecade, funnel]);

  // Track correct guesses based on streak changes
  useEffect(() => {
    if (currentStreak > prevStreakRef.current) {
      funnel.trackGuessResult(true, gamesPlayed);
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak, gamesPlayed, funnel]);

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
    if (!gameOver && selectedDecade) {
      toast({
        variant: "destructive",
        title: "Jogo Encerrado",
        description: "Uso de ferramentas de inspeção detectado. O jogo foi finalizado.",
      });
      endGame();
      resetStreak();
    }
  }, [gameOver, selectedDecade, toast, endGame, resetStreak]);

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

  // Iniciar timer somente quando nome foi salvo E imagem carregada
  useEffect(() => {
    if (canStartTimer && imageLoaded && currentPlayer && !gameOver && !isTimerRunning) {
      startTimer();
    }
  }, [canStartTimer, imageLoaded, currentPlayer, gameOver, isTimerRunning, startTimer]);

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
        <CoachMark
          step="timer-explanation"
          title="Fique de Olho no Tempo!"
          description="Você tem 60 segundos neste modo. Acerte o máximo de jogadores que conseguir!"
          position="bottom"
        >
          <div className="text-center text-2xl font-bold text-primary mb-4">
            ⏱️ {timeRemaining}s
          </div>
        </CoachMark>

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
            } as any}
          />
        </CoachMark>
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
    </>
  );
};

export default DecadeGameContainer;
